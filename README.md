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
| `onUploadStart`           | `(file: File) => void`                    | 파일 업로드 시작 시 호출                                                |
| `onUploadSuccess`         | `(file: File) => void`                    | 파일 업로드 성공 시 호출                                                |
| `onUploadError`           | `(error: Error) => void`                  | 파일 업로드 오류 시 호출                                                |
| `allowNonImageFile`       | `boolean`                                 | 이미지 외 파일(PDF 등) 허용 여부 (기본값: `false`)                      |
| `FileAttachmentComponent` | `ComponentType<FileAttachmentAttributes>` | 비이미지 파일을 렌더링할 컴포넌트. `allowNonImageFile`이 `true`일 때 유효 |

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
      onUploadStart={(file) => console.log("업로드 시작:", file.name)}
      onUploadSuccess={(file) => console.log("업로드 완료:", file.name)}
      onUploadError={(error) => console.error(error)}
      allowNonImageFile
    />
  );
}
```

## 콘텐츠 렌더링 (읽기 전용)

저장된 HTML을 읽기 전용으로 표시할 때는 `TiptapContent`를 사용합니다. 에디터 없이 콘텐츠 스타일만 적용된 뷰어 역할을 합니다.

```tsx
import { TiptapContent } from "@junbyeol/tiptap-editor";
import "@junbyeol/tiptap-editor/style.css";

export default function PostPage({ post }) {
  return <TiptapContent html={post.content} />;
}
```

### Props

| Prop        | 타입     | 설명                                          |
| ----------- | -------- | --------------------------------------------- |
| `html`      | `string` | 렌더링할 HTML 문자열 (필수)                   |
| `className` | `string` | 루트 `div`에 추가할 CSS 클래스 (선택)         |

## 폰트 적용

에디터에서 선택할 수 있는 나눔 폰트 시리즈는 별도로 로드해야 합니다. **에디터 페이지와 Viewer 페이지 모두**에 적용해야 WYSIWYG이 보장됩니다.

이 패키지는 두 가지 방식으로 폰트 로드를 지원합니다.

### 방법 A: React 컴포넌트

`EditorFontStylesheets` 컴포넌트를 `<head>` 안에 렌더링합니다.

**Next.js App Router (`layout.tsx`)**

```tsx
import { EditorFontStylesheets } from "@junbyeol/tiptap-editor";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <EditorFontStylesheets />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Next.js Pages Router (`_document.tsx`)**

```tsx
import { Html, Head, Main, NextScript } from "next/document";
import { EditorFontStylesheets } from "@junbyeol/tiptap-editor";

export default function Document() {
  return (
    <Html>
      <Head>
        <EditorFontStylesheets />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### 방법 B: 폰트 링크 데이터 직접 사용

`EDITOR_FONT_LINKS`를 직접 사용해 프레임워크에 맞게 삽입합니다.

```tsx
import { EDITOR_FONT_LINKS } from "@junbyeol/tiptap-editor";

// EDITOR_FONT_LINKS 구조:
// [{ family: "Nanum Gothic", href: "https://fonts.googleapis.com/..." }, ...]

// 예: React Helmet
import { Helmet } from "react-helmet";

export default function App() {
  return (
    <>
      <Helmet>
        {EDITOR_FONT_LINKS.map((font) => (
          <link key={font.family} rel="stylesheet" href={font.href} />
        ))}
      </Helmet>
      {/* ... */}
    </>
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
