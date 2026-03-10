import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../components/tiptap-ui-primitive/toolbar";
import { UndoRedoButton } from "../components/tiptap-ui/undo-redo-button";
import type { Editor } from "@tiptap/react";
import { ColorTextPopover } from "@/components/custom/color-text-popover";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { ListButton } from "@/components/tiptap-ui/list-button";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { RiTable2, RiInsertColumnRight, RiInsertRowBottom, RiDeleteColumn, RiDeleteRow, RiMergeCellsHorizontal,RiPaintFill } from "@remixicon/react";

export default function menubar({ editor }: { editor: Editor }) {
  return (
    <Toolbar className="my-toolbar">
      <ToolbarGroup>
        <UndoRedoButton editor={editor} tooltip="실행 취소" action="undo" />
        <UndoRedoButton editor={editor} tooltip="다시 실행" action="redo" />
        <ToolbarSeparator />
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
        <ColorTextPopover editor={editor} />
        <HeadingDropdownMenu
          editor={editor}
          levels={[1, 2, 3, 4]}
          hideWhenUnavailable={true}
          portal={false}
        />
        <ToolbarSeparator />
        <TextAlignButton editor={editor} align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
        <ToolbarSeparator />
        <ListButton editor={editor} type="bulletList" />
        <ListButton editor={editor} type="orderedList" />
      </ToolbarGroup>

      <ToolbarGroup>
        <Button data-style="ghost" tooltip="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run()}>
          <RiTable2 className="tiptap-button-icon" />
        </Button>
        <Button data-style="ghost" tooltip="Table" onClick={() => editor.chain().focus().addColumnAfter().run()}>
          <RiInsertColumnRight className="tiptap-button-icon" />
        </Button>
        <Button data-style="ghost" tooltip="Table" onClick={() => editor.chain().focus().deleteColumn().run()}>
          <RiDeleteColumn className="tiptap-button-icon" />
        </Button>
        <Button data-style="ghost" tooltip="Table" onClick={() => editor.chain().focus().addRowAfter().run()}>
          <RiInsertRowBottom className="tiptap-button-icon" />
        </Button>
        <Button data-style="ghost" tooltip="Table" onClick={() => editor.chain().focus().deleteRow().run()}>
          <RiDeleteRow className="tiptap-button-icon" />
        </Button>
        <Button data-style="ghost" tooltip="Table" onClick={() => editor.chain().focus().mergeOrSplit().run()}>
          <RiMergeCellsHorizontal className="tiptap-button-icon" />
        </Button>
        <Button data-style="ghost" tooltip="Table" onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#000').run()}>
          <RiPaintFill className="tiptap-button-icon" />
        </Button>
        

      </ToolbarGroup>
    </Toolbar>
  );
}
