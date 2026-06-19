import Image from "@tiptap/extension-image";

export const ImageKit = Image.extend({
  addNodeView() {
    const parentFactory = this.parent?.();
    if (!parentFactory) return null;

    return (args) => {
      const nodeView = parentFactory(args);
      if (!nodeView) return nodeView;

      // ProseMirror의 NodeView.update()는 attrs가 변경돼도 DOM 사이즈를
      // 재적용하지 않음 (applyInitialSize가 constructor에서만 호출되기 때문).
      // undo/redo 시 attrs가 되돌아가면 DOM도 함께 되돌아가야 하므로 패치.
      let prevWidth = args.node.attrs.width;
      let prevHeight = args.node.attrs.height;

      const originalUpdate = nodeView.update?.bind(nodeView);

      nodeView.update = (node, decorations, innerDecorations) => {
        const result =
          originalUpdate?.(node, decorations, innerDecorations) ?? true;
        if (result !== false) {
          const { width, height } = node.attrs;
          if (width !== prevWidth || height !== prevHeight) {
            const img = (nodeView.dom as HTMLElement).querySelector("img");
            if (img) {
              if (width) img.style.width = `${width}px`;
              else img.style.removeProperty("width");
              if (height) img.style.height = `${height}px`;
              else img.style.removeProperty("height");
            }
            prevWidth = width;
            prevHeight = height;
          }
        }
        return result;
      };

      return nodeView;
    };
  },
});
