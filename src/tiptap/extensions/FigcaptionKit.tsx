import { Node, mergeAttributes } from "@tiptap/core";

export const FigcaptionKit = Node.create({
  name: "figcaption",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: "figcaption" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figcaption", mergeAttributes(HTMLAttributes), 0];
  },
});
