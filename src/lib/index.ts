// Global styles (component-level .scss files are imported as side-effects within each component)
import "@/styles/_variables.scss";
import "@/styles/_keyframe-animations.scss";
import "@/styles/_content.css";
import "@/styles/_editor.css";

export { default as TiptapEditor } from "@/tiptap/index";
export type { TiptapProps } from "@/tiptap/index";

export type { FileAttachmentAttributes } from "@/tiptap/extensions/FileAttachment";
export {
  FileAttachment,
  FileAttachmentNode,
} from "@/tiptap/extensions/FileAttachment";
export { DefaultFileAttachmentComponent } from "@/tiptap/extensions/DefaultFileAttachmentComponent";

export {
  EDITOR_FONTS,
  EDITOR_FONT_LINKS,
  EditorFontStylesheets,
} from "./fonts";
