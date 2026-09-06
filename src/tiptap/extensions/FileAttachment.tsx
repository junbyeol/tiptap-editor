import { Node, Extension, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import type { ComponentType } from "react";
import { DefaultFileAttachmentComponent } from "./DefaultFileAttachmentComponent";

export interface FileAttachmentAttributes {
  name: string;
  mimeType: string;
  url: string;
  size: number;
}

export interface FileAttachmentOptions {
  component: ComponentType<FileAttachmentAttributes>;
}

export const FileAttachmentNode = Node.create<FileAttachmentOptions>({
  name: "fileAttachment",
  group: "block",
  atom: true,

  addOptions() {
    return {
      component: DefaultFileAttachmentComponent,
    };
  },

  addAttributes() {
    return {
      name: { default: "" },
      mimeType: { default: "" },
      url: { default: "" },
      size: { default: 0 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="file-attachment"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { name, url } = node.attrs as FileAttachmentAttributes;

    // DefaultFileAttachmentComponent(NodeView)가 그리는 것과 동일한 정적
    // 마크업을 직렬화해야 한다 — NodeView는 저장 시점(getHTML)에는 실행되지
    // 않으므로, 여기서 직접 앵커/아이콘/파일명을 넣지 않으면 저장된 HTML은
    // 빈 div가 되어 게시글에서 첨부파일이 통째로 사라진다.
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "file-attachment" }),
      [
        "a",
        {
          href: url,
          download: name,
          class: "file-attachment",
          tabindex: "0",
          "aria-label": `${name} 다운로드`,
        },
        [
          "http://www.w3.org/2000/svg svg",
          {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2.5",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            class: "file-attachment__icon",
            "aria-hidden": "true",
          },
          ["path", { d: "M12 5v14M5 12l7 7 7-7" }],
        ],
        ["span", { class: "file-attachment__name" }, name],
      ],
    ];
  },

  addNodeView() {
    // this.options.component는 extension 초기화 시 1회 세팅되는 값이므로
    // 렌더 중 ref를 읽는 문제 없이 안전하게 클로저로 캡처 가능
    const Component = this.options.component;
    return ReactNodeViewRenderer(({ node }: NodeViewProps) => (
      <NodeViewWrapper>
        <Component {...(node.attrs as FileAttachmentAttributes)} />
      </NodeViewWrapper>
    ));
  },
});

export const FileAttachment = Extension.create<FileAttachmentOptions>({
  name: "fileAttachmentKit",

  addOptions() {
    return {
      component: DefaultFileAttachmentComponent,
    };
  },

  addExtensions() {
    return [
      FileAttachmentNode.configure({
        component: this.options.component,
      }),
    ];
  },
});
