/* eslint-disable react-hooks/refs */
import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./menubar";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ComponentType } from "react";
import {
  TextStyle,
  Color,
  BackgroundColor,
} from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit, TableCell } from "@tiptap/extension-table";
import { Gapcursor } from "@tiptap/extensions";
import FileHandler from "@tiptap/extension-file-handler";
import Image from "@tiptap/extension-image";
import {
  FileAttachment,
  type FileAttachmentAttributes,
} from "./extensions/FileAttachment";

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
  /**
   * 비이미지 파일을 에디터에 렌더링할 React 컴포넌트.
   * allowNonImageFile이 true일 때 유효하며, name/mimeType/url/size를 props로 받는다.
   */
  FileAttachmentComponent?: ComponentType<FileAttachmentAttributes>;
}

//브라우저 메모리에 파일을 base64 형식으로 저장하는 함수
const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

const isImageFile = (file: File) => file.type.startsWith("image/");

const TiptapEditor = ({
  defaultValue = "",
  onChange,
  minHeight,
  maxHeight,
  uploadFile,
  onFileInsert,
  onFileError,
  allowNonImageFile = false,
  FileAttachmentComponent,
}: TiptapProps) => {
  // useEditor는 초기 마운트 시에만 extensions를 처리하므로
  // prop 콜백이 변경돼도 stale 클로저가 되지 않도록 ref로 관리
  const onChangeRef = useRef(onChange);
  const uploadFileRef = useRef(uploadFile);
  const onFileInsertRef = useRef(onFileInsert);
  const onFileErrorRef = useRef(onFileError);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    uploadFileRef.current = uploadFile;
  }, [uploadFile]);

  useEffect(() => {
    onFileInsertRef.current = onFileInsert;
  }, [onFileInsert]);

  useEffect(() => {
    onFileErrorRef.current = onFileError;
  }, [onFileError]);

  const resolveFileUrl = useCallback(async (file: File): Promise<string> => {
    if (uploadFileRef.current) {
      return await uploadFileRef.current(file);
    }
    return await readFileAsDataUrl(file);
  }, []);

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
    },
    [],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      BackgroundColor,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Gapcursor,
      Image.configure({
        resize: {
          enabled: true,
          directions: ["top-left", "top-right", "bottom-left", "bottom-right"], // can be any direction or diagonal combination
          minWidth: 50,
          minHeight: 50,
          alwaysPreserveAspectRatio: true,
        },
      }),
      FileAttachment.configure({
        ...(FileAttachmentComponent && { component: FileAttachmentComponent }),
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      // TableCell extension을 별도로 extend 해 준 이유
      // https://github.com/ueberdosis/tiptap/issues/862
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              renderHTML: (attributes) => {
                if (!attributes.backgroundColor) {
                  return {};
                }

                return {
                  style: `background-color: ${attributes.backgroundColor}`,
                };
              },
              parseHTML: (element) => {
                return element.style.backgroundColor.replace(/['"]+/g, "");
              },
            },
          };
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: allowNonImageFile ? undefined : IMAGE_MIME_TYPES,
        onDrop: async (currentEditor, files, pos) => {
          for (const file of files) {
            const url = await resolveFileUrl(file);
            onFileInsertRef.current?.(file);
            insertFile(currentEditor, file, url, pos);
          }
        },
        onPaste: async (currentEditor, files, htmlContent) => {
          if (htmlContent) {
            onFileErrorRef.current?.(
              new Error("외부에서 복사해온 파일을 바로 붙여넣기할 수 없습니다"),
            );
            return;
          }
          for (const file of files) {
            const url = await resolveFileUrl(file);
            onFileInsertRef.current?.(file);
            insertFile(
              currentEditor,
              file,
              url,
              currentEditor.state.selection.anchor,
            );
          }
        },
      }),
    ],
    content: defaultValue,
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current?.(currentEditor.getHTML());
    },
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <TiptapWrapper minHeight={minHeight} maxHeight={maxHeight}>
      <EditorContext.Provider value={providerValue}>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </EditorContext.Provider>
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
