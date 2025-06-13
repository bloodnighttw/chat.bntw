import { useLocation } from "react-router";
import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import type { Route } from "./+types/[id]";
import { requiredAuth } from "~/lib/auth-client";
import type { ChatStream, Models } from "~/server/chat";
import type { Message } from "ai";
import ChatBox from "~/components/modules/chatbox";
import remarkGFM from "remark-gfm";
import { useAPI } from "~/lib/hooks/api";
import { useCallback, useEffect, useRef } from "react";
import { useModel, useProvider } from "~/lib/hooks/model";
import { cn } from "~/lib/utils";

export const clientLoader = requiredAuth;

export default function Chat({ params }: Route.ComponentProps) {
  const location = useLocation();
  const state = (location.state["content"] as string) ?? "";
  const [provider, _setProvider] = useProvider();
  const [model, _setModel] = useModel();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, handleSubmit, setMessages, setInput, status } = useChat({
    api: `/api/chat/${params.id}`,
    id: params.id,
    initialInput: state,
  });

  const { data, error, isLoading } = useAPI<Message[]>(
    `/chat/${params.id}`,
    (res) => {
      if (res) {
        if (res.length === 0) {
          handleSubmit(undefined, { body: { provider, model } });
        } else {
          setInput("");
          setMessages(res);
        }
      }
    }
  );

  const handleActuallySubmit = useCallback(
    (_: string, provider: keyof Models, m: string) => {
      const appendBody: ChatStream = {
        provider: provider,
        model: m,
      };

      handleSubmit(undefined, {
        body: appendBody,
      });
    },
    [handleSubmit]
  );

  const handleInput = useCallback(
    (text: string) => {
      setInput(text);
    },
    [setInput]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const isAtBottom = useCallback(() => {
    const threshold = 100;
    return window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold;
  }, []);

  useEffect(() => {
    if (messages.length > 0 && isAtBottom()) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isAtBottom]);

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
    <div className="max-w-4xl mx-auto">
      <div className="flex h-full w-full  items-center justify-start">
        <h1 className="text-2xl font-bold">Chat Room</h1>
      </div>
      {messages.map((message) => (
        <div
          className="prose prose-invert prose-zinc w-full max-w-4xl flex gap-x-2"
          key={message.id}
        >
          <div className={cn(
            "rounded-full bg-amber-50 size-6.5 flex-none sticky top-4",
            message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-500 text-white"
          )}>{message.role[0]}</div>
          <div className="flex-1 *:first:mt-0">
            <Markdown key={message.id} remarkPlugins={[remarkGFM]}>
              {message.content}
            </Markdown>
          </div>
        </div>
      ))}
      {/* ref for bottom check */}
      <div ref={messagesEndRef} />

      <ChatBox
        submit={handleActuallySubmit}
        onInput={handleInput}
        className="sticky bottom-2"
        loading={isLoading || status === "submitted" || status === "streaming"}
      />
    </div>
  );
}
