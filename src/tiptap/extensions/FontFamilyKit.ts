import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (family: string) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
  }
}

export const FontFamilyKit = Extension.create({
  name: "fontFamily",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (el) => {
              const val = el.style.fontFamily;
              return val ? val.replace(/['"]/g, "").trim() : null;
            },
            renderHTML: (attrs) => {
              if (!attrs.fontFamily) return {};
              return { style: `font-family: '${attrs.fontFamily}'` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        (family) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontFamily: family }).run(),

      unsetFontFamily:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontFamily: null }).run(),
    };
  },
});
