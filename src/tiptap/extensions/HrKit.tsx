import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { TextSelection, NodeSelection } from "@tiptap/pm/state";

export type HrStyle =
  | "thin"
  | "thick"
  | "dashed"
  | "short"
  | "dots"
  | "diamond"
  | "circle";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    hr: {
      setHr: (attrs?: { style?: HrStyle }) => ReturnType;
    };
  }
}

export const Hr = HorizontalRule.extend({
  addAttributes() {
    return {
      style: {
        default: "thin" as HrStyle,
        parseHTML: (el) => (el.getAttribute("data-style") as HrStyle) ?? "thin",
        renderHTML: (attrs) => ({ "data-style": attrs.style }),
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setHr:
        (attrs) =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: attrs ?? {} })
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                const { $to } = tr.selection;
                const posAfter = $to.end();

                if ($to.nodeAfter) {
                  if ($to.nodeAfter.isTextblock) {
                    tr.setSelection(TextSelection.create(tr.doc, $to.pos + 1));
                  } else {
                    tr.setSelection(NodeSelection.create(tr.doc, posAfter + 1));
                  }
                } else {
                  const node = $to.parent.type.createAndFill();
                  if (node) {
                    tr.insert(posAfter, node);
                    tr.setSelection(TextSelection.create(tr.doc, posAfter + 1));
                  }
                }
              }
              return true;
            })
            .scrollIntoView()
            .run(),
    };
  },
});
