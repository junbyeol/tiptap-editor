import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../components/tiptap-ui-primitive/toolbar";
import type { Editor } from "@tiptap/react";
import { ColorTextPopover } from "@/components/custom/color-text-popover";
import { TextStyleDropdownMenu } from "@/components/custom/text-style-dropdown-menu";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { UploadableDropdownMenu } from "@/components/custom/uploadable-dropdown-menu/uploadable-dropdown-menu";
import { InsertTablePopover } from "@/components/custom/insert-table-popover";
import { ListStylePopover } from "@/components/custom/list-style-popover";
import { HrStylePopover } from "@/components/custom/hr-style-popover";

export default function menubar({ editor }: { editor: Editor }) {
  return (
    <Toolbar className="my-toolbar">
      <ToolbarGroup>
        <UploadableDropdownMenu editor={editor} portal={false} />
        <TextStyleDropdownMenu editor={editor} portal={false} />
        <ToolbarSeparator />
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
        <MarkButton type="underline" />
        <MarkButton type="code" />
        <ColorTextPopover editor={editor} />
        <ToolbarSeparator />
        <TextAlignButton editor={editor} align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
        <ToolbarSeparator />
        <InsertTablePopover editor={editor} />
        <ListStylePopover editor={editor} />
        <HrStylePopover editor={editor} />
      </ToolbarGroup>
    </Toolbar>
  );
}
