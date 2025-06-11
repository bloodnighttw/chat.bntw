import { Hono } from "hono";
import { db } from "./db";
import { chatRoom, chatToUser } from "./db/chat";
import { auth } from "~/auth";
import { z } from "zod/v4";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToCoreMessages, streamText, type CoreMessage, type UIMessage } from "ai";
import { stream } from "hono/streaming";
import { eq, and } from "drizzle-orm";
import { messageToDb } from "./db/chat/message";

export const chat = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().basePath("/chat");

// create a new chat and return the chat uuid
chat.post("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session || !session.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // create a new chat room
  const ids = await db
    .insert(chatRoom)
    .values({})
    .returning({ id: chatRoom.uuid });

  // check if the chat room was created successfully
  if (ids.length === 0) {
    return c.json({ error: "Failed to create chat room" }, 500);
  }

  // add the user to the chat room
  const userId = session.user.id;
  const chatUUID = ids[0].id!;
  const result = await db.insert(chatToUser).values({
    chatUUID,
    userId,
    level: 0, // default owner level, since the user just created the chat room yet.
  });

  // check if the user was added to the chat room successfully
  if (result.rowCount === 0) {
    return c.json({ error: "Failed to add user to chat room" }, 500);
  }
  
  // return the chat uuid
  return c.json({ id: ids[0].id });
});

const chatStream = z.object({
  provider: z.union([z.literal("openai"), z.literal("google")]),
  model: z.union([
    z.literal("gpt-3.5-turbo"),
    z.literal("gpt-4"),
    z.literal("gemini-1.5-flash"),
    z.literal("gemini-1.5-pro"),
  ]),
});

export type ChatStream = z.infer<typeof chatStream>;

function createProvider(provider: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({
        compatibility: "strict",
      });
    case "google":
      return createGoogleGenerativeAI();
    default:
      throw new Error("Unsupported provider");
  }
}

function storeToDb(data: CoreMessage[]) {
  for (const message of data) {
    // Here you would implement the logic to store the message in the database
    // For example, you could insert it into a messages table
    console.log("Storing message:", message);
  }  
}

chat.post("/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session || !session.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const parsedBody = chatStream.safeParse(body);

  if (!parsedBody.success) {
    console.error("Invalid request body:", parsedBody.error);
    return c.json({ error: "Invalid request body" }, 400);
  }

  // check if the chat room exists and the user is a member of the chat room
  const chatId = c.req.param("id");
  const chatRoomExists = await db
    .select()
    .from(chatRoom)
    .where(eq(chatRoom.uuid, chatId))
    .then((res) => res.length > 0);

  if (!chatRoomExists) {
    return c.json({ error: "Chat room does not exist" }, 404);
  }

  const userId = session.user.id;
  const userIsMember = await db
    .select()
    .from(chatToUser)
    .where(
      and(
        eq(chatToUser.userId, userId),
        eq(chatToUser.chatUUID, chatId)
      )
    )
    .then((res) => res.length > 0);

  if (!userIsMember) {
    return c.json({ error: "User is not a member of the chat room" }, 403);
  }

  const { messages }: { messages: UIMessage[] } = body;

  // console.log("Received messages:", JSON.stringify(messages, null, 2));

  const provider = createProvider(parsedBody.data.provider);
  const model = parsedBody.data.model;

  const result = streamText({
    model: provider(model),
    messages,
    onFinish: async (e) => {
      const response = e.response.messages
      await messageToDb({ chatId, coreMessages: response})
      console.log("Message stored in database:", response);
    }
  });

  c.header("Content-Type", "text/plain; charset=utf-8");
  c.header("Transfer-Encoding", "chunked");
  c.header("Connection", "keep-alive");

  return stream(c, (stream) => {return stream.pipe(result.toDataStream())});
});
