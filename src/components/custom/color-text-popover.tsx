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
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { forwardRef, useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";
import { RiArrowDownSLine } from "@remixicon/react";
import { useEditorState } from "@tiptap/react";
import { colors } from "./variables";

interface UseColorTextPopoverConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onExecuted?: () => void;
}

interface ColorTextPopoverProps
  extends ButtonProps, UseColorTextPopoverConfig {}

const RECENT_MAX = 3;

interface SelectionColors {
  color: string | null;
  backgroundColor: string | null;
}

interface RecentPair {
  textColor: string | null;
  backgroundColor: string | null;
}

interface ColoredButtonIconProps {
  textColorHex: string | null;
  backgroundColorHex: string | null;
  className?: string;
}

const ColoredButtonIcon = ({
  textColorHex,
  backgroundColorHex,
  className = "",
}: ColoredButtonIconProps) => {
  const textColor = textColorHex ?? "#374151";
  const backgroundColor = backgroundColorHex ?? "#ffffff";
  const borderColor = textColorHex ?? "#e5e7eb";

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
        color: textColor,
        fontSize: "0.75rem",
        fontWeight: 700,
      }}
      aria-hidden
    >
      A
    </span>
  );
};

const COLOR_TEXT_POPOVER_RECENT_KEY = "color-text-popover-recent";

const loadRecentPairs = (): RecentPair[] => {
  try {
    const raw = localStorage.getItem(COLOR_TEXT_POPOVER_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentPair[];
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
};

const saveRecentPairs = (pairs: RecentPair[]) => {
  try {
    localStorage.setItem(
      COLOR_TEXT_POPOVER_RECENT_KEY,
      JSON.stringify(pairs.slice(0, RECENT_MAX)),
    );
  } catch {
    // ignore
  }
};

export const ColorTextPopover = forwardRef<
  HTMLButtonElement,
  ColorTextPopoverProps
>(({ editor: providedEditor, ...buttonProps }) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [recentPairs, setRecentPairs] = useState<RecentPair[]>(loadRecentPairs);

  const selectionAttrs = useEditorState({
    editor: editor ?? null,
    selector: (ctx): SelectionColors => {
      if (!ctx.editor) return { color: null, backgroundColor: null };
      const attrs = ctx.editor.getAttributes("textStyle") as {
        color?: string | null;
        backgroundColor?: string | null;
      };
      return {
        color: attrs.color ?? null,
        backgroundColor: attrs.backgroundColor ?? null,
      };
    },
  });

  const currentTextColor = selectionAttrs?.color ?? null;
  const currentBackgroundColor = selectionAttrs?.backgroundColor ?? null;

  const addRecent = useCallback(
    (textColor: string | null, backgroundColor: string | null) => {
      setRecentPairs((prev) => {
        const next = [
          { textColor, backgroundColor },
          ...prev.filter(
            (p) =>
              !(
                p.textColor === textColor &&
                p.backgroundColor === backgroundColor
              ),
          ),
        ].slice(0, RECENT_MAX);
        saveRecentPairs(next);
        return next;
      });
    },
    [],
  );

  const handleApplyTextColor = useCallback(
    (hex: string | null) => {
      if (!editor) return;
      if (hex === null) {
        editor.chain().focus().unsetColor().run();
      } else {
        editor.chain().focus().setColor(hex).run();
      }
      const bg = editor.getAttributes("textStyle").backgroundColor ?? null;
      addRecent(hex, bg);
    },
    [editor, addRecent],
  );

  const handleApplyBackgroundColor = useCallback(
    (hex: string | null) => {
      if (!editor) return;
      if (hex === null) {
        editor.chain().focus().unsetBackgroundColor().run();
      } else {
        editor.chain().focus().setBackgroundColor(hex).run();
      }
      const text = editor.getAttributes("textStyle").color ?? null;
      addRecent(text, hex);
    },
    [editor, addRecent],
  );

  const handleApplyRecent = useCallback(
    (pair: RecentPair) => {
      if (!editor) return;
      if (pair.textColor !== null) {
        editor.chain().focus().setColor(pair.textColor).run();
      } else {
        editor.chain().focus().unsetColor().run();
      }
      if (pair.backgroundColor !== null) {
        editor.chain().focus().setBackgroundColor(pair.backgroundColor).run();
      } else {
        editor.chain().focus().unsetBackgroundColor().run();
      }
      addRecent(pair.textColor, pair.backgroundColor);
    },
    [editor, addRecent],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          data-style="ghost"
          role="button"
          tooltip="글자 색상"
          {...buttonProps}
        >
          <ColoredButtonIcon
            textColorHex={currentTextColor}
            backgroundColorHex={currentBackgroundColor}
            className="tiptap-color-trigger-icon"
          />
          <RiArrowDownSLine
            className="tiptap-color-trigger-chevron"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Card>
          <CardBody>
            <CardGroupLabel>Recently Used</CardGroupLabel>
            <CardItemGroup orientation="horizontal">
              {recentPairs.map((pair, index) => (
                <Button
                  key={`${pair.textColor ?? ""}-${pair.backgroundColor ?? ""}-${index}`}
                  data-style="ghost"
                  type="button"
                  onClick={() => handleApplyRecent(pair)}
                  aria-label={`Apply recent color combination ${index + 1}`}
                  className="tiptap-color-recent-button"
                >
                  <ColoredButtonIcon
                    textColorHex={pair.textColor}
                    backgroundColorHex={pair.backgroundColor}
                  />
                </Button>
              ))}
            </CardItemGroup>

            <CardGroupLabel>Text Color</CardGroupLabel>
            <CardItemGroup orientation="horizontal">
              {colors.slice(0, 5).map((item, index) => {
                const isDefault = index === 0;
                const hex = isDefault ? null : item.contrastColor;
                const isActive =
                  currentTextColor === hex ||
                  (isDefault && currentTextColor === null);
                return (
                  <Button
                    key={item.name}
                    data-style="ghost"
                    type="button"
                    onClick={() => handleApplyTextColor(hex)}
                    aria-label={`Text color: ${item.name}`}
                    aria-pressed={isActive}
                    className="tiptap-color-text-button"
                  >
                    <ColoredButtonIcon
                      textColorHex={hex}
                      backgroundColorHex="#ffffff"
                    />
                  </Button>
                );
              })}
            </CardItemGroup>
            <CardItemGroup orientation="horizontal">
              {colors.slice(5, 10).map((item) => {
                const hex = item.contrastColor;
                const isActive = currentTextColor === hex;
                return (
                  <Button
                    key={item.name}
                    data-style="ghost"
                    type="button"
                    onClick={() => handleApplyTextColor(hex)}
                    aria-label={`Text color: ${item.name}`}
                    aria-pressed={isActive}
                    className="tiptap-color-text-button"
                  >
                    <ColoredButtonIcon
                      textColorHex={hex}
                      backgroundColorHex="#ffffff"
                    />
                  </Button>
                );
              })}
            </CardItemGroup>

            <CardGroupLabel>Highlight Color</CardGroupLabel>
            <CardItemGroup orientation="horizontal">
              {colors.slice(0, 5).map((item, index) => {
                const isDefault = index === 0;
                const hex = isDefault ? null : item.color;
                const isActive =
                  currentBackgroundColor === hex ||
                  (isDefault && currentBackgroundColor === null);
                return (
                  <Button
                    key={item.name}
                    data-style="ghost"
                    type="button"
                    onClick={() => handleApplyBackgroundColor(hex)}
                    aria-label={`Highlight color: ${item.name}`}
                    aria-pressed={isActive}
                    className="tiptap-color-highlight-button"
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "50%",
                        backgroundColor: hex ?? "#ffffff",
                        border: `1px solid ${hex ? item.contrastColor : "#e5e7eb"}`,
                      }}
                      aria-hidden
                    />
                  </Button>
                );
              })}
            </CardItemGroup>
            <CardItemGroup orientation="horizontal">
              {colors.slice(5, 10).map((item) => {
                const hex = item.color;
                const isActive = currentBackgroundColor === hex;
                return (
                  <Button
                    key={item.name}
                    data-style="ghost"
                    type="button"
                    onClick={() => handleApplyBackgroundColor(hex)}
                    aria-label={`Highlight color: ${item.name}`}
                    aria-pressed={isActive}
                    className="tiptap-color-highlight-button"
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "50%",
                        backgroundColor: hex ?? "#ffffff",
                        border: `1px solid ${hex ? item.contrastColor : "#e5e7eb"}`,
                      }}
                      aria-hidden
                    />
                  </Button>
                );
              })}
            </CardItemGroup>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
});

ColorTextPopover.displayName = "ColorTextPopover";
