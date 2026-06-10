import {
  CellSelection,
  TableMap,
  addColumn,
  addRow,
  cellAround,
  cellNear,
  moveTableColumn,
  moveTableRow,
} from "@tiptap/pm/tables";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";

export interface HoveredTableCell {
  map: TableMap;
  tableStart: number;
  row: number;
  col: number;
}

export function findHoveredCell(
  view: EditorView,
  clientX: number,
  clientY: number,
): HoveredTableCell | null {
  const coords = view.posAtCoords({ left: clientX, top: clientY });
  if (!coords) return null;

  const $pos = view.state.doc.resolve(coords.pos);
  const $cell = cellAround($pos) ?? cellNear($pos);
  if (!$cell || $cell.depth < 1) return null;

  const table = $cell.node(-1);
  if (table.type.spec.tableRole !== "table") return null;

  const tableStart = $cell.start(-1);
  const map = TableMap.get(table);
  const rect = map.findCell($cell.pos - tableStart);

  return { map, tableStart, row: rect.top, col: rect.left };
}

export function selectTableRow(
  view: EditorView,
  { map, tableStart }: HoveredTableCell,
  row: number,
) {
  if (row < 0 || row >= map.height) return;

  const $anchor = view.state.doc.resolve(tableStart + map.map[row * map.width]);
  const $head = view.state.doc.resolve(
    tableStart + map.map[row * map.width + map.width - 1],
  );
  const selection = CellSelection.rowSelection($anchor, $head);
  view.dispatch(view.state.tr.setSelection(selection));
  view.focus();
}

export function selectTableColumn(
  view: EditorView,
  { map, tableStart }: HoveredTableCell,
  col: number,
) {
  if (col < 0 || col >= map.width) return;

  const $anchor = view.state.doc.resolve(tableStart + map.map[col]);
  const $head = view.state.doc.resolve(
    tableStart + map.map[(map.height - 1) * map.width + col],
  );
  const selection = CellSelection.colSelection($anchor, $head);
  view.dispatch(view.state.tr.setSelection(selection));
  view.focus();
}

export function moveRow(
  view: EditorView,
  { tableStart }: HoveredTableCell,
  from: number,
  to: number,
) {
  if (from === to) return;
  moveTableRow({ from, to, pos: tableStart + 1 })(view.state, view.dispatch);
  view.focus();
}

export function moveColumn(
  view: EditorView,
  { tableStart }: HoveredTableCell,
  from: number,
  to: number,
) {
  if (from === to) return;
  moveTableColumn({ from, to, pos: tableStart + 1 })(view.state, view.dispatch);
  view.focus();
}

export function addTableRow(
  view: EditorView,
  table: ProseMirrorNode,
  contentDOM: HTMLElement,
) {
  const tableStart = view.posAtDOM(contentDOM, 0);
  const map = TableMap.get(table);
  const tr = view.state.tr;
  addRow(
    tr,
    {
      left: 0,
      right: map.width,
      top: 0,
      bottom: map.height,
      tableStart,
      map,
      table,
    },
    map.height,
  );
  view.dispatch(tr);
  view.focus();
}

export function addTableColumn(
  view: EditorView,
  table: ProseMirrorNode,
  contentDOM: HTMLElement,
) {
  const tableStart = view.posAtDOM(contentDOM, 0);
  const map = TableMap.get(table);
  const tr = view.state.tr;
  addColumn(
    tr,
    {
      left: 0,
      right: map.width,
      top: 0,
      bottom: map.height,
      tableStart,
      map,
      table,
    },
    map.width,
  );
  view.dispatch(tr);
  view.focus();
}
