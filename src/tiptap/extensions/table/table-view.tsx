import { createRef, type RefObject } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TableView } from "@tiptap/pm/tables";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorView, ViewMutationRecord } from "@tiptap/pm/view";
import { TableGripMenu, type TableGripMenuHandle } from "./table-grip-menu";
import {
  addTableColumn,
  addTableRow,
  findHoveredCell,
  moveColumn,
  moveRow,
  type HoveredTableCell,
} from "./table-row-column-utils";

const DRAG_THRESHOLD = 4;

interface DragState {
  target: "row" | "column";
  startIndex: number;
  targetIndex: number;
  startX: number;
  startY: number;
  hasMoved: boolean;
  hovered: HoveredTableCell;
}

export class GripTableView extends TableView {
  view: EditorView;
  controls: HTMLDivElement;
  rowHandle: HTMLDivElement;
  columnHandle: HTMLDivElement;
  addRowButton: HTMLButtonElement;
  addColumnButton: HTMLButtonElement;
  dropIndicator: HTMLDivElement;
  rowHandleRoot: Root;
  columnHandleRoot: Root;
  rowMenuRef: RefObject<TableGripMenuHandle | null>;
  columnMenuRef: RefObject<TableGripMenuHandle | null>;
  hovered: HoveredTableCell | null = null;
  rowMenuOpen = false;
  columnMenuOpen = false;
  dragState: DragState | null = null;

  constructor(node: ProseMirrorNode, cellMinWidth: number, view: EditorView) {
    super(node, cellMinWidth);
    this.view = view;

    this.controls = document.createElement("div");
    this.controls.className = "table-controls";
    this.controls.contentEditable = "false";

    this.rowHandle = document.createElement("div");
    this.rowHandle.className = "table-row-handle";

    this.columnHandle = document.createElement("div");
    this.columnHandle.className = "table-column-handle";

    this.dropIndicator = document.createElement("div");
    this.dropIndicator.className = "table-drop-indicator";

    this.addRowButton = document.createElement("button");
    this.addRowButton.type = "button";
    this.addRowButton.className = "table-add-row-button";
    this.addRowButton.setAttribute("aria-label", "아래에 행 추가");
    this.addRowButton.textContent = "+";
    this.addRowButton.addEventListener("mousedown", this.handleAddRow);

    this.addColumnButton = document.createElement("button");
    this.addColumnButton.type = "button";
    this.addColumnButton.className = "table-add-column-button";
    this.addColumnButton.setAttribute("aria-label", "오른쪽에 열 추가");
    this.addColumnButton.textContent = "+";
    this.addColumnButton.addEventListener("mousedown", this.handleAddColumn);

    this.controls.append(
      this.rowHandle,
      this.columnHandle,
      this.dropIndicator,
      this.addRowButton,
      this.addColumnButton,
    );
    this.dom.append(this.controls);

    this.rowMenuRef = createRef<TableGripMenuHandle>();
    this.columnMenuRef = createRef<TableGripMenuHandle>();

    this.rowHandleRoot = createRoot(this.rowHandle);
    this.columnHandleRoot = createRoot(this.columnHandle);

    this.rowHandleRoot.render(
      <TableGripMenu
        ref={this.rowMenuRef}
        view={this.view}
        target="row"
        getHovered={() => this.hovered}
        onOpenChange={this.handleRowMenuOpenChange}
        onGripMouseDown={(event) => this.startDrag("row", event)}
      />,
    );
    this.columnHandleRoot.render(
      <TableGripMenu
        ref={this.columnMenuRef}
        view={this.view}
        target="column"
        getHovered={() => this.hovered}
        onOpenChange={this.handleColumnMenuOpenChange}
        onGripMouseDown={(event) => this.startDrag("column", event)}
      />,
    );

    this.dom.addEventListener("mousemove", this.handleMouseMove);
    this.dom.addEventListener("mouseleave", this.handleMouseLeave);
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (this.dragState) return;

    const hovered = findHoveredCell(this.view, event.clientX, event.clientY);
    if (!hovered) return;

    this.hovered = hovered;
    this.positionHandles(hovered);
  };

  private handleMouseLeave = () => {
    if (this.rowMenuOpen || this.columnMenuOpen || this.dragState) return;
    this.hovered = null;
    this.rowHandle.classList.remove("is-visible");
    this.columnHandle.classList.remove("is-visible");
  };

  private handleRowMenuOpenChange = (open: boolean) => {
    this.rowMenuOpen = open;
    if (!open && !this.hovered) this.rowHandle.classList.remove("is-visible");
  };

  private handleColumnMenuOpenChange = (open: boolean) => {
    this.columnMenuOpen = open;
    if (!open && !this.hovered)
      this.columnHandle.classList.remove("is-visible");
  };

  private handleAddRow = (event: MouseEvent) => {
    event.preventDefault();
    addTableRow(this.view, this.node, this.contentDOM);
  };

  private handleAddColumn = (event: MouseEvent) => {
    event.preventDefault();
    addTableColumn(this.view, this.node, this.contentDOM);
  };

  private startDrag = (target: "row" | "column", event: React.MouseEvent) => {
    const hovered = this.hovered;
    if (!hovered) return;

    const startIndex = target === "row" ? hovered.row : hovered.col;
    this.dragState = {
      target,
      startIndex,
      targetIndex: startIndex,
      startX: event.clientX,
      startY: event.clientY,
      hasMoved: false,
      hovered,
    };

    document.addEventListener("mousemove", this.handleDragMove);
    document.addEventListener("mouseup", this.handleDragEnd);
  };

  private handleDragMove = (event: MouseEvent) => {
    const drag = this.dragState;
    if (!drag) return;

    if (!drag.hasMoved) {
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      drag.hasMoved = true;
      document.body.style.cursor =
        drag.target === "row" ? "row-resize" : "col-resize";
    }

    drag.targetIndex =
      drag.target === "row"
        ? this.findClosestRowIndex(event.clientY)
        : this.findClosestColumnIndex(event.clientX);

    this.updateDropIndicator(drag);
  };

  private handleDragEnd = () => {
    const drag = this.dragState;
    if (!drag) return;

    document.removeEventListener("mousemove", this.handleDragMove);
    document.removeEventListener("mouseup", this.handleDragEnd);
    document.body.style.cursor = "";
    this.dropIndicator.classList.remove("is-visible");
    this.dragState = null;

    if (!drag.hasMoved) {
      if (drag.target === "row") {
        this.rowMenuRef.current?.open();
      } else {
        this.columnMenuRef.current?.open();
      }
      return;
    }

    if (drag.target === "row") {
      moveRow(this.view, drag.hovered, drag.startIndex, drag.targetIndex);
    } else {
      moveColumn(this.view, drag.hovered, drag.startIndex, drag.targetIndex);
    }
  };

  private findClosestRowIndex(clientY: number): number {
    const rows = this.table.rows;
    let closest = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      const distance = Math.abs(clientY - (rect.top + rect.height / 2));
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    }

    return closest;
  }

  private findClosestColumnIndex(clientX: number): number {
    const boundaries = this.getColumnBoundaries();
    let closest = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < boundaries.length - 1; i++) {
      const center = (boundaries[i] + boundaries[i + 1]) / 2;
      const distance = Math.abs(clientX - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    }

    return closest;
  }

  private getColumnBoundaries(): number[] {
    const headerRow = this.table.rows[0];
    const boundaries: number[] = [];
    let col = 0;

    for (let i = 0; i < headerRow.cells.length; i++) {
      const cell = headerRow.cells[i];
      const rect = cell.getBoundingClientRect();
      const step = rect.width / cell.colSpan;
      for (let s = 0; s < cell.colSpan; s++) {
        boundaries[col] = rect.left + step * s;
        col++;
      }
    }

    const lastCell = headerRow.cells[headerRow.cells.length - 1];
    boundaries[col] = lastCell ? lastCell.getBoundingClientRect().right : 0;
    return boundaries;
  }

  private updateDropIndicator(drag: DragState) {
    if (drag.targetIndex === drag.startIndex) {
      this.dropIndicator.classList.remove("is-visible");
      return;
    }

    const domRect = this.dom.getBoundingClientRect();
    const tableRect = this.table.getBoundingClientRect();

    if (drag.target === "row") {
      const targetRow = this.table.rows[drag.targetIndex];
      if (!targetRow) return;

      const rect = targetRow.getBoundingClientRect();
      const top = drag.targetIndex < drag.startIndex ? rect.top : rect.bottom;

      this.dropIndicator.style.top = `${top - domRect.top}px`;
      this.dropIndicator.style.left = `${tableRect.left - domRect.left}px`;
      this.dropIndicator.style.width = `${tableRect.width}px`;
      this.dropIndicator.style.height = "";
      this.dropIndicator.className =
        "table-drop-indicator table-drop-indicator--row is-visible";
    } else {
      const boundaries = this.getColumnBoundaries();
      const left =
        drag.targetIndex < drag.startIndex
          ? boundaries[drag.targetIndex]
          : boundaries[drag.targetIndex + 1];

      this.dropIndicator.style.left = `${left - domRect.left}px`;
      this.dropIndicator.style.top = `${tableRect.top - domRect.top}px`;
      this.dropIndicator.style.height = `${tableRect.height}px`;
      this.dropIndicator.style.width = "";
      this.dropIndicator.className =
        "table-drop-indicator table-drop-indicator--column is-visible";
    }
  }

  private positionHandles({ row, col }: HoveredTableCell) {
    const domRect = this.dom.getBoundingClientRect();
    const rowEl = this.table.rows[row];
    if (!rowEl) return;

    const rowRect = rowEl.getBoundingClientRect();
    this.rowHandle.style.top = `${rowRect.top - domRect.top}px`;
    this.rowHandle.style.height = `${rowRect.height}px`;
    this.rowHandle.classList.add("is-visible");

    const cellEl = rowEl.cells[this.cellIndexAtColumn(rowEl, col)];
    if (!cellEl) return;

    const cellRect = cellEl.getBoundingClientRect();
    this.columnHandle.style.left = `${cellRect.left - domRect.left}px`;
    this.columnHandle.style.width = `${cellRect.width}px`;
    this.columnHandle.classList.add("is-visible");
  }

  private cellIndexAtColumn(rowEl: HTMLTableRowElement, col: number): number {
    let mappedCol = 0;
    for (let i = 0; i < rowEl.cells.length; i++) {
      if (mappedCol > col) return i - 1;
      if (mappedCol === col) return i;
      mappedCol += rowEl.cells[i].colSpan;
    }
    return rowEl.cells.length - 1;
  }

  ignoreMutation(record: ViewMutationRecord): boolean {
    if (this.controls.contains(record.target)) return true;
    return super.ignoreMutation(record);
  }

  destroy() {
    this.dom.removeEventListener("mousemove", this.handleMouseMove);
    this.dom.removeEventListener("mouseleave", this.handleMouseLeave);
    document.removeEventListener("mousemove", this.handleDragMove);
    document.removeEventListener("mouseup", this.handleDragEnd);
    document.body.style.cursor = "";
    this.addRowButton.removeEventListener("mousedown", this.handleAddRow);
    this.addColumnButton.removeEventListener("mousedown", this.handleAddColumn);
    this.rowHandleRoot.unmount();
    this.columnHandleRoot.unmount();
  }
}
