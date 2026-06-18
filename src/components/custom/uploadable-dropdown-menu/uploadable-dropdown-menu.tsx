"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import { UploadableIcon } from "@/components/tiptap-icons/uploadable-icon";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { useFileHandlerContext } from "@/tiptap/contexts/FileHandlerContext";

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

// --- Custom ---
import { UploadableButton } from "./uploadable-button";

export interface UploadableDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean;
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
}

export const UploadableDropdownMenu = forwardRef<
  HTMLButtonElement,
  UploadableDropdownMenuProps
>(
  (
    { editor: providedEditor, portal = false, onOpenChange, ...buttonProps },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { resolveFileUrl, insertFile } = useFileHandlerContext();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!editor) return;
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [editor, onOpenChange],
    );

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor) return;
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const pos = editor.state.selection.anchor;
        for (const file of files) {
          const url = await resolveFileUrl(file);
          if (!url) return;
          insertFile(editor, file, url, pos);
        }

        e.target.value = "";
      },
      [editor, resolveFileUrl, insertFile],
    );

    return (
      <>
        <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              role="button"
              tabIndex={-1}
              aria-label="첨부"
              tooltip="첨부"
              {...buttonProps}
              ref={ref}
            >
              <UploadableIcon className="tiptap-button-icon" />
              <ChevronDownIcon className="tiptap-button-dropdown-small" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" portal={portal}>
            <Card>
              <CardBody>
                <ButtonGroup>
                  <DropdownMenuItem asChild>
                    <UploadableButton
                      editor={editor}
                      uploadType="image"
                      text="사진"
                      externalInputRef={imageInputRef}
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <UploadableButton
                      editor={editor}
                      uploadType="file"
                      text="파일"
                      externalInputRef={fileInputRef}
                    />
                  </DropdownMenuItem>
                </ButtonGroup>
              </CardBody>
            </Card>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* DropdownMenuContent 바깥에 위치 — dropdown이 닫혀도 unmount되지 않음 */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </>
    );
  },
);

UploadableDropdownMenu.displayName = "UploadableDropdownMenu";

export default UploadableDropdownMenu;
