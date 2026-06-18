import { Node, mergeAttributes, findParentNode } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";

export type FigureAlign = "left" | "center" | "right";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: {
      insertFigure: (attrs: {
        src: string;
        alt?: string;
        align?: FigureAlign;
      }) => ReturnType;
      setFigureAlign: (align: FigureAlign) => ReturnType;
      toggleFigcaption: () => ReturnType;
    };
  }
}

export const FigureKit = Node.create({
  name: "figure",
  group: "block",
  content: "image+ figcaption?",
  draggable: true,

  addAttributes() {
    return {
      align: {
        default: "center" as FigureAlign,
        parseHTML: (el) =>
          (el.getAttribute("data-align") as FigureAlign) ?? "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "figure" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("figure");

      const sync = (n: PMNode) => {
        dom.setAttribute("data-align", n.attrs.align as string);
        let count = 0;
        n.forEach((child) => {
          if (child.type.name === "image") count++;
        });
        dom.dataset.count = String(count);
      };

      sync(node);

      return {
        dom,
        contentDOM: dom,
        update(updatedNode: PMNode) {
          if (updatedNode.type.name !== "figure") return false;
          sync(updatedNode);
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      insertFigure:
        (attrs) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { align: attrs.align ?? "center" },
              content: [
                {
                  type: "image",
                  attrs: { src: attrs.src, alt: attrs.alt ?? "" },
                },
              ],
            })
            .run();
        },

      setFigureAlign:
        (align) =>
        ({ state, dispatch }) => {
          const found = findParentNode((node) => node.type.name === this.name)(
            state.selection,
          );

          if (!found) return false;

          if (dispatch) {
            dispatch(
              state.tr.setNodeMarkup(found.pos, undefined, {
                ...found.node.attrs,
                align,
              }),
            );
          }

          return true;
        },

      toggleFigcaption:
        () =>
        ({ state, dispatch }) => {
          const found = findParentNode((node) => node.type.name === this.name)(
            state.selection,
          );

          if (!found) return false;

          const { node: figureNode, pos: figurePos } = found;
          const hasFigcaption =
            figureNode.lastChild?.type.name === "figcaption";

          if (dispatch) {
            const tr = state.tr;

            if (hasFigcaption) {
              const figcaption = figureNode.lastChild!;
              const figcaptionPos =
                figurePos + figureNode.nodeSize - figcaption.nodeSize - 1;
              tr.delete(figcaptionPos, figcaptionPos + figcaption.nodeSize);
            } else {
              const insertPos = figurePos + figureNode.nodeSize - 1;
              const figcaptionNode =
                state.schema.nodes.figcaption.createAndFill()!;
              tr.insert(insertPos, figcaptionNode);
              tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));
            }

            dispatch(tr);
          }

          return true;
        },
    };
  },
});
