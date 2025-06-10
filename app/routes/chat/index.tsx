import React from "react";
import { requiredAuth } from "~/lib/auth-client";
import type { ChatRoom } from "~/server/db/chat";

export const clientLoader = requiredAuth;

export default function Chat() {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const sendRequest = async () => {
    if (!divRef.current) {
      console.error("Div reference is not set.");
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: divRef.current?.innerText || "",
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "An error occurred");
      return;
    }
    const data = await response.json() as ChatRoom;
    console.log("Response from server:", data);
    setError(null); // Clear any previous errors
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2">
      <h1 className="text-2xl font-bold">Chat Page</h1>
      <div
        contentEditable
        ref={divRef}
        className="mt-4 p-4 border rounded-lg w-full max-w-md"
      />
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {isLoading ? (
        <div className="mt-4 text-blue-500">Loading...</div>
      ) : (
        <button
          onClick={sendRequest}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send Request
        </button>
      )}
    </div>
  );
}
