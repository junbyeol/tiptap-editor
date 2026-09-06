import { useEffect, useRef } from "react";

export interface TiptapContentProps {
  html: string;
  className?: string;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * renderHTML 수정 이전에 저장된 게시글은 <div data-type="file-attachment">가
 * 자식 없이 비어 있다. name/url 속성만으로 앵커+아이콘을 복원해 하위 호환을
 * 유지한다 (신규 저장분은 이미 자식이 있으므로 건너뛴다).
 */
function upgradeLegacyFileAttachments(container: Element) {
  const legacyNodes = container.querySelectorAll(
    'div[data-type="file-attachment"]',
  );

  legacyNodes.forEach((el) => {
    if (el.childElementCount > 0) return;

    const name = el.getAttribute("name") ?? "";
    const url = el.getAttribute("url") ?? "";
    if (!url) return;

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.className = "file-attachment";
    anchor.setAttribute("aria-label", `${name} 다운로드`);

    const icon = document.createElementNS(SVG_NS, "svg");
    icon.setAttribute("width", "18");
    icon.setAttribute("height", "18");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2.5");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.setAttribute("class", "file-attachment__icon");
    icon.setAttribute("aria-hidden", "true");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M12 5v14M5 12l7 7 7-7");
    icon.appendChild(path);

    const label = document.createElement("span");
    label.className = "file-attachment__name";
    label.textContent = name;

    anchor.append(icon, label);
    el.appendChild(anchor);
  });
}

const TiptapContent = ({ html, className }: TiptapContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      upgradeLegacyFileAttachments(containerRef.current);
    }
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={className ? `tiptap ${className}` : "tiptap"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default TiptapContent;
