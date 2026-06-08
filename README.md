# @junbyeol/tiptap-editor

React용 Tiptap 리치 텍스트 에디터 컴포넌트입니다. 텍스트 서식, 표, 파일 첨부 등의 기능을 포함합니다.

~**[데모 보기](https://your-demo-url.com)**~
준비중

## 기능

- 텍스트 서식 (Bold, Italic, Strike, Underline, Code, 색상)
- 제목 (H1~H6), 목록, 텍스트 정렬
- 표 삽입 및 편집 (셀 병합, 배경색)
- 이미지 / 파일 드래그&드롭 및 붙여넣기
- 다크모드 지원

## 설치

```bash
npm install @junbyeol/tiptap-editor
```

## 사용법

```tsx
import { TiptapEditor } from "@junbyeol/tiptap-editor";
import "@junbyeol/tiptap-editor/style.css";

export default function App() {
  return <TiptapEditor />;
}
```

### Props

| Prop                      | 타입                                      | 설명                                                                    |
| ------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| `defaultValue`            | `string`                                  | 초기 HTML 콘텐츠. 마운트 시에만 적용됨                                  |
| `onChange`                | `(html: string) => void`                  | 콘텐츠 변경 시 호출. HTML 문자열을 반환                                 |
| `minHeight`               | `string`                                  | 콘텐츠 영역 최소 높이 (기본값: `200px`)                                 |
| `maxHeight`               | `string`                                  | 콘텐츠 영역 최대 높이. 초과 시 내부 스크롤 (기본값: 없음)               |
| `uploadFile`              | `(file: File) => Promise<string>`         | 파일을 업로드하고 URL을 반환. 미제공 시 base64로 브라우저 메모리에 저장 |
| `onFileInsert`            | `(file: File) => void`                    | 파일이 에디터에 삽입될 때 호출                                          |
| `onFileError`             | `(error: Error) => void`                  | 파일 처리 오류 시 호출                                                  |
| `allowNonImageFile`       | `boolean`                                 | 이미지 외 파일(PDF 등) 허용 여부 (기본값: `false`)                      |
| `FileAttachmentComponent` | `ComponentType<FileAttachmentAttributes>` | 비이미지 파일을 렌더링할 컴포넌트                                       |

### 파일 업로드 예시

```tsx
import { TiptapEditor } from "@junbyeol/tiptap-editor";
import "@junbyeol/tiptap-editor/style.css";

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const { url } = await res.json();
  return url;
};

export default function App() {
  return (
    <TiptapEditor
      uploadFile={uploadFile}
      onFileInsert={(file) => console.log("삽입됨:", file.name)}
      onFileError={(error) => console.error(error)}
      allowNonImageFile
    />
  );
}
```

## 로컬 개발

```bash
# 의존성 설치
yarn

# 데모 앱 실행
yarn dev

# 라이브러리 빌드
yarn build:lib
```
