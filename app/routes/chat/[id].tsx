import { useLocation } from "react-router";
import type { ChatMessageData } from "./type";
import { useChat } from "@ai-sdk/react";
import { useDeferredValue, useEffect } from "react";
import Markdown from "react-markdown";
import type { Route } from "./+types/[id]";
import { Button } from "~/components/ui/button";
import { requiredAuth } from "~/lib/auth-client";
import type { ChatStream } from "~/server/chat";

export const clientLoader = requiredAuth;

export default function Chat({params}: Route.ComponentProps) {
  const location = useLocation();
  const state: ChatMessageData | null =
    location.state as ChatMessageData | null;

  const appendBody:ChatStream = {
    provider: "google",
    model: "gemini-1.5-flash",
  }

  const { messages, handleInputChange, handleSubmit, input } = useChat({
    api: `/api/chat/${params.id}`,
    id: params.id,
    initialInput: state?.content || "",
    body: {
      provider: "google",
      model: "gemini-1.5-flash",
    },
  });

  useEffect(() => {
    if (state) {
      handleSubmit();
    }
  }, [state]);

  return (
    <div className="w-[1200px] mx-auto">
      <div className="flex h-full w-full  items-center justify-start">
        <h1 className="text-2xl font-bold">Chat Room</h1>
      </div>
      {messages.map((message) => (
        <div className="prose prose-invert prose-zinc w-full max-w-[1200px]" key={message.id}>
          <Markdown key={message.id}>{message.content}</Markdown>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <textarea name="prompt" value={input} onChange={handleInputChange} className="w-[1200px]"/>
      </form>
      <Button onClick={handleSubmit} className="mt-4">
        Send Message
      </Button>
    </div>
  );
}
