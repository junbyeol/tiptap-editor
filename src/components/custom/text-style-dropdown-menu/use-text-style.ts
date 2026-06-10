"use client";

import { useCallback, useEffect, useState } from "react";
import { type Editor } from "@tiptap/react";
import type { ComponentType } from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Lib ---
import {
  isNodeInSchema,
  isNodeTypeSelected,
  selectionWithinConvertibleTypes,
} from "@/lib/tiptap-utils";

// --- Tiptap ---
import type { ParagraphSize } from "@/tiptap/extensions";

// --- Icons ---
import { HeadingOneIcon } from "@/components/tiptap-icons/heading-one-icon";
import { HeadingTwoIcon } from "@/components/tiptap-icons/heading-two-icon";
import { HeadingThreeIcon } from "@/components/tiptap-icons/heading-three-icon";
import { ParagraphIcon } from "@/components/tiptap-icons/paragraph-icon";

export type TextStyleValue =
  | "heading1"
  | "heading2"
  | "heading3"
  | "paragraphLarge"
  | "paragraphNormal"
  | "paragraphSmall";

export interface TextStyleOption {
  value: TextStyleValue;
  label: string;
  nodeType: "heading" | "paragraph";
  attrs: { level: 1 | 2 | 3 } | { size: ParagraphSize };
  Icon: ComponentType<React.ComponentPropsWithoutRef<"svg">>;
}

const CONVERTIBLE_TYPES = [
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "taskList",
  "blockquote",
  "codeBlock",
];

export const TEXT_STYLE_OPTIONS: Record<TextStyleValue, TextStyleOption> = {
  heading1: {
    value: "heading1",
    label: "제목 1",
    nodeType: "heading",
    attrs: { level: 1 },
    Icon: HeadingOneIcon,
  },
  heading2: {
    value: "heading2",
    label: "제목 2",
    nodeType: "heading",
    attrs: { level: 2 },
    Icon: HeadingTwoIcon,
  },
  heading3: {
    value: "heading3",
    label: "제목 3",
    nodeType: "heading",
    attrs: { level: 3 },
    Icon: HeadingThreeIcon,
  },
  paragraphLarge: {
    value: "paragraphLarge",
    label: "본문 큼",
    nodeType: "paragraph",
    attrs: { size: "large" },
    Icon: ParagraphIcon,
  },
  paragraphNormal: {
    value: "paragraphNormal",
    label: "본문 보통",
    nodeType: "paragraph",
    attrs: { size: "normal" },
    Icon: ParagraphIcon,
  },
  paragraphSmall: {
    value: "paragraphSmall",
    label: "본문 작음",
    nodeType: "paragraph",
    attrs: { size: "small" },
    Icon: ParagraphIcon,
  },
};

export const TEXT_STYLE_VALUES = Object.keys(
  TEXT_STYLE_OPTIONS,
) as TextStyleValue[];

/**
 * 텍스트 스타일이 실제로 적용되는 HTML 태그와 attributes를 반환.
 * 드롭다운 항목 미리보기에 사용.
 */
export function getTextStylePreviewTag(value: TextStyleValue): {
  Tag: "h1" | "h2" | "h3" | "p";
  attrs: Record<string, string>;
} {
  const { nodeType, attrs } = TEXT_STYLE_OPTIONS[value];

  if (nodeType === "heading") {
    const { level } = attrs as { level: 1 | 2 | 3 };
    return { Tag: `h${level}` as "h1" | "h2" | "h3", attrs: {} };
  }

  const { size } = attrs as { size: ParagraphSize };
  return { Tag: "p", attrs: { "data-size": size } };
}

/**
 * 현재 선택 영역에 해당 텍스트 스타일이 적용되어 있는지 확인
 */
export function isTextStyleActive(
  editor: Editor | null,
  value: TextStyleValue,
): boolean {
  if (!editor || !editor.isEditable) return false;

  const { nodeType, attrs } = TEXT_STYLE_OPTIONS[value];
  return editor.isActive(nodeType, attrs);
}

/**
 * 현재 선택 영역에 해당 텍스트 스타일을 적용할 수 있는지 확인
 */
export function canSetTextStyle(
  editor: Editor | null,
  value: TextStyleValue,
): boolean {
  if (!editor || !editor.isEditable) return false;

  const { nodeType, attrs } = TEXT_STYLE_OPTIONS[value];

  if (
    !isNodeInSchema(nodeType, editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  if (!selectionWithinConvertibleTypes(editor, CONVERTIBLE_TYPES)) {
    return false;
  }

  // 이미 적용된 스타일은 setNode가 "변경 사항 없음"으로 보고 false를 반환하므로,
  // active 상태는 항상 적용 가능한 것으로 취급한다.
  if (isTextStyleActive(editor, value)) return true;

  return editor.can().setNode(nodeType, attrs);
}

/**
 * 현재 포커스된 블럭을 해당 텍스트 스타일로 전환
 */
export function setTextStyle(
  editor: Editor | null,
  value: TextStyleValue,
): boolean {
  if (!editor || !canSetTextStyle(editor, value)) return false;

  // 이미 적용된 스타일이면 트랜잭션을 발생시키지 않고 그대로 둔다.
  if (isTextStyleActive(editor, value)) return true;

  const { nodeType, attrs } = TEXT_STYLE_OPTIONS[value];
  return editor.chain().focus().setNode(nodeType, attrs).run();
}

/**
 * 텍스트 스타일 버튼/드롭다운을 표시할지 여부
 */
export function shouldShowTextStyle(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor) return false;
  if (!hideWhenUnavailable) return true;
  if (!editor.isEditable) return false;

  if (!editor.isActive("code")) {
    return TEXT_STYLE_VALUES.some((value) => canSetTextStyle(editor, value));
  }

  return true;
}

export interface UseTextStyleConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The text style value to apply.
   */
  value: TextStyleValue;
  /**
   * Whether the button should hide when not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after the text style is applied.
   */
  onApplied?: () => void;
}

export function useTextStyle(config: UseTextStyleConfig) {
  const {
    editor: providedEditor,
    value,
    hideWhenUnavailable = false,
    onApplied,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);

  const canApply = canSetTextStyle(editor, value);
  const isActive = isTextStyleActive(editor, value);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowTextStyle({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleApply = useCallback(() => {
    if (!editor) return false;

    const success = setTextStyle(editor, value);
    if (success) {
      onApplied?.();
    }
    return success;
  }, [editor, value, onApplied]);

  const option = TEXT_STYLE_OPTIONS[value];

  return {
    isVisible,
    isActive,
    canApply,
    handleApply,
    label: option.label,
    Icon: option.Icon,
  };
}
