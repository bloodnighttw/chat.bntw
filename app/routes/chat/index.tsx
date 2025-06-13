import React from "react";
import { useNavigate } from "react-router";
import ChatBox from "~/components/modules/chatbox";
import { requiredAuth } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

export const clientLoader = requiredAuth;

export default function Chat() {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const sendRequest = async (content: string) => {

    setIsLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "An error occurred");
      return;
    }
    const data = (await response.json()) as { id: string };
    console.log("Response from server:", data);
    setError(null); // Clear any previous errors
    const state = {
      content: content, // Get the content of the div
    };
    console.log(state);
    navigate(`/chat/${data.id}`, {
      state,
    }); // Navigate to the chat room page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2">
      <h1 className="text-2xl font-bold">Chat Page</h1>
      <ChatBox
        className={cn(
          "mt-4 p-4 border rounded-lg w-full",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        submit={sendRequest}
      />
      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
}
