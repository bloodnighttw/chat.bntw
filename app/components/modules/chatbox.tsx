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
import useLocalStorage from "~/lib/hooks/localstorage";

interface ChatBoxProps {
  className?: string;
  submit?: (text: string) => void;
  onInput?: (text: string) => void;
  // if it's not empty, it will show an error message
  errorMessage?: string;
  // default is false
  loading?: boolean;
}

export default function ChatBox(props: ChatBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [preferModel, _setPreferences] = useLocalStorage<
    Record<string, string>
  >("provider-model", {});
  const [preferProvider, setPreferProvider] = useLocalStorage<
    keyof Models | null
  >("provider", null);

  // you can only set 1 key-value pair at one life cycle
  const setPreferModel = (key: string, value: string) => {
    _setPreferences({ ...preferModel, [key]: value });
  };

  const { data, isLoading } = useAPI<Models>(
    "/chat",
    (res) => {
      const missingPreference: Record<string, string> = {};
      Object.keys(res).forEach((p) => {
        if (!preferModel[p]) {
          // set the default model for the provider
          const lastModel =
            res[p as keyof Models][res[p as keyof Models].length - 1];
          missingPreference[p] = lastModel;
        }
      });

      _setPreferences({
        ...preferModel,
        ...missingPreference,
      });
    },
    {
      dedupingInterval: 1000 * 60 * 60, // 1 hour
    }
  );

  const handleSubmit = () => {
    // get the content of the div
    if (!ref.current) {
      console.error("Div reference is not set.");
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
    props.submit?.(content);
  };

  const boxClickToFocus = () => {
    ref.current?.focus();
  };

  return (
    <Card
      className={cn(
        props.className,
        "p-3 w-[1200px] gap-2",
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
              {preferProvider ? preferProvider : "Select Provider"}
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
                    checked={preferProvider === p}
                    onClick={() => setPreferProvider(p as keyof Models)}
                  >
                    {p}
                  </DropdownMenuCheckboxItem>
                ))
            }
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="h-6 text-sm ml-2">
              {preferProvider && preferModel[preferProvider]
                ? preferModel[preferProvider]
                : "Select Model"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="start">
            <DropdownMenuLabel className="text-center">Model</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {data &&
              preferProvider &&
              data[preferProvider].map((model) => (
                <DropdownMenuCheckboxItem
                  key={model}
                  className="text-sm"
                  checked={preferModel[preferProvider] === model}
                  onClick={() => setPreferModel(preferProvider, model)}
                >
                  {model}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isLoading && (
          <div className="ml-2 text-sm text-gray-500">Loading models...</div>
        )}
        <Button
          variant="secondary"
          className="ml-auto h-6"
          onClick={handleSubmit}
        >
          <SendHorizonal className="size-3" />
        </Button>
      </div>
    </Card>
  );
}
