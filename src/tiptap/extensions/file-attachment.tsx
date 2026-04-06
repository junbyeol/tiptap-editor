import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import type { ComponentType, RefObject } from "react";

export interface FileAttachmentAttributes {
  name: string;
  mimeType: string;
  url: string;
  size: number;
}

/**
 * componentRef를 인자로 받아 FileAttachment Node 확장을 생성하는 팩토리 함수.
 * ref 패턴을 사용하므로 컴포넌트가 동적으로 교체되어도 stale 클로저가 발생하지 않는다.
 */
export const createFileAttachmentExtension = (
  componentRef: RefObject<ComponentType<FileAttachmentAttributes> | undefined>,
) => {
  const FileAttachmentNodeView = ({ node }: NodeViewProps) => {
    const Component = componentRef.current;
    if (!Component) return null;

    return (
      <NodeViewWrapper>
        <Component {...(node.attrs as FileAttachmentAttributes)} />
      </NodeViewWrapper>
    );
  };

  return Node.create({
    name: "fileAttachment",
    group: "block",
    atom: true,

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
      return ReactNodeViewRenderer(FileAttachmentNodeView);
    },
  });
};
