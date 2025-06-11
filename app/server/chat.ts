import { Hono } from "hono";
import { db } from "./db";
import { chatRoom } from "./db/chat";
import { auth } from "~/auth";
import { z } from "zod/v4";
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, type UIMessage } from 'ai';
import { stream } from "hono/streaming";

export const chat = (new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}>()).basePath("/chat");

// create a new chat and return the chat uuid
chat.post("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session || !session.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const ids = await db.insert(chatRoom).values({}).returning({id: chatRoom.uuid})
  
  // return the chat uuid
  return c.json({ id: ids[0].id });
});

const chatStream = z.object({
  provider: z.union([
    z.literal("openai"),
    z.literal("google"),
  ]),
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
        compatibility: 'strict'
      });
    case "google":
      return createGoogleGenerativeAI();
    default:
      throw new Error("Unsupported provider");
  }
}

chat.post("/stream", async (c) => {

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

   const { messages }: { messages: UIMessage[] } = body;
   console.log("Messages received:", messages);
   
  const provider = createProvider(parsedBody.data.provider);
  const model = parsedBody.data.model;

  const result = streamText({
    model: provider(model),
    messages
  })

  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header("Transfer-Encoding", "chunked");
  c.header("Connection", "keep-alive");
  
  return stream(c, stream => stream.pipe(result.toDataStream()));
});


