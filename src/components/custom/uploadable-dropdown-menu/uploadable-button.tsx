import { forwardRef, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";

// --- Icons ---
import { UploadableFileIcon } from "@/components/tiptap-icons/uploadable-file-icon";
import { UploadableImageIcon } from "@/components/tiptap-icons/uploadable-image-icon";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { useFileHandlerContext } from "@/tiptap/contexts/FileHandlerContext";

export type UploadableType = "image" | "file";

export interface UploadableButtonProps extends Omit<ButtonProps, "type"> {
  /** 업로드 타입: "image"는 이미지만, "file"은 모든 파일 허용 */
  uploadType: UploadableType;
  /** 버튼 옆에 표시할 텍스트 */
  text?: string;
  /** Tiptap 에디터 인스턴스 */
  editor?: Editor | null;
  /**
   * 외부에서 관리하는 input ref. 제공 시 내부 input을 렌더하지 않고 이 ref를 트리거함.
   * DropdownMenu 안에서 사용할 때처럼 input이 unmount될 수 있는 환경에서 사용.
   */
  externalInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const UploadableButton = forwardRef<
  HTMLButtonElement,
  UploadableButtonProps
>(
  (
    {
      editor: providedEditor,
      uploadType,
      text,
      onClick,
      externalInputRef,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { resolveFileUrl, insertFile } = useFileHandlerContext();
    const internalInputRef = useRef<HTMLInputElement>(null);
    const activeInputRef = externalInputRef ?? internalInputRef;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        activeInputRef.current?.click();
      },
      [onClick, activeInputRef],
    );

    const handleChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor) return;
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const pos = editor.state.selection.anchor;
        for (const file of files) {
          const url = await resolveFileUrl(file);
          insertFile(editor, file, url, pos);
        }

        e.target.value = "";
      },
      [editor, resolveFileUrl, insertFile],
    );

    const accept = uploadType === "image" ? "image/*" : "*/*";
    const label = uploadType === "image" ? "이미지 업로드" : "파일 업로드";
    const Icon =
      uploadType === "image" ? UploadableImageIcon : UploadableFileIcon;

    return (
      <>
        <Button
          type="button"
          variant="ghost"
          role="button"
          tabIndex={-1}
          aria-label={label}
          tooltip={label}
          onClick={handleClick}
          {...buttonProps}
          ref={ref}
        >
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
        </Button>
        {/* externalInputRef가 없을 때만 내부 input을 렌더 (standalone 사용 시) */}
        {!externalInputRef && (
          <input
            ref={internalInputRef}
            type="file"
            accept={accept}
            style={{ display: "none" }}
            onChange={handleChange}
          />
        )}
      </>
    );
  },
);

UploadableButton.displayName = "UploadableButton";
