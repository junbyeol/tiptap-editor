import { useCallback, useEffect, useMemo, useRef } from "react";
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
   * 파일이 업로드될 때 호출되는 콜백.
   */
  onUploadStart?: (file: File) => void;
  /**
   * 파일 업로드가 성공했을 때 호출되는 콜백.
   */
  onUploadSuccess?: (file: File) => void;
  /**
   * 파일 업로드가 실패했을 때 호출되는 콜백.
   */
  onUploadError?: (error: Error, file?: File) => void;
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
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  allowNonImageFile = false,
}: UseFileHandlerAttributes) => {
  const uploadFileRef = useRef(uploadFile);
  const onUploadStartRef = useRef(onUploadStart);
  const onUploadSuccessRef = useRef(onUploadSuccess);
  const onUploadErrorRef = useRef(onUploadError);

  useEffect(() => {
    uploadFileRef.current = uploadFile;
  }, [uploadFile]);
  useEffect(() => {
    onUploadStartRef.current = onUploadStart;
  }, [onUploadStart]);
  useEffect(() => {
    onUploadSuccessRef.current = onUploadSuccess;
  }, [onUploadSuccess]);
  useEffect(() => {
    onUploadErrorRef.current = onUploadError;
  }, [onUploadError]);

  const resolveFileUrl = useCallback(
    async (file: File): Promise<string | null> => {
      onUploadStartRef.current?.(file);
      try {
        const url = uploadFileRef.current
          ? await uploadFileRef.current(file)
          : await readFileAsDataUrl(file);
        return url;
      } catch (err) {
        onUploadErrorRef.current?.(
          err instanceof Error ? err : new Error("Upload failed"),
          file,
        );
        return null;
      }
    },
    [],
  );

  const insertFile = useCallback(
    (
      currentEditor: ReturnType<typeof useEditor>,
      file: File,
      url: string,
      pos: number,
    ) => {
      if (!currentEditor) return;

      if (isImageFile(file)) {
        currentEditor
          .chain()
          .insertContentAt(pos, {
            type: "figure",
            attrs: { align: "center" },
            content: [{ type: "image", attrs: { src: url } }],
          })
          .focus()
          .run();
        onUploadSuccessRef.current?.(file);
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
      onUploadSuccessRef.current?.(file);
    },
    [],
  );

  const handleDrop = useCallback<NonNullable<FileHandlerOptions["onDrop"]>>(
    async (currentEditor, files, pos) => {
      for (const file of files.reverse()) {
        const url = await resolveFileUrl(file);
        if (!url) return;
        insertFile(currentEditor, file, url, pos);
      }
    },
    [resolveFileUrl, insertFile],
  );

  const handlePaste = useCallback<NonNullable<FileHandlerOptions["onPaste"]>>(
    async (currentEditor, files, htmlContent) => {
      console.log(
        "[FileHandler onPaste] files:",
        files,
        "htmlContent:",
        htmlContent,
      );
      if (!htmlContent) {
        for (const file of files.reverse()) {
          const url = await resolveFileUrl(file);
          if (!url) return;
          insertFile(
            currentEditor,
            file,
            url,
            currentEditor.state.selection.anchor,
          );
        }
        return;
      }

      const doc = new DOMParser().parseFromString(htmlContent, "text/html");
      const imgTags = [...doc.querySelectorAll("img")];

      if (imgTags.length === 0) {
        onUploadErrorRef.current?.(
          new Error("외부에서 복사해온 파일을 바로 붙여넣기할 수 없습니다"),
        );
        return;
      }

      const imageFiles = files.filter((f) => f.type.startsWith("image/"));

      await Promise.all(
        imgTags.map(async (img, i) => {
          const file = imageFiles[i];
          if (file) {
            const url = await resolveFileUrl(file);
            if (url) {
              img.src = url;
            } else {
              img.remove();
            }
          } else {
            img.remove();
          }
        }),
      );

      currentEditor.commands.insertContent(doc.body.innerHTML);
    },
    [resolveFileUrl, insertFile],
  );

  const allowedMimeTypes = useMemo(
    () => (allowNonImageFile ? undefined : IMAGE_MIME_TYPES),
    [allowNonImageFile],
  );

  return {
    handleDrop,
    handlePaste,
    allowedMimeTypes,
    resolveFileUrl,
    insertFile,
  };
};
