import { findParentNode } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEditorState } from "@tiptap/react";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { ImageAlignLeftIcon } from "@/components/tiptap-icons/image-align-left";
import { ImageAlignCenterIcon } from "@/components/tiptap-icons/image-align-center";
import { ImageAlignRightIcon } from "@/components/tiptap-icons/image-align-right";
import { ImageRatioIcon } from "@/components/tiptap-icons/image-ratio";
import { ImageCaption } from "@/components/tiptap-icons/image-caption";
import type { FigureAlign } from "@/tiptap/extensions/FigureKit";

export interface ImageBubbleMenuProps {
  editor: Editor;
}

const isFigureActive = findParentNode((node) => node.type.name === "figure");

export const ImageBubbleMenu = ({ editor }: ImageBubbleMenuProps) => {
  const figureState = useEditorState({
    editor,
    selector: ({ editor }) => {
      const found = isFigureActive(editor.state.selection);
      if (!found)
        return { align: "center" as FigureAlign, hasFigcaption: false };
      return {
        align: (found.node.attrs.align ?? "center") as FigureAlign,
        hasFigcaption: found.node.lastChild?.type.name === "figcaption",
      };
    },
  });

  const setAlign = (align: FigureAlign) => {
    if (figureState.align === align) return;
    editor.chain().focus().setFigureAlign(align).run();
  };

  const handleCaption = () => {
    editor.chain().focus().toggleFigcaption().run();
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageBubbleMenu"
      shouldShow={({ state }) => !!isFigureActive(state.selection)}
      options={{ placement: "bottom" }}
      getReferencedVirtualElement={() => {
        const found = isFigureActive(editor.state.selection);
        if (!found) return null;
        const figureDOM = editor.view.nodeDOM(found.pos);
        if (!(figureDOM instanceof HTMLElement)) return null;
        return {
          getBoundingClientRect: () => figureDOM.getBoundingClientRect(),
        };
      }}
    >
      <Toolbar variant="floating">
        <ToolbarGroup>
          <Button
            data-style="ghost"
            tooltip="이미지 비율 조절"
            // data-active-state={"todo"}
            // aria-pressed={"todo"}
            // onClick={() => console.log("todo")}
          >
            <ImageRatioIcon className="tiptap-button-icon" />
          </Button>
          <ToolbarSeparator />
          <Button
            data-style="ghost"
            tooltip="왼쪽 정렬"
            data-active-state={figureState.align === "left" ? "on" : "off"}
            aria-pressed={figureState.align === "left"}
            onClick={() => setAlign("left")}
          >
            <ImageAlignLeftIcon className="tiptap-button-icon" />
          </Button>
          <Button
            data-style="ghost"
            tooltip="가운데 정렬"
            data-active-state={figureState.align === "center" ? "on" : "off"}
            aria-pressed={figureState.align === "center"}
            onClick={() => setAlign("center")}
          >
            <ImageAlignCenterIcon className="tiptap-button-icon" />
          </Button>
          <Button
            data-style="ghost"
            tooltip="오른쪽 정렬"
            data-active-state={figureState.align === "right" ? "on" : "off"}
            aria-pressed={figureState.align === "right"}
            onClick={() => setAlign("right")}
          >
            <ImageAlignRightIcon className="tiptap-button-icon" />
          </Button>
          <ToolbarSeparator />
          <Button
            data-style="ghost"
            tooltip="캡션"
            data-active-state={figureState.hasFigcaption ? "on" : "off"}
            aria-pressed={figureState.hasFigcaption}
            onClick={handleCaption}
          >
            <ImageCaption className="tiptap-button-icon" />
          </Button>
        </ToolbarGroup>
      </Toolbar>
    </BubbleMenu>
  );
};
