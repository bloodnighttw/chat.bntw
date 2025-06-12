import { cn } from "~/lib/utils";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { SendHorizonal } from "lucide-react";
import { useRef } from "react";

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
