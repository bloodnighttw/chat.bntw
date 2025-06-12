import { useLocation } from "react-router";
import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import type { Route } from "./+types/[id]";
import { requiredAuth } from "~/lib/auth-client";
import type { ChatStream } from "~/server/chat";
import { useApi as useAPI } from "~/lib/hook";
import type { Message } from "ai";
import ChatBox from "~/components/modules/chatbox";
import remarkGFM from "remark-gfm";

export const clientLoader = requiredAuth;

export default function Chat({ params }: Route.ComponentProps) {
  const location = useLocation();
  const state = (location.state["content"] as string) ?? "";

  const appendBody: ChatStream = {
    provider: "google",
    model: "gemini-2.0-flash",
  };

  const {
    messages,
    handleSubmit,
    setMessages,
    setInput,
    status,
  } = useChat({
    api: `/api/chat/${params.id}`,
    id: params.id,
    body: appendBody,
    initialInput: state,
  });

  const { data, error, isLoading } = useAPI<Message[]>(
    `/chat/${params.id}`,
    (res) => {
      if (res) {
        if (res.length === 0) {
          handleSubmit();
        } else {
          setInput("");
          setMessages(res);
        }
      }
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        Error: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        No data found
      </div>
    );
  }

  return (
    <div className="w-[1200px] mx-auto">
      <div className="flex h-full w-full  items-center justify-start">
        <h1 className="text-2xl font-bold">Chat Room</h1>
      </div>
      {messages.map((message) => (
        <div
          className="prose prose-invert prose-zinc w-full max-w-[1200px]"
          key={message.id}
        >
          <Markdown key={message.id} remarkPlugins={[remarkGFM]}>{message.content}</Markdown>
        </div>
      ))}

      <ChatBox
        submit={() => handleSubmit()}
        onInput={(text) => setInput(text)}
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Status: {status}</h2>
      </div>
    </div>
  );
}
