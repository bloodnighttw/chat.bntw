import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { createDataStream, streamText, type UIMessage } from "ai";
import { Hono } from "hono";
import { stream } from "hono/streaming";

export const chat = new Hono().basePath("/chat");

chat.post("/", async (c) => {
  const { messages }: { messages: UIMessage[] } = await c.req.json();
  const result = streamText({
    model: google("gemini-1.5-flash"),
    // model: openai("gpt-4o-mini"),
    messages,
  });

  // Mark the response as a v1 data stream:
  c.header("X-Vercel-AI-Data-Stream", "v1");
  c.header("Content-Type", "text/plain; charset=utf-8");

  c.header("Transfer-Encoding", "chunked");
  c.header("Connection", "keep-alive");

  return stream(c, stream => stream.pipe(result.toDataStream()));
});
