import { type Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  RiInsertRowTop,
  RiInsertRowBottom,
  RiDeleteRow,
  RiInsertColumnLeft,
  RiInsertColumnRight,
  RiDeleteColumn,
  RiLayoutTopLine,
  RiLayoutLeftLine,
  RiMergeCellsHorizontal,
  RiDeleteBinLine,
} from "@remixicon/react";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { TableCellBackgroundColorPopover } from "@/components/custom/table-cell-background-color-popover";

export interface TableBubbleMenuProps {
  editor: Editor;
}

export const TableBubbleMenu = ({ editor }: TableBubbleMenuProps) => {
  const canCommands = useEditorState({
    editor,
    selector: ({ editor }) => ({
      addRowBefore: editor.can().addRowBefore(),
      addRowAfter: editor.can().addRowAfter(),
      deleteRow: editor.can().deleteRow(),
      addColumnBefore: editor.can().addColumnBefore(),
      addColumnAfter: editor.can().addColumnAfter(),
      deleteColumn: editor.can().deleteColumn(),
      toggleHeaderRow: editor.can().toggleHeaderRow(),
      toggleHeaderColumn: editor.can().toggleHeaderColumn(),
      mergeOrSplit: editor.can().mergeOrSplit(),
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      shouldShow={({ editor }) => editor.isActive("table")}
      options={{ placement: "top" }}
    >
      <Toolbar variant="floating">
        <ToolbarGroup>
          <Button
            data-style="ghost"
            tooltip="위에 행 추가"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!canCommands.addRowBefore}
          >
            <RiInsertRowTop className="tiptap-button-icon" />
          </Button>
          <Button
            data-style="ghost"
            tooltip="아래에 행 추가"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!canCommands.addRowAfter}
          >
            <RiInsertRowBottom className="tiptap-button-icon" />
          </Button>
          <Button
            data-style="ghost"
            tooltip="행 삭제"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!canCommands.deleteRow}
          >
            <RiDeleteRow className="tiptap-button-icon" />
          </Button>
          <ToolbarSeparator />
          <Button
            data-style="ghost"
            tooltip="왼쪽에 열 추가"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!canCommands.addColumnBefore}
          >
            <RiInsertColumnLeft className="tiptap-button-icon" />
          </Button>
          <Button
            data-style="ghost"
            tooltip="오른쪽에 열 추가"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!canCommands.addColumnAfter}
          >
            <RiInsertColumnRight className="tiptap-button-icon" />
          </Button>
          <Button
            data-style="ghost"
            tooltip="열 삭제"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!canCommands.deleteColumn}
          >
            <RiDeleteColumn className="tiptap-button-icon" />
          </Button>
          <ToolbarSeparator />
          <Button
            data-style="ghost"
            tooltip="헤더 행 토글"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            disabled={!canCommands.toggleHeaderRow}
          >
            <RiLayoutTopLine className="tiptap-button-icon" />
          </Button>
          <Button
            data-style="ghost"
            tooltip="헤더 열 토글"
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
            disabled={!canCommands.toggleHeaderColumn}
          >
            <RiLayoutLeftLine className="tiptap-button-icon" />
          </Button>
          <Button
            data-style="ghost"
            tooltip="셀 병합/분할"
            onClick={() => editor.chain().focus().mergeOrSplit().run()}
            disabled={!canCommands.mergeOrSplit}
          >
            <RiMergeCellsHorizontal className="tiptap-button-icon" />
          </Button>
          <TableCellBackgroundColorPopover editor={editor} />
          <ToolbarSeparator />
          <Button
            data-style="ghost"
            tooltip="표 삭제"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <RiDeleteBinLine className="tiptap-button-icon" />
          </Button>
        </ToolbarGroup>
      </Toolbar>
    </BubbleMenu>
  );
};
