import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Tiptap UI ---
import {
  TEXT_STYLE_OPTIONS,
  TEXT_STYLE_VALUES,
  canSetTextStyle,
  isTextStyleActive,
  shouldShowTextStyle,
  type TextStyleValue,
} from "./use-text-style";

const DEFAULT_VALUE: TextStyleValue = "paragraphNormal";

/**
 * 현재 선택 영역에 적용된 텍스트 스타일을 반환.
 * 6개 옵션 중 어디에도 해당하지 않으면 undefined.
 */
export function getActiveTextStyle(
  editor: Editor | null,
  values: TextStyleValue[] = TEXT_STYLE_VALUES,
): TextStyleValue | undefined {
  if (!editor || !editor.isEditable) return undefined;
  return values.find((value) => isTextStyleActive(editor, value));
}

export interface UseTextStyleDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the dropdown should hide when not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
}

export function useTextStyleDropdownMenu(
  config?: UseTextStyleDropdownMenuConfig,
) {
  const { editor: providedEditor, hideWhenUnavailable = false } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);

  const activeValue = getActiveTextStyle(editor) ?? DEFAULT_VALUE;
  const activeOption = TEXT_STYLE_OPTIONS[activeValue];
  const canApply = TEXT_STYLE_VALUES.some((value) =>
    canSetTextStyle(editor, value),
  );

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

  return {
    isVisible,
    activeValue,
    canApply,
    label: activeOption.label,
    Icon: activeOption.Icon,
    options: TEXT_STYLE_VALUES.map((value) => TEXT_STYLE_OPTIONS[value]),
  };
}
