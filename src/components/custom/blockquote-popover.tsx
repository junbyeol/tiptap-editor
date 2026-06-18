import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card";
import { DoubleQuotesIcon } from "@/components/tiptap-icons/double-quotes-icon";
import { AlignJustifyIcon } from "@/components/tiptap-icons/align-justify-icon";
import type { BlockquoteStyle } from "@/tiptap/extensions/BlockquoteKit";

const PREVIEW_LINE = {
  height: "2px",
  borderRadius: "2px",
  background: "var(--tt-gray-light-a-300)",
} as const;

function BlockquotePreview({ style }: { style: BlockquoteStyle }) {
  if (style === "quote") {
    return (
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          width: "80%",
        }}
      >
        <DoubleQuotesIcon
          style={{
            width: "14px",
            height: "14px",
            color: "var(--tt-gray-light-a-500)",
          }}
        />
      </span>
    );
  }
  if (style === "bar") {
    return (
      <span
        style={{
          display: "flex",
          gap: "2px",
          width: "80%",
          alignItems: "center",
        }}
      >
        <span
          style={{
            height: "12px",
            width: "2px",
            borderRadius: "2px",
            background: "var(--tt-gray-light-a-500)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            flex: 1,
            alignItems: "flex-start",
          }}
        >
          <span style={{ ...PREVIEW_LINE, width: "100%" }} />
          <span style={{ ...PREVIEW_LINE, width: "70%" }} />
        </span>
      </span>
    );
  }
  if (style === "box") {
    return (
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          width: "80%",
          border: "1px dotted var(--tt-gray-light-a-400)",
          borderRadius: "3px",
          padding: "6px 8px",
          backgroundColor: "var(--tt-gray-light-a-100)",
        }}
      ></span>
    );
  }
}

interface BlockquotePopoverProps {
  editor: Editor;
}

export function BlockquotePopover({ editor }: BlockquotePopoverProps) {
  const [open, setOpen] = useState(false);

  const activeStates = useEditorState({
    editor,
    selector: ({ editor }) => ({
      quote: editor.isActive("blockquote", { style: "quote" }),
      bar: editor.isActive("blockquote", { style: "bar" }),
      box: editor.isActive("blockquote", { style: "box" }),
    }),
  });

  const handleSelect = (style: BlockquoteStyle) => {
    const isCurrentStyle = activeStates[style];

    if (isCurrentStyle) {
      editor.chain().focus().toggleBlockquote().run();
    } else if (editor.isActive("blockquote")) {
      editor.chain().focus().updateAttributes("blockquote", { style }).run();
    } else {
      editor
        .chain()
        .focus()
        .toggleBlockquote()
        .updateAttributes("blockquote", { style })
        .run();
    }
    setOpen(false);
  };

  const handleParagraph = () => {
    editor.chain().focus().clearNodes().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button data-style="ghost" tooltip="인용구 삽입">
          <DoubleQuotesIcon className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Card>
          <CardBody>
            <CardItemGroup orientation="vertical">
              {(["quote", "bar", "box"] as BlockquoteStyle[]).map((style) => (
                <Button
                  key={style}
                  data-style="ghost"
                  className="tiptap-hr-style-button"
                  aria-pressed={activeStates[style]}
                  onClick={() => handleSelect(style)}
                >
                  <BlockquotePreview style={style} />
                </Button>
              ))}
              <Button
                data-style="ghost"
                className="tiptap-hr-style-button"
                onClick={handleParagraph}
              >
                <AlignJustifyIcon className="tiptap-button-icon" />
              </Button>
            </CardItemGroup>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
