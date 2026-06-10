import { forwardRef, useCallback } from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Tiptap UI ---
import {
  getTextStylePreviewTag,
  useTextStyle,
  type UseTextStyleConfig,
} from "./use-text-style";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";

export interface TextStyleButtonProps
  extends Omit<ButtonProps, "type" | "value">, UseTextStyleConfig {
  /**
   * Optional text to display.
   */
  text?: string;
}

/**
 * Button component for applying a text style (heading level or paragraph size) in a Tiptap editor.
 *
 * For custom button implementations, use the `useTextStyle` hook instead.
 */
export const TextStyleButton = forwardRef<
  HTMLButtonElement,
  TextStyleButtonProps
>(
  (
    {
      editor: providedEditor,
      value,
      text,
      hideWhenUnavailable = false,
      onApplied,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canApply, isActive, handleApply, label } = useTextStyle({
      editor,
      value,
      hideWhenUnavailable,
      onApplied,
    });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleApply();
      },
      [handleApply, onClick],
    );

    if (!isVisible) {
      return null;
    }

    const { Tag, attrs } = getTextStylePreviewTag(value);

    return (
      <Button
        type="button"
        variant="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canApply}
        data-disabled={!canApply}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <Tag {...attrs} className="tiptap-button-text">
            {text ?? label}
          </Tag>
        )}
      </Button>
    );
  },
);

TextStyleButton.displayName = "TextStyleButton";
