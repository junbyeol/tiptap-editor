import { Extension } from "@tiptap/core";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import { GripTableView } from "./table-view";

// TableCell extension을 별도로 extend 해 준 이유
// https://github.com/ueberdosis/tiptap/issues/862
export const ExtendedTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }

          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
        parseHTML: (element) => {
          return element.style.backgroundColor.replace(/['"]+/g, "");
        },
      },
    };
  },
});

export const TableKit = Extension.create({
  name: "tableKit",
  addExtensions() {
    return [
      Table.configure({
        resizable: true,
        View: GripTableView,
      }),
      ExtendedTableCell,
      TableHeader,
      TableRow,
    ];
  },
});
