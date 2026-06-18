import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { findParentNode } from "@tiptap/core";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Input } from "@/components/tiptap-ui-primitive/input";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";
import { Separator } from "@/components/tiptap-ui-primitive/separator";
import { ImageRatioIcon } from "@/components/tiptap-icons/image-ratio";
import { CheckIcon } from "@/components/tiptap-icons/check-icon";
import { Undo2Icon } from "@/components/tiptap-icons/undo2-icon";

interface ImageRatioPopoverProps {
  editor: Editor;
}

const isFigureActive = findParentNode((node) => node.type.name === "figure");

function getImageInfo(editor: Editor) {
  const found = isFigureActive(editor.state.selection);
  if (!found) return null;
  const imagePos = found.pos + 1;
  const imageNode = editor.state.doc.nodeAt(imagePos);
  const container = editor.view.nodeDOM(imagePos);
  const img =
    container instanceof HTMLElement ? container.querySelector("img") : null;
  return { imagePos, imageNode, img };
}

function readCurrentDimensions(editor: Editor): {
  width: number;
  height: number;
} {
  const info = getImageInfo(editor);
  if (!info) return { width: 0, height: 0 };

  // ProseMirror attrs (set by resize commit) 우선
  const attrW = info.imageNode?.attrs.width;
  const attrH = info.imageNode?.attrs.height;
  if (attrW && attrH) return { width: attrW, height: attrH };

  // DOM fallback
  const { img } = info;
  if (img) {
    return {
      width: Math.round(img.offsetWidth || img.naturalWidth),
      height: Math.round(img.offsetHeight || img.naturalHeight),
    };
  }

  return { width: 0, height: 0 };
}

export function ImageRatioPopover({ editor }: ImageRatioPopoverProps) {
  const [open, setOpen] = useState(false);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOriginalDims(readCurrentDimensions(editor));
      setWidthInput("");
      setHeightInput("");
    }
    setOpen(nextOpen);
  };

  const widthNum = Number(widthInput);
  const heightNum = Number(heightInput);
  const isWidthDriving = widthInput !== "" && !isNaN(widthNum) && widthNum > 0;
  const isHeightDriving =
    !isWidthDriving && heightInput !== "" && !isNaN(heightNum) && heightNum > 0;

  const ratio =
    originalDims.height > 0 ? originalDims.width / originalDims.height : 1;

  const computedHeight = isWidthDriving ? Math.round(widthNum / ratio) : null;
  const computedWidth = isHeightDriving ? Math.round(heightNum * ratio) : null;

  const applyWidth = isWidthDriving
    ? widthNum
    : isHeightDriving
      ? computedWidth!
      : null;
  const applyHeight = isWidthDriving
    ? computedHeight!
    : isHeightDriving
      ? heightNum
      : null;
  const canApply =
    applyWidth !== null &&
    applyHeight !== null &&
    applyWidth > 0 &&
    applyHeight > 0;

  const handleApply = () => {
    if (!canApply) return;

    const info = getImageInfo(editor);
    if (!info) return;

    const { imagePos, img } = info;

    // 1. 즉각적인 시각 반영: img DOM 직접 변경
    if (img) {
      img.style.width = `${applyWidth}px`;
      img.style.height = `${applyHeight}px`;
    }

    // 2. ProseMirror document에 저장
    // ResizableNodeView의 onCommit과 동일한 패턴 사용:
    // setNodeSelection + updateAttributes를 하나의 체인 트랜잭션으로 처리해야
    // 히스토리 플러그인이 이전 스텝과 병합하지 않음.
    editor
      .chain()
      .setNodeSelection(imagePos)
      .updateAttributes("image", { width: applyWidth, height: applyHeight })
      .focus()
      .run();

    setOpen(false);
  };

  const handleReset = () => {
    setWidthInput("");
    setHeightInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  const handleNumericInput =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value.replace(/[^0-9]/g, ""));
    };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          data-style="ghost"
          tooltip="이미지 크기 조절"
          data-active-state={open ? "on" : "off"}
          aria-pressed={open}
        >
          <ImageRatioIcon className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" sideOffset={8}>
        <Card>
          <CardBody>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                width: "160px",
              }}
            >
              <DimRow
                label="W"
                value={
                  isHeightDriving ? String(computedWidth ?? "") : widthInput
                }
                placeholder={String(originalDims.width || "")}
                disabled={isHeightDriving}
                onChange={handleNumericInput(setWidthInput)}
                onKeyDown={handleKeyDown}
              />
              <DimRow
                label="H"
                value={
                  isWidthDriving ? String(computedHeight ?? "") : heightInput
                }
                placeholder={String(originalDims.height || "")}
                disabled={isWidthDriving}
                onChange={handleNumericInput(setHeightInput)}
                onKeyDown={handleKeyDown}
              />
              <Separator orientation="horizontal" decorative />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "2px",
                }}
              >
                <Button
                  data-style="ghost"
                  tooltip="적용 (Enter)"
                  disabled={!canApply}
                  data-disabled={!canApply}
                  onClick={handleApply}
                >
                  <CheckIcon className="tiptap-button-icon" />
                </Button>
                <Button
                  data-style="ghost"
                  tooltip="초기화"
                  onClick={handleReset}
                >
                  <Undo2Icon className="tiptap-button-icon" />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

interface DimRowProps {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
}

function DimRow({
  label,
  value,
  placeholder,
  disabled,
  onChange,
  onKeyDown,
}: DimRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--tt-gray-light-a-600)",
          width: "10px",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <Input
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onKeyDown={onKeyDown}
        style={{ flex: 1, minWidth: 0 }}
      />
    </div>
  );
}
