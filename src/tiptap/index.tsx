import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { TiptapEditorContext } from "@/contexts/TiptapEditorContext";
import MenuBar from "./menubar";
import { useMemo, useRef, useEffect } from "react";
import type { ComponentType } from "react";
import FileHandler from "@tiptap/extension-file-handler";
import {
  BasicKit,
  TableKit,
  FileAttachment,
  type FileAttachmentAttributes,
} from "./extensions";
import { useFileHandler } from "./hooks/useFileHandler";
import { FileHandlerContext } from "./contexts/FileHandlerContext";
import { TableBubbleMenu } from "@/components/custom/table-bubble-menu/table-bubble-menu";
import { ImageBubbleMenu } from "@/components/custom/image-bubble-menu";

export interface TiptapProps {
  /**
   * 에디터의 초기 HTML 콘텐츠.
   * 마운트 시에만 적용되며, 이후 변경은 에디터 내부 상태로 관리됨.
   */
  defaultValue?: string;
  /**
   * 에디터 콘텐츠가 변경될 때마다 호출되는 콜백. HTML 문자열을 반환.
   */
  onChange?: (html: string) => void;
  /**
   * 에디터 콘텐츠 영역의 최소 높이. (기본값: 200px)
   */
  minHeight?: string;
  /**
   * 에디터 콘텐츠 영역의 최대 높이. 초과 시 내부 스크롤. (기본값: 없음)
   */
  maxHeight?: string;
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
   * 파일이 업로드될 때 호출되는 콜백.
   */
  onUploadSuccess?: (file: File) => void;
  /**
   * 파일이 업로드 오류 시 호출되는 콜백.
   */
  onUploadError?: (error: Error) => void;
  /**
   * true 시 이미지 외 파일(PDF, Word 등)도 허용.
   * FileAttachmentComponent가 함께 제공되어야 에디터에 렌더링됨.
   */
  allowNonImageFile?: boolean;
  /**
   * 비이미지 파일을 에디터에 렌더링할 React 컴포넌트.
   * allowNonImageFile이 true일 때 유효하며, name/mimeType/url/size를 props로 받는다.
   */
  FileAttachmentComponent?: ComponentType<FileAttachmentAttributes>;
  /**
   * 에디터 인스턴스가 생성된 직후 1회 호출되는 콜백.
   * 데모/디버깅 목적으로 live 에디터(editor.getJSON(), editor.view.dom 등)에
   * 접근해야 할 때 사용한다.
   */
  onEditorCreate?: (editor: Editor) => void;
}

const TiptapEditor = ({
  defaultValue = "",
  onChange,
  minHeight,
  maxHeight,
  uploadFile,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  allowNonImageFile,
  FileAttachmentComponent,
  onEditorCreate,
}: TiptapProps) => {
  const {
    handleDrop,
    handlePaste,
    allowedMimeTypes,
    resolveFileUrl,
    insertFile,
  } = useFileHandler({
    uploadFile,
    onUploadStart,
    onUploadSuccess,
    onUploadError,
    allowNonImageFile,
  });

  const fileHandlerContextValue = useMemo(
    () => ({ resolveFileUrl, insertFile }),
    [resolveFileUrl, insertFile],
  );

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      BasicKit,
      TableKit,
      FileAttachment.configure({
        ...(FileAttachmentComponent && {
          component: FileAttachmentComponent,
        }),
      }),
      FileHandler.configure({
        allowedMimeTypes,
        onDrop: handleDrop,
        onPaste: handlePaste,
      }),
    ],
    content: defaultValue,
    onCreate: ({ editor: currentEditor }) => {
      onEditorCreate?.(currentEditor);
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current?.(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap tiptap-editor",
      },
      transformPastedHTML: (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        doc.querySelectorAll("img").forEach((img) => img.remove());
        return doc.body.innerHTML;
      },
    },
  });

  return (
    <TiptapWrapper minHeight={minHeight} maxHeight={maxHeight}>
      <TiptapEditorContext.Provider value={editor}>
        <FileHandlerContext.Provider value={fileHandlerContextValue}>
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
          {editor && <TableBubbleMenu editor={editor} />}
          {editor && <ImageBubbleMenu editor={editor} />}
        </FileHandlerContext.Provider>
      </TiptapEditorContext.Provider>
    </TiptapWrapper>
  );
};

interface TiptapWrapperProps {
  children: React.ReactNode;
  minHeight?: string;
  maxHeight?: string;
}

const TiptapWrapper = ({
  children,
  minHeight,
  maxHeight,
}: TiptapWrapperProps) => (
  <div
    className="tiptap-wrapper"
    style={
      {
        "--tiptap-min-height": minHeight,
        "--tiptap-max-height": maxHeight,
      } as React.CSSProperties
    }
  >
    {children}
  </div>
);

export default TiptapEditor;
