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
import { ListIcon } from "@/components/tiptap-icons/list-icon";
import { ListOrderedIcon } from "@/components/tiptap-icons/list-ordered-icon";
import { AlignJustifyIcon } from "@/components/tiptap-icons/align-justify-icon";

interface ListStylePopoverProps {
  editor: Editor;
}

export function ListStylePopover({ editor }: ListStylePopoverProps) {
  const [open, setOpen] = useState(false);

  const activeStates = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      paragraph: editor.isActive("paragraph"),
    }),
  });

  const run = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button data-style="ghost" tooltip="목록">
          <ListIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Card>
          <CardBody>
            <CardItemGroup orientation="horizontal">
              <Button
                data-style="ghost"
                tooltip="글머리 기호 목록"
                aria-pressed={activeStates.bulletList}
                onClick={() =>
                  run(() => editor.chain().focus().toggleBulletList().run())
                }
              >
                <ListIcon className="tiptap-button-icon" />
              </Button>
              <Button
                data-style="ghost"
                tooltip="번호 매기기 목록"
                aria-pressed={activeStates.orderedList}
                onClick={() =>
                  run(() => editor.chain().focus().toggleOrderedList().run())
                }
              >
                <ListOrderedIcon className="tiptap-button-icon" />
              </Button>
              <Button
                data-style="ghost"
                tooltip="단락"
                aria-pressed={activeStates.paragraph}
                onClick={() =>
                  run(() => editor.chain().focus().clearNodes().run())
                }
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
