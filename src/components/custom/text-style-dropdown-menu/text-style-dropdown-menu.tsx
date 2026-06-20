"use client";

import { forwardRef, useCallback, useState } from "react";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Tiptap UI ---
import { TextStyleButton } from "./text-style-button";
import {
  useTextStyleDropdownMenu,
  type UseTextStyleDropdownMenuConfig,
} from "./use-text-style-dropdown-menu";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";

export interface TextStyleDropdownMenuProps
  extends Omit<ButtonProps, "type">, UseTextStyleDropdownMenuConfig {
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean;
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Dropdown menu component for selecting a text style (heading level or paragraph size) in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useTextStyleDropdownMenu` hook instead.
 */
export const TextStyleDropdownMenu = forwardRef<
  HTMLButtonElement,
  TextStyleDropdownMenuProps
>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      portal = false,
      onOpenChange,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { isVisible, canApply, label, Icon, options } =
      useTextStyleDropdownMenu({
        editor,
        hideWhenUnavailable,
      });

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!editor || !canApply) return;
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [canApply, editor, onOpenChange],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            role="button"
            tabIndex={-1}
            disabled={!canApply}
            data-disabled={!canApply}
            aria-label={label}
            tooltip={"문단 모양"}
            {...buttonProps}
            ref={ref}
          >
            {children ? (
              children
            ) : (
              <>
                <Icon className="tiptap-button-icon" />
                <span className="tiptap-button-text">{label}</span>
                <ChevronDownIcon className="tiptap-button-dropdown-small" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal}>
          <Card className="tiptap">
            <CardBody>
              <ButtonGroup>
                {options.map((option) => (
                  <DropdownMenuItem key={option.value} asChild>
                    <TextStyleButton
                      editor={editor}
                      value={option.value}
                      text={option.label}
                      showTooltip={false}
                    />
                  </DropdownMenuItem>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

TextStyleDropdownMenu.displayName = "TextStyleDropdownMenu";

export default TextStyleDropdownMenu;
