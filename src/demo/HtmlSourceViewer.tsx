import { useEffect, useRef, useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import htmlLang from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import atomOneLight from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light";
import { diffLines } from "diff";
import * as jsBeautify from "js-beautify";
import "./HtmlSourceViewer.css";

SyntaxHighlighter.registerLanguage("html", htmlLang);

const FLASH_DURATION_MS = 1200;

interface HtmlSourceViewerProps {
  html: string;
}

const HtmlSourceViewer = ({ html }: HtmlSourceViewerProps) => {
  const formatted = jsBeautify.html(html, { indent_size: 2 });
  const previousFormattedRef = useRef<string | null>(null);
  const [changedLines, setChangedLines] = useState<Set<number>>(new Set());

  useEffect(() => {
    const previous = previousFormattedRef.current;
    previousFormattedRef.current = formatted;

    if (previous === null || previous === formatted) {
      return;
    }

    const changed = new Set<number>();
    let line = 1;
    for (const part of diffLines(previous, formatted)) {
      if (part.removed) continue;
      if (part.added) {
        for (let i = 0; i < part.count; i++) changed.add(line + i);
      }
      line += part.count;
    }

    setChangedLines(changed);
    const timer = setTimeout(
      () => setChangedLines(new Set()),
      FLASH_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [formatted]);

  return (
    <SyntaxHighlighter
      language="html"
      style={atomOneLight}
      showLineNumbers
      wrapLines
      lineProps={(lineNumber: number) => ({
        className: changedLines.has(lineNumber)
          ? "html-source-line--changed"
          : undefined,
      })}
      customStyle={{ margin: 0 }}
    >
      {formatted}
    </SyntaxHighlighter>
  );
};

export default HtmlSourceViewer;
