import "./App.css";
import Tiptap from "./tiptap/index";
import { toast, ToastContainer, Bounce } from "react-toastify";

function App() {
  return (
    <>
      {/* 데모 전용 UI (헤더, 설명 등) — .demo-ui 안에서만 스타일 적용됨 */}
      <div className="demo-ui">{/* TODO: 데모 헤더/설명 추가 */}</div>

      {/* 에디터는 .demo-ui 밖에 위치 → demo-ui 스타일의 영향을 받지 않음 */}
      <Tiptap
        // uploadFile={uploadFile}
        onFileInsert={(file) =>
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
        onFileError={(error) =>
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
