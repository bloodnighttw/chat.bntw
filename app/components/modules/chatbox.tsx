import { cn } from "~/lib/utils";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { SendHorizonal } from "lucide-react";
import { useRef } from "react";

interface ChatBoxProps {
  className?: string;
  submit?: (text: string) => void;
  onInput?: (text: string) => void;
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
    // call the submit function with the content
    props.submit?.(content);
    // clean the content of the div
  };

  const boxClickToFocus = () => {
    ref.current?.focus();
  };

  return (
    <Card
      className={cn(props.className, "p-4 w-[1200px]")}
      onClick={boxClickToFocus}
    >
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
