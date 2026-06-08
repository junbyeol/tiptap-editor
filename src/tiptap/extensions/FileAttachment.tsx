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

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "file-attachment" }),
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
