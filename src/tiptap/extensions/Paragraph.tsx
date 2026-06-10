import ParagraphExtension from "@tiptap/extension-paragraph";

export type ParagraphSize = "small" | "normal" | "large";

export const Paragraph = ParagraphExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "normal",
        parseHTML: (element) => element.getAttribute("data-size") || "normal",
        renderHTML: (attributes) => ({
          "data-size": attributes.size as ParagraphSize,
        }),
      },
    };
  },
});
