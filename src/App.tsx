import { useState } from "react";
import "./App.css";
import "@junbyeol/tiptap-editor/style.css";
import { TiptapEditor } from "@junbyeol/tiptap-editor";
import { toast, ToastContainer, Bounce } from "react-toastify";
import HtmlSourceViewer from "./demo/HtmlSourceViewer";

const DEMO_INITIAL_CONTENT = `
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

function App() {
  const [html, setHtml] = useState(DEMO_INITIAL_CONTENT);
  const [isSourceCollapsed, setIsSourceCollapsed] = useState(false);

  return (
    <>
      {/* 데모 전용 UI (헤더, 설명 등) — .demo-ui 안에서만 스타일 적용됨 */}
      <div className="demo-ui demo-intro">
        <h1>@Junbyeol/tiptap-editor</h1>
        <p>
          npm 패키지 "@junbyeol/tiptap-editor"의 데모 페이지입니다. headless
          에디터인 tiptap을 기반으로 만들었으며, 다음과 같은 요소를 포함합니다.
        </p>
        <ul>
          <li>
            어떤 프로젝트에서든 바로 쓸 수 있는 WYSIWYG 리치 텍스트 에디터
          </li>
          <li>리치 텍스트를 화면에 렌더링하는 Wrapper React 컴포넌트와 CSS</li>
        </ul>
      </div>

      <div
        className={
          isSourceCollapsed
            ? "demo-layout demo-layout--source-collapsed"
            : "demo-layout"
        }
      >
        {/* 에디터는 .demo-ui 밖에 위치 → demo-ui 스타일의 영향을 받지 않음 */}
        <section className="demo-pane">
          <h2 className="demo-pane-title">에디터</h2>
          <TiptapEditor
            defaultValue={DEMO_INITIAL_CONTENT}
            onChange={(value) => {
              setHtml(value);
              console.log("[demo] onChange:", value);
            }}
            // uploadFile={uploadFile}
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
        </section>

        <section
          className={
            isSourceCollapsed
              ? "demo-pane demo-ui demo-pane--collapsed"
              : "demo-pane demo-ui"
          }
        >
          {isSourceCollapsed ? (
            <button
              type="button"
              className="demo-collapse-toggle"
              onClick={() => setIsSourceCollapsed(false)}
              aria-label="HTML 소스 펼치기"
              aria-expanded={false}
            >
              <span className="demo-pane-vertical-label">HTML 소스</span>
              <span aria-hidden="true">‹</span>
            </button>
          ) : (
            <>
              <div className="demo-pane-header">
                <h2 className="demo-pane-title">HTML 소스</h2>
                <button
                  type="button"
                  className="demo-collapse-toggle"
                  onClick={() => setIsSourceCollapsed(true)}
                  aria-label="HTML 소스 접기"
                  aria-expanded={true}
                >
                  ›
                </button>
              </div>
              <div className="demo-source-box">
                <HtmlSourceViewer html={html} />
              </div>
            </>
          )}
        </section>
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
