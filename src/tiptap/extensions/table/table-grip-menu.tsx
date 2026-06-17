import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { EditorView } from "@tiptap/pm/view";
import type { Command } from "@tiptap/pm/state";
import {
  addRowBefore,
  addRowAfter,
  deleteRow,
  addColumnBefore,
  addColumnAfter,
  deleteColumn,
  toggleHeaderRow,
  toggleHeaderColumn,
  deleteTable,
  setCellAttr,
} from "@tiptap/pm/tables";
import {
  RiInsertRowTop,
  RiInsertRowBottom,
  RiDeleteRow,
  RiInsertColumnLeft,
  RiInsertColumnRight,
  RiDeleteColumn,
  RiLayoutTopLine,
  RiLayoutLeftLine,
  RiPaintFill,
  RiDeleteBinLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card";
import { ColoredButtonIcon } from "@/components/custom/table-cell-background-color-popover";
import { colors } from "@/components/custom/variables";
import {
  selectTableColumn,
  selectTableRow,
  type HoveredTableCell,
} from "./table-row-column-utils";

export interface TableGripMenuHandle {
  open: () => void;
}

export interface TableGripMenuProps {
  view: EditorView;
  target: "row" | "column";
  getHovered: () => HoveredTableCell | null;
  onOpenChange?: (open: boolean) => void;
  onGripMouseDown?: (event: React.MouseEvent) => void;
}

export const TableGripMenu = forwardRef<
  TableGripMenuHandle,
  TableGripMenuProps
>(({ view, target, getHovered, onOpenChange, onGripMouseDown }, ref) => {
  const [open, setOpen] = useState(false);
  const openedHovered = useRef<HoveredTableCell | null>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const reselect = (hovered: HoveredTableCell) => {
    if (target === "row") {
      selectTableRow(view, hovered, hovered.row);
    } else {
      selectTableColumn(view, hovered, hovered.col);
    }
  };

  useImperativeHandle(ref, () => ({
    open: () => {
      const hovered = getHovered();
      if (!hovered) return;

      openedHovered.current = hovered;
      reselect(hovered);
      handleOpenChange(true);
    },
  }));

  const runCommand = (command: Command) => {
    handleOpenChange(false);
    const hovered = openedHovered.current;
    if (hovered) reselect(hovered);
    command(view.state, view.dispatch);
    view.focus();
  };

  const applyBackgroundColor = (hex: string) => {
    handleOpenChange(false);
    const hovered = openedHovered.current;
    if (!hovered) return;
    reselect(hovered);
    setCellAttr("backgroundColor", hex)(view.state, view.dispatch);
    view.focus();
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="table-grip-handle"
          aria-label={target === "row" ? "행 메뉴 열기" : "열 메뉴 열기"}
          onMouseDown={(event) => {
            event.preventDefault();
            onGripMouseDown?.(event);
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        portal
        side={target === "row" ? "right" : "bottom"}
        align="start"
      >
        <Card>
          <CardBody>
            <CardItemGroup orientation="vertical">
              {target === "row" ? (
                <>
                  <DropdownMenuItem asChild>
                    <Button
                      data-style="ghost"
                      className="tiptap-table-grip-menu-item"
                      onClick={() => runCommand(addRowBefore)}
                    >
                      <RiInsertRowTop className="tiptap-button-icon" />
                      <span className="tiptap-button-text">위에 행 추가</span>
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button
                      data-style="ghost"
                      className="tiptap-table-grip-menu-item"
                      onClick={() => runCommand(addRowAfter)}
                    >
                      <RiInsertRowBottom className="tiptap-button-icon" />
                      <span className="tiptap-button-text">아래에 행 추가</span>
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button
                      data-style="ghost"
                      className="tiptap-table-grip-menu-item"
                      onClick={() => runCommand(toggleHeaderRow)}
                    >
                      <RiLayoutTopLine className="tiptap-button-icon" />
                      <span className="tiptap-button-text">헤더 행 토글</span>
                    </Button>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Button
                      data-style="ghost"
                      className="tiptap-table-grip-menu-item"
                      onClick={() => runCommand(addColumnBefore)}
                    >
                      <RiInsertColumnLeft className="tiptap-button-icon" />
                      <span className="tiptap-button-text">왼쪽에 열 추가</span>
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button
                      data-style="ghost"
                      className="tiptap-table-grip-menu-item"
                      onClick={() => runCommand(addColumnAfter)}
                    >
                      <RiInsertColumnRight className="tiptap-button-icon" />
                      <span className="tiptap-button-text">
                        오른쪽에 열 추가
                      </span>
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button
                      data-style="ghost"
                      className="tiptap-table-grip-menu-item"
                      onClick={() => runCommand(toggleHeaderColumn)}
                    >
                      <RiLayoutLeftLine className="tiptap-button-icon" />
                      <span className="tiptap-button-text">헤더 열 토글</span>
                    </Button>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSub>
                <DropdownMenuSubTrigger asChild>
                  <Button
                    data-style="ghost"
                    className="tiptap-table-grip-menu-item"
                  >
                    <RiPaintFill className="tiptap-button-icon" />
                    <span className="tiptap-button-text">배경색</span>
                    <RiArrowRightSLine className="tiptap-button-dropdown-small" />
                  </Button>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent portal>
                  <Card>
                    <CardBody>
                      <CardItemGroup orientation="horizontal">
                        {colors.slice(0, 5).map((color) => (
                          <Button
                            key={color.name}
                            data-style="ghost"
                            type="button"
                            onClick={() => applyBackgroundColor(color.color)}
                            aria-label={`Background color: ${color.name}`}
                          >
                            <ColoredButtonIcon
                              backgroundColorHex={color.color}
                              borderColorHex={color.contrastColor}
                            />
                          </Button>
                        ))}
                      </CardItemGroup>
                      <CardItemGroup orientation="horizontal">
                        {colors.slice(5, 10).map((color) => (
                          <Button
                            key={color.name}
                            data-style="ghost"
                            type="button"
                            onClick={() => applyBackgroundColor(color.color)}
                            aria-label={`Background color: ${color.name}`}
                          >
                            <ColoredButtonIcon
                              backgroundColorHex={color.color}
                              borderColorHex={color.contrastColor}
                            />
                          </Button>
                        ))}
                      </CardItemGroup>
                    </CardBody>
                  </Card>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem asChild>
                <Button
                  data-style="ghost"
                  className="tiptap-table-grip-menu-item"
                  onClick={() =>
                    target === "row"
                      ? runCommand(deleteRow)
                      : runCommand(deleteColumn)
                  }
                >
                  {target === "row" ? (
                    <RiDeleteRow className="tiptap-button-icon" />
                  ) : (
                    <RiDeleteColumn className="tiptap-button-icon" />
                  )}
                  <span className="tiptap-button-text">
                    {target === "row" ? "행 삭제" : "열 삭제"}
                  </span>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  data-style="ghost"
                  className="tiptap-table-grip-menu-item"
                  onClick={() => runCommand(deleteTable)}
                >
                  <RiDeleteBinLine className="tiptap-button-icon" />
                  <span className="tiptap-button-text">표 삭제</span>
                </Button>
              </DropdownMenuItem>
            </CardItemGroup>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

TableGripMenu.displayName = "TableGripMenu";
