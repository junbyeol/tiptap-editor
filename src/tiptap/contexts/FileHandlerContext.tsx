import { createContext, useContext } from "react";
import type { useEditor } from "@tiptap/react";

export interface FileHandlerContextValue {
  resolveFileUrl: (file: File) => Promise<string | null>;
  insertFile: (
    editor: ReturnType<typeof useEditor>,
    file: File,
    url: string,
    pos: number,
  ) => void;
}

export const FileHandlerContext = createContext<FileHandlerContextValue | null>(
  null,
);

export function useFileHandlerContext(): FileHandlerContextValue {
  const ctx = useContext(FileHandlerContext);
  if (!ctx) {
    throw new Error(
      "useFileHandlerContext는 FileHandlerContext.Provider 안에서만 사용할 수 있습니다.",
    );
  }
  return ctx;
}
