import { forwardRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { RiPaintFill } from "@remixicon/react";
import { colors } from "./variables";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover";
import {
  Button,
  type ButtonProps,
} from "@/components/tiptap-ui-primitive/button";
import {
  Card,
  CardBody,
  CardItemGroup,
  CardGroupLabel,
} from "@/components/tiptap-ui-primitive/card";

interface UseTableCellBackgroundColorPopoverConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onExecuted?: () => void;
}

interface TableCellBackgroundColorPopoverProps
  extends ButtonProps, UseTableCellBackgroundColorPopoverConfig {}

interface ColoredButtonIconProps {
  backgroundColorHex: string | null;
  borderColorHex: string | null;
  className?: string;
}

export const ColoredButtonIcon = ({
  backgroundColorHex,
  borderColorHex,
  className = "",
}: ColoredButtonIconProps) => {
  const backgroundColor = backgroundColorHex ?? "#ffffff";
  const borderColor = borderColorHex ?? "#e5e7eb";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.5rem",
        height: "1.5rem",
        borderRadius: "50%",
        border: `1px solid ${borderColor}`,
        backgroundColor,
        fontSize: "0.75rem",
        fontWeight: 700,
      }}
      aria-hidden
    />
  );
};

export const TableCellBackgroundColorPopover = forwardRef<
  HTMLButtonElement,
  TableCellBackgroundColorPopoverProps
>(({ editor: providedEditor, ...buttonProps }, ref) => {
  const { editor } = useTiptapEditor(providedEditor);

  const handleApplyBackgroundColor = useCallback(
    (hex: string) => {
      if (!editor) return;
      editor.chain().focus().setCellAttribute("backgroundColor", hex).run();
    },
    [editor],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          data-style="ghost"
          tooltip="셀 배경색 변경"
          {...buttonProps}
        >
          <RiPaintFill className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Card>
          <CardBody>
            <CardGroupLabel>Background Color</CardGroupLabel>
            <CardItemGroup orientation="horizontal">
              {colors.slice(0, 5).map((color, index) => (
                <Button
                  key={`${color.color}-${index}`}
                  data-style="ghost"
                  type="button"
                  onClick={() => handleApplyBackgroundColor(color.color)}
                  aria-label={`Background color: ${color.name}`}
                  className="tiptap-background-color-button"
                >
                  <ColoredButtonIcon
                    backgroundColorHex={color.color}
                    borderColorHex={color.contrastColor}
                  />
                </Button>
              ))}
            </CardItemGroup>
            <CardItemGroup orientation="horizontal">
              {colors.slice(5, 10).map((color, index) => (
                <Button
                  key={`${color.color}-${index}`}
                  data-style="ghost"
                  type="button"
                  onClick={() => handleApplyBackgroundColor(color.color)}
                  aria-label={`Background color: ${color.name}`}
                  className="tiptap-background-color-button"
                >
                  <ColoredButtonIcon
                    backgroundColorHex={color.color}
                    borderColorHex={color.contrastColor}
                  />
                </Button>
              ))}
            </CardItemGroup>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
});
