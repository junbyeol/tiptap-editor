"use client";

import { forwardRef, useCallback, useEffect, useState } from "react";
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
import { NANUM_FONTS } from "./nanum-fonts";

function injectFontLink(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export interface FontFamilyDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: ReturnType<typeof useTiptapEditor>["editor"];
  portal?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const FontFamilyDropdownMenu = forwardRef<
  HTMLButtonElement,
  FontFamilyDropdownMenuProps
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

    const currentFamily = useEditorState({
      editor,
      selector: ({ editor: e }) => {
        if (!e) return null;
        const val = e.getAttributes("textStyle").fontFamily as
          | string
          | null
          | undefined;
        return val ?? null;
      },
    });

    const currentLabel =
      NANUM_FONTS.find((f) => f.family === currentFamily)?.label ?? null;

    useEffect(() => {
      if (!isOpen) return;
      NANUM_FONTS.forEach((font) => injectFontLink(font.href));
    }, [isOpen]);

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
      editor?.chain().focus().unsetFontFamily().run();
    }, [editor]);

    const handleSelect = useCallback(
      (family: string) => {
        if (!editor) return;
        if (currentFamily === family) {
          editor.chain().focus().unsetFontFamily().run();
        } else {
          editor.chain().focus().setFontFamily(family).run();
        }
      },
      [editor, currentFamily],
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
            aria-label="글자체"
            tooltip="글자체"
            {...buttonProps}
            ref={ref}
          >
            {children ?? (
              <>
                <span className="tiptap-button-text">
                  {currentLabel ?? "기본서체"}
                </span>
                <ChevronDownIcon className="tiptap-button-dropdown-small" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal}>
          <Card>
            <CardBody>
              <ButtonGroup orientation="vertical">
                <DropdownMenuItem asChild onSelect={handleReset}>
                  <Button
                    type="button"
                    variant="ghost"
                    data-active-state={currentFamily === null ? "on" : "off"}
                    aria-pressed={currentFamily === null}
                  >
                    <span className="tiptap-button-text">기본서체</span>
                  </Button>
                </DropdownMenuItem>
                {NANUM_FONTS.map((font) => (
                  <DropdownMenuItem
                    key={font.family}
                    asChild
                    onSelect={() => handleSelect(font.family)}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      data-active-state={
                        currentFamily === font.family ? "on" : "off"
                      }
                      aria-pressed={currentFamily === font.family}
                    >
                      <span
                        className="tiptap-button-text"
                        style={{ fontFamily: `'${font.family}'` }}
                      >
                        {font.label}
                      </span>
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

FontFamilyDropdownMenu.displayName = "FontFamilyDropdownMenu";

export default FontFamilyDropdownMenu;
