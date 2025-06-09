import type { Route } from "./+types/home";
import { useChat, useCompletion } from "@ai-sdk/react";
import { useDeferredValue } from "react";
import Markdown from "react-markdown";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, status } =
    useChat();
  const deferredMessages = useDeferredValue(messages);

  return (
    <>
      {deferredMessages.map((message) => (
        <div className="message" key={message.id}>
          <Markdown key={message.id}>{message.content}</Markdown>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
      <p>status: {status}</p>
    </>
  );
}
