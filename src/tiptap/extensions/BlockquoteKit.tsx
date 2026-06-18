import Blockquote from "@tiptap/extension-blockquote";

export type BlockquoteStyle = "bar" | "quote" | "box";

export const BlockquoteKit = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: "bar" as BlockquoteStyle,
        parseHTML: (el) =>
          (el.getAttribute("data-style") as BlockquoteStyle) ?? "bar",
        renderHTML: (attrs) => ({ "data-style": attrs.style }),
      },
    };
  },
});
