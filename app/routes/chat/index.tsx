import React from "react";
import { useNavigate } from "react-router";
import { requiredAuth } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

export const clientLoader = requiredAuth;

export default function Chat() {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const sendRequest = async () => {
    if (!divRef.current) {
      console.error("Div reference is not set.");
      return;
    }

    // if the div is empty, show an error
    if (divRef.current.innerText.trim() === "") {
      setError("Please enter some content in the chat.");
      return;
    }

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
    const data = (await response.json()) as {id: string};
    console.log("Response from server:", data);
    setError(null); // Clear any previous errors
    const state= {
      content: divRef.current.innerText, // Get the content of the div
    };
    navigate(`/chat/${data.id}`, {
      state,
    }); // Navigate to the chat room page
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
          className={cn(
            "mt-4 px-4 py-2 text-white rounded focus:outline-none border border-gray-30"
          )}
        >
          Send Request
        </button>
      )}
    </div>
  );
}
