import { Hono } from "hono";
import { db } from "./db";
import { chatRoom } from "./db/chat";

export const chat = new Hono().basePath("/chat");



// create a new chat and return the chat uuid
chat.post("/", async (c) => {

  const ids = await db.insert(chatRoom).values({}).returning({id: chatRoom.id})
  
  // return the chat uuid
  return c.json({ id: ids[0].id });
});
