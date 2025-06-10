import { useLocation } from "react-router";
import type { ChatMessageData } from "./type";

export default function Chat() {
  
  const location = useLocation();
  const state: ChatMessageData | null = location.state as ChatMessageData | null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Chat Room</h1>
      <p> old content: {state?.content}</p>
    </div>
  );
}