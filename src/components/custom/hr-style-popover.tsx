import { useState } from "react";
import type { Editor } from "@tiptap/react";
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
import type { HrStyle } from "@/tiptap/extensions/HrKit";

const LINE = {
  flex: 1,
  height: "1px",
  background: "var(--tt-gray-light-a-400)",
} as const;
const ICON = {
  fontSize: "0.65rem",
  color: "var(--tt-gray-light-a-600)",
} as const;

function HrPreview({ style }: { style: HrStyle }) {
  switch (style) {
    case "thin":
      return (
        <span
          style={{
            display: "block",
            width: "80%",
            height: "1px",
            background: "var(--tt-gray-light-a-400)",
          }}
        />
      );
    case "thick":
      return (
        <span
          style={{
            display: "block",
            width: "80%",
            height: "3px",
            background: "var(--tt-gray-light-a-700)",
          }}
        />
      );
    case "dashed":
      return (
        <span
          style={{
            display: "block",
            width: "80%",
            borderTop: "1px dashed var(--tt-gray-light-a-400)",
          }}
        />
      );
    case "short":
      return (
        <span
          style={{
            display: "block",
            width: "30%",
            height: "1px",
            background: "var(--tt-gray-light-a-400)",
          }}
        />
      );
    case "dots":
      return (
        <span
          style={{
            letterSpacing: "0.4em",
            fontSize: "1rem",
            color: "var(--tt-gray-light-a-600)",
          }}
        >
          · · ·
        </span>
      );
    case "diamond":
      return (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            width: "80%",
            gap: "6px",
          }}
        >
          <span style={LINE} />
          <span style={ICON}>◆</span>
          <span style={LINE} />
        </span>
      );
    case "circle":
      return (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            width: "80%",
            gap: "6px",
          }}
        >
          <span style={LINE} />
          <span style={{ ...ICON, fontSize: "0.75rem" }}>○</span>
          <span style={LINE} />
        </span>
      );
  }
}

const HR_STYLES: HrStyle[] = [
  "thin",
  "thick",
  "dashed",
  "short",
  "dots",
  "diamond",
  "circle",
];

interface HrStylePopoverProps {
  editor: Editor;
}

export function HrStylePopover({ editor }: HrStylePopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (style: HrStyle) => {
    editor.chain().focus().setHr({ style }).run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button data-style="ghost" tooltip="구분선 삽입">
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>—</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Card>
          <CardBody>
            <CardItemGroup orientation="vertical">
              {HR_STYLES.map((style) => (
                <Button
                  key={style}
                  data-style="ghost"
                  className="tiptap-hr-style-button"
                  onClick={() => handleSelect(style)}
                >
                  <HrPreview style={style} />
                </Button>
              ))}
            </CardItemGroup>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
