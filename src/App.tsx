import "./App.css";
import "@junbyeol/tiptap-editor/style.css";
import { TiptapEditor } from "@junbyeol/tiptap-editor";
import { toast, ToastContainer, Bounce } from "react-toastify";

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
  return (
    <>
      {/* 데모 전용 UI (헤더, 설명 등) — .demo-ui 안에서만 스타일 적용됨 */}
      <div className="demo-ui">{/* TODO: 데모 헤더/설명 추가 */}</div>

      {/* 에디터는 .demo-ui 밖에 위치 → demo-ui 스타일의 영향을 받지 않음 */}
      <TiptapEditor
        defaultValue={DEMO_INITIAL_CONTENT}
        onChange={(html) => console.log("[demo] onChange:", html)}
        // uploadFile={uploadFile}
        onUploadStart={(file) =>
          toast(`${file.name} 업로드 시작`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            transition: Bounce,
          })
        }
        onUploadSuccess={(file) =>
          toast.success(`${file.name} 업로드 완료`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
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
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
          })
        }
        allowNonImageFile={true}
      />
      <ToastContainer />
    </>
  );
}

export default App;
