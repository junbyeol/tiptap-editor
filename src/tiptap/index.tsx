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
  createFileAttachmentExtension,
  type FileAttachmentAttributes,
} from "./extensions/file-attachment";
import { DefaultFileAttachmentComponent } from "./extensions/default-file-attachment";

export interface TiptapProps {
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
  uploadFile,
  onFileInsert,
  onFileError,
  allowNonImageFile = false,
  FileAttachmentComponent = DefaultFileAttachmentComponent,
}: TiptapProps) => {
  // useEditor는 초기 마운트 시에만 extensions를 처리하므로
  // prop 콜백이 변경돼도 stale 클로저가 되지 않도록 ref로 관리
  const uploadFileRef = useRef(uploadFile);
  const onFileInsertRef = useRef(onFileInsert);
  const onFileErrorRef = useRef(onFileError);
  const fileAttachmentComponentRef = useRef(FileAttachmentComponent);

  useEffect(() => {
    uploadFileRef.current = uploadFile;
  }, [uploadFile]);

  useEffect(() => {
    onFileInsertRef.current = onFileInsert;
  }, [onFileInsert]);

  useEffect(() => {
    onFileErrorRef.current = onFileError;
  }, [onFileError]);

  useEffect(() => {
    fileAttachmentComponentRef.current = FileAttachmentComponent;
  }, [FileAttachmentComponent]);

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
      Image,
      createFileAttachmentExtension(fileAttachmentComponentRef),
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
    content: `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That's a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn't that great? And all of that is editable. B  ut wait, there's more. Let's try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.
</p>
<blockquote>
  Wow, that's amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`,
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <TiptapWrapper>
      <EditorContext.Provider value={providerValue}>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </EditorContext.Provider>
    </TiptapWrapper>
  );
};

const TiptapWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="tiptap-wrapper">{children}</div>
);

export default TiptapEditor;
