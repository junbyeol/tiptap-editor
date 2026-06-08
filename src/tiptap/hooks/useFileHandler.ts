import { useCallback, useMemo } from "react";
import { useEditor } from "@tiptap/react";
import { type FileAttachmentAttributes } from "../extensions";
import type { FileHandlerOptions } from "@tiptap/extension-file-handler";

export interface UseFileHandlerAttributes {
  /**
   * 제공 시: 파일을 CDN에 업로드하고 URL을 반환.
   * 미제공 시: FileReader로 base64 변환 후 브라우저 메모리에 임시 저장.
   */
  uploadFile?: (file: File) => Promise<string>;
  /**
   * 파일이 에디터에 삽입될 때 호출되는 콜백.
   */
  onFileInsert?: (file: File) => void;
  /**
   * 파일 업로드 오류 시 호출되는 콜백.
   */
  onFileError?: (error: Error) => void;
  /**
   * true 시 이미지 외 파일(PDF, Word 등)도 허용.
   * FileAttachmentComponent가 함께 제공되어야 에디터에 렌더링됨.
   */
  allowNonImageFile?: boolean;
}

//브라우저 메모리에 파일을 base64 형식으로 저장하는 함수
const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const isImageFile = (file: File) => file.type.startsWith("image/");

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export const useFileHandler = ({
  uploadFile,
  onFileInsert,
  onFileError,
  allowNonImageFile,
}: UseFileHandlerAttributes) => {
  const resolveFileUrl = useCallback(
    async (file: File): Promise<string> => {
      if (uploadFile) {
        return await uploadFile(file);
      }
      return await readFileAsDataUrl(file);
    },
    [uploadFile],
  );

  const insertFile = (
    currentEditor: ReturnType<typeof useEditor>,
    file: File,
    url: string,
    pos: number,
  ) => {
    if (!currentEditor) return;

    if (isImageFile(file)) {
      currentEditor
        .chain()
        .insertContentAt(pos, { type: "image", attrs: { src: url } })
        .focus()
        .run();
      return;
    }

    currentEditor
      .chain()
      .insertContentAt(pos, {
        type: "fileAttachment",
        attrs: {
          name: file.name,
          mimeType: file.type,
          url,
          size: file.size,
        } satisfies FileAttachmentAttributes,
      })
      .focus()
      .run();
  };

  const handleDrop: FileHandlerOptions["onDrop"] = useCallback(
    async (currentEditor, files, pos) => {
      for (const file of files) {
        const url = await resolveFileUrl(file);
        onFileInsert?.(file);
        insertFile(currentEditor, file, url, pos);
      }
    },
    [resolveFileUrl, onFileInsert],
  );

  const handlePaste: FileHandlerOptions["onPaste"] = useCallback(
    async (currentEditor, files, htmlContent) => {
      if (htmlContent) {
        onFileError?.(
          new Error("외부에서 복사해온 파일을 바로 붙여넣기할 수 없습니다"),
        );
        return;
      }
      for (const file of files) {
        const url = await resolveFileUrl(file);
        onFileInsert?.(file);
        insertFile(
          currentEditor,
          file,
          url,
          currentEditor.state.selection.anchor,
        );
      }
    },
    [resolveFileUrl, onFileError, onFileInsert],
  );

  const allowedMimeTypes = useMemo(
    () => (allowNonImageFile ? undefined : IMAGE_MIME_TYPES),
    [allowNonImageFile],
  );

  return { handleDrop, handlePaste, allowedMimeTypes };
};
