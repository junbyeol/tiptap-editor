"use client";

import { forwardRef, useCallback, useState } from "react";
import { useEditorState } from "@tiptap/react";

import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
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

const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 36] as const;

export interface FontSizeDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: ReturnType<typeof useTiptapEditor>["editor"];
  portal?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const FontSizeDropdownMenu = forwardRef<
  HTMLButtonElement,
  FontSizeDropdownMenuProps
>(
  (
    {
      editor: providedEditor,
      portal = false,
      onOpenChange,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = useState(false);

    const currentSize = useEditorState({
      editor,
      selector: ({ editor: e }) => {
        if (!e) return null;
        const val = e.getAttributes("textStyle").fontSize as
          | number
          | null
          | undefined;
        return val ?? null;
      },
    });

    const canApply = !!editor;

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!canApply) return;
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [canApply, onOpenChange],
    );

    const handleReset = useCallback(() => {
      editor?.chain().focus().unsetFontSize().run();
    }, [editor]);

    const handleSelect = useCallback(
      (size: number) => {
        if (!editor) return;
        if (currentSize === size) {
          editor.chain().focus().unsetFontSize().run();
        } else {
          editor.chain().focus().setFontSize(size).run();
        }
      },
      [editor, currentSize],
    );

    if (!editor) return null;

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
            aria-label="글자 크기"
            tooltip="글자 크기"
            {...buttonProps}
            ref={ref}
          >
            {children ?? (
              <>
                <span className="tiptap-button-text">{currentSize ?? "-"}</span>
                <ChevronDownIcon className="tiptap-button-dropdown-small" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal}>
          <Card>
            <CardBody>
              <ButtonGroup>
                <DropdownMenuItem asChild onSelect={handleReset}>
                  <Button
                    type="button"
                    variant="ghost"
                    data-active-state={currentSize === null ? "on" : "off"}
                    aria-pressed={currentSize === null}
                  >
                    <span className="tiptap-button-text">기본값</span>
                  </Button>
                </DropdownMenuItem>
                {FONT_SIZES.map((size) => (
                  <DropdownMenuItem
                    key={size}
                    asChild
                    onSelect={() => handleSelect(size)}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      data-active-state={currentSize === size ? "on" : "off"}
                      aria-pressed={currentSize === size}
                    >
                      <span className="tiptap-button-text">{size}</span>
                    </Button>
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

FontSizeDropdownMenu.displayName = "FontSizeDropdownMenu";

export default FontSizeDropdownMenu;
