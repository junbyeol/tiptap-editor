import { createContext, useContext } from "react";
import type { Editor } from "@tiptap/core";

export const TiptapEditorContext = createContext<Editor | null>(null);

export function useTiptapEditorContext(): Editor | null {
  return useContext(TiptapEditorContext);
}
