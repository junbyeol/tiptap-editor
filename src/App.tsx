import "./App.css";
import Tiptap from "./tiptap/index";
import { toast, ToastContainer, Bounce } from "react-toastify";

function App() {
  return (
    <>
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
