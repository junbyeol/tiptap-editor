import { useEffect, useRef, useState } from "react";
import "./App.css";
import "@junbyeol/tiptap-editor/style.css";
import { TiptapEditor, TiptapContent } from "@junbyeol/tiptap-editor";
import type { Editor, JSONContent } from "@tiptap/core";
import { toast, ToastContainer, Bounce } from "react-toastify";
import HtmlSourceViewer from "./demo/HtmlSourceViewer";
import JsonTreeViewer from "./demo/JsonTreeViewer";
import DomTreeViewer from "./demo/DomTreeViewer";

const DEMO_INITIAL_CONTENT = `
<h1>@junbyeol/tiptap-editor 데모</h1>
<p>
  이 에디터에서 직접 편집해보면서, 위쪽 <strong>Editor / Article Renderer</strong> 전환과
  아래쪽 <strong>Inspector</strong>(ProseMirror JSON / Editor DOM / Article HTML)를 조합해
  편집 중인 상태와 실제로 저장·게시되는 결과가 어떻게 다른지 비교해볼 수 있습니다.
</p>
<h2>Hi there,</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>That's a bullet list with one …</li>
  <li>… or two list items.</li>
</ul>
<p>
  Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:
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
`;

type MainView = "editor" | "article";
type InspectorView = "json" | "editor-dom" | "article-html";

const MAIN_MIN_RATIO = 0.3;
const MAIN_MAX_RATIO = 0.85;
const DEFAULT_MAIN_RATIO = 0.65;

function App() {
  const [html, setHtml] = useState(DEMO_INITIAL_CONTENT);
  const [editorJson, setEditorJson] = useState<JSONContent | null>(null);
  const [editorDom, setEditorDom] = useState("");
  const editorRef = useRef<Editor | null>(null);

  const [mainView, setMainView] = useState<MainView>("editor");
  const [inspectorView, setInspectorView] =
    useState<InspectorView>("editor-dom");

  const [mainRatio, setMainRatio] = useState(DEFAULT_MAIN_RATIO);
  const appRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  useEffect(() => {
    const toolbarEl =
      editorContainerRef.current?.querySelector<HTMLElement>(".tiptap-toolbar");
    if (!toolbarEl) return;

    const observer = new ResizeObserver(([entry]) => {
      // Editor 탭이 아닐 때는 조상이 display:none이라 0으로 보고되는데,
      // 그때는 마지막으로 측정된 실제 높이를 그대로 유지해야 한다.
      if (entry.contentRect.height > 0) {
        setToolbarHeight(entry.contentRect.height);
      }
    });
    observer.observe(toolbarEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current || !appRef.current) return;
      const rect = appRef.current.getBoundingClientRect();
      const ratio = (event.clientY - rect.top) / rect.height;
      setMainRatio(Math.min(MAIN_MAX_RATIO, Math.max(MAIN_MIN_RATIO, ratio)));
    };
    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleDividerMouseDown = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const syncFromEditor = (editor: Editor) => {
    setEditorJson(editor.getJSON());
    setEditorDom(editor.view.dom.innerHTML);
  };

  return (
    <div className="demo-app" ref={appRef}>
      <section className="demo-main" style={{ flex: `${mainRatio} 0 0%` }}>
        <div className="demo-view-switch" role="tablist" aria-label="Main view">
          <button
            type="button"
            role="tab"
            aria-selected={mainView === "editor"}
            onClick={() => setMainView("editor")}
          >
            Editor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainView === "article"}
            onClick={() => setMainView("article")}
          >
            Article Renderer
          </button>
        </div>

        <div className="demo-main-content">
          {/*
            Editor는 Main View가 "article"이어도 언마운트하지 않는다.
            언마운트하면 커서 위치/undo 히스토리가 사라지기 때문에 display로만 숨긴다.
          */}
          <div
            className="demo-main-editor"
            ref={editorContainerRef}
            style={{ display: mainView === "editor" ? "block" : "none" }}
          >
            <TiptapEditor
              defaultValue={DEMO_INITIAL_CONTENT}
              onEditorCreate={(editor) => {
                editorRef.current = editor;
                syncFromEditor(editor);
              }}
              onChange={(value) => {
                setHtml(value);
                if (editorRef.current) syncFromEditor(editorRef.current);
              }}
              onUploadStart={(file) =>
                toast(`${file.name} 업로드 시작`, {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  transition: Bounce,
                })
              }
              onUploadSuccess={(file) =>
                toast.success(`${file.name} 업로드 완료`, {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Bounce,
                })
              }
              onUploadError={(error) =>
                toast.error(`${error.message} 업로드 실패`, {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                })
              }
              allowNonImageFile={true}
            />
          </div>

          {mainView === "article" && (
            <div className="demo-main-article">
              {/* Editor 탭의 toolbar가 차지하는 높이만큼 빈 공간을 둬서 탭 전환 시 콘텐츠가 위아래로 튀지 않게 함 */}
              <div
                className="demo-main-article-toolbar-spacer"
                style={{ height: toolbarHeight }}
                aria-hidden="true"
              />
              <TiptapContent html={html} />
            </div>
          )}
        </div>
      </section>

      <div
        className="demo-divider"
        onMouseDown={handleDividerMouseDown}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Main/Inspector 크기 조절"
      />

      <section
        className="demo-inspector"
        style={{ flex: `${1 - mainRatio} 0 0%` }}
      >
        <div
          className="demo-view-switch"
          role="tablist"
          aria-label="Inspector view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={inspectorView === "json"}
            onClick={() => setInspectorView("json")}
          >
            ProseMirror JSON
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inspectorView === "editor-dom"}
            onClick={() => setInspectorView("editor-dom")}
          >
            Editor DOM
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inspectorView === "article-html"}
            onClick={() => setInspectorView("article-html")}
          >
            Article HTML
          </button>
        </div>

        <div className="demo-inspector-content">
          {inspectorView === "json" && <JsonTreeViewer json={editorJson} />}
          {inspectorView === "editor-dom" && <DomTreeViewer html={editorDom} />}
          {inspectorView === "article-html" && <HtmlSourceViewer html={html} />}
        </div>
      </section>

      <ToastContainer />
    </div>
  );
}

export default App;
