import { cn } from "~/lib/utils";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { SendHorizonal } from "lucide-react";
import { useRef } from "react";
import { useAPI } from "~/lib/hooks/api";
import type { Models } from "~/server/chat";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useModel, useProvider } from "~/lib/hooks/model";

interface ChatBoxProps {
  className?: string;
  submit?: (text: string, provider: keyof Models, model: string) => void;
  onInput?: (text: string) => void;
  // if it's not empty, it will show an error message
  errorMessage?: string;
  // default is false
  loading?: boolean;
  disabled?: boolean;
}

export default function ChatBox(props: ChatBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [provider, setProvider] = useProvider();
  const [model, setModel] = useModel();

  const { data, isLoading } = useAPI<Models>("/chat", undefined, {
    dedupingInterval: 1000 * 60 * 60, // 1 hour
  });

  const handleSubmit = () => {
    // get the content of the div
    if (!ref.current) {
      console.error("Div reference is not set.");
      return;
    }

    // if no provider is selected, show an error
    if (!provider) {
      console.error("No provider selected.");
      return;
    }

    // if no model is selected, show an error
    if (!model) {
      console.error("No model selected for the provider.");
      return;
    }

    const content = ref.current.innerText.trim();
    if (content === "") {
      console.error("Content is empty.");
      return;
    }

    // clean the content in div
    ref.current.innerText = ""; // clear the content after submission

    // call the submit function with the content
    props.submit?.(content, provider, model);
  };

  const boxClickToFocus = () => {
    ref.current?.focus();
  };

  return (
    <Card
      className={cn(
        props.className,
        "p-3 max-w-4xl gap-2 mt-4",
        props.loading && "opacity-90 cursor-not-allowed"
      )}
      onClick={boxClickToFocus}
    >
      {props.errorMessage && props.errorMessage.length > 0 && (
        <div className="rounded bg-red-900 px-2">{props.errorMessage}</div>
      )}
      <div
        contentEditable
        ref={ref}
        className="outline-0 w-full break-normal wrap-break-word"
        // on contentEditable innerText change
        role="textbox"
        onInput={(e) => {
          const text = (e.target as HTMLDivElement).innerText;
          props.onInput?.(text);
        }}
        suppressContentEditableWarning={true}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex h-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="h-6 text-sm">
              {provider ?? "Select Provider"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-24" align="start">
            <DropdownMenuLabel className="text-center">
              Provider
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {
              // get the providers from the data, which is in the key of the data object
              data &&
                Object.keys(data).map((p) => (
                  <DropdownMenuCheckboxItem
                    key={p}
                    className="text-sm"
                    checked={provider === p}
                    onClick={() => setProvider(p as keyof Models)}
                  >
                    {p}
                  </DropdownMenuCheckboxItem>
                ))
            }
          </DropdownMenuContent>
        </DropdownMenu>

        {provider && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="h-6 text-sm ml-2">
                {model ?? "Select Model"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuLabel className="text-center">
                Model
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {data &&
                data[provider!].map((m) => (
                  <DropdownMenuCheckboxItem
                    key={m}
                    className="text-sm"
                    checked={model === m}
                    onClick={() => setModel(m)}
                  >
                    {m}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="secondary"
          className="ml-auto h-6"
          onClick={handleSubmit}
          disabled={props.disabled || isLoading || props.loading || !provider || !model}
        >
          <SendHorizonal className="size-3" />
        </Button>
      </div>
    </Card>
  );
}
