import { useState } from "react";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../components/tiptap-ui-primitive/toolbar";
import type { Editor } from "@tiptap/react";
import { ColorTextPopover } from "@/components/custom/color-text-popover";
import { TextStyleDropdownMenu } from "@/components/custom/text-style-dropdown-menu";
import { FontSizeDropdownMenu } from "@/components/custom/font-size-dropdown-menu";
import { FontFamilyDropdownMenu } from "@/components/custom/font-family-dropdown-menu";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { UploadableDropdownMenu } from "@/components/custom/uploadable-dropdown-menu/uploadable-dropdown-menu";
import { InsertTablePopover } from "@/components/custom/insert-table-popover";
import { ListStylePopover } from "@/components/custom/list-style-popover";
import { HrStylePopover } from "@/components/custom/hr-style-popover";
import { BlockquotePopover } from "@/components/custom/blockquote-popover";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";

export type MenubarMode = "basic" | "expert";

const MODE_LABELS: Record<MenubarMode, string> = {
  basic: "기본 모드",
  expert: "전문가 모드",
};

interface ModeDropdownProps {
  mode: MenubarMode;
  onModeChange: (mode: MenubarMode) => void;
}

function ModeDropdown({ mode, onModeChange }: ModeDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-style="ghost">
          {MODE_LABELS[mode]}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent portal={false}>
        <Card>
          <CardBody>
            {(Object.keys(MODE_LABELS) as MenubarMode[]).map((m) => (
              <DropdownMenuItem
                key={m}
                data-active-state={mode === m ? "on" : "off"}
                onSelect={() => onModeChange(m)}
                asChild
              >
                <Button
                  data-style="ghost"
                  data-active-state={mode === m ? "on" : "off"}
                >
                  {MODE_LABELS[m]}
                </Button>
              </DropdownMenuItem>
            ))}
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Menubar({ editor }: { editor: Editor }) {
  const [mode, setMode] = useState<MenubarMode>("basic");

  return (
    <Toolbar className="my-toolbar">
      <ToolbarGroup>
        <UploadableDropdownMenu editor={editor} portal={false} />
        {mode === "basic" ? (
          <>
            <TextStyleDropdownMenu editor={editor} portal={false} />
          </>
        ) : (
          <>
            <FontFamilyDropdownMenu editor={editor} portal={false} />
            <FontSizeDropdownMenu editor={editor} portal={false} />
          </>
        )}

        <ToolbarSeparator />
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
        <MarkButton type="underline" />
        <MarkButton type="code" />
        <LinkPopover />
        <ColorTextPopover editor={editor} />
        <ToolbarSeparator />
        <TextAlignButton editor={editor} align="left" />
        <TextAlignButton editor={editor} align="center" />
        <TextAlignButton editor={editor} align="right" />
        <TextAlignButton editor={editor} align="justify" />
        <ToolbarSeparator />
        <InsertTablePopover editor={editor} />
        <ListStylePopover editor={editor} />
        <HrStylePopover editor={editor} />
        <BlockquotePopover editor={editor} />
        <ToolbarSeparator />
        <ModeDropdown mode={mode} onModeChange={setMode} />
      </ToolbarGroup>
    </Toolbar>
  );
}
