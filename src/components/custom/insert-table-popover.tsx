import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";
import { TableIcon } from "@/components/tiptap-icons/table-icon";

const GRID_ROWS = 10;
const GRID_COLS = 10;

interface InsertTablePopoverProps {
  editor: Editor;
}

export function InsertTablePopover({ editor }: InsertTablePopoverProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(
    null,
  );

  const handleSelect = (row: number, col: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: row, cols: col, withHeaderRow: false })
      .run();
    setOpen(false);
  };

  const hovRow = hovered?.row ?? 0;
  const hovCol = hovered?.col ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button data-style="ghost" tooltip="표 삽입">
          <TableIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Card>
          <CardBody>
            <div
              className="tiptap-table-picker-grid"
              onMouseLeave={() => setHovered(null)}
            >
              {Array.from({ length: GRID_ROWS }, (_, r) =>
                Array.from({ length: GRID_COLS }, (_, c) => {
                  const row = r + 1;
                  const col = c + 1;
                  const isSelected = row <= hovRow && col <= hovCol;
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`tiptap-table-picker-cell${isSelected ? " is-selected" : ""}`}
                      onMouseEnter={() => setHovered({ row, col })}
                      onClick={() => handleSelect(row, col)}
                    />
                  );
                }),
              )}
            </div>
            <p className="tiptap-table-picker-label">
              {hovRow > 0 && hovCol > 0 ? `${hovRow} × ${hovCol}` : " "}
            </p>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
