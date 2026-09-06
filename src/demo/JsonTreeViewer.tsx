import type { JSONContent } from "@tiptap/core";
import "./JsonTreeViewer.css";

export interface JsonTreeViewerProps {
  json: JSONContent | null;
}

const JsonNode = ({ node }: { node: JSONContent }) => {
  if (node.type === "text") {
    return (
      <div className="json-tree-text">
        <span className="json-tree-text-quote">"{node.text}"</span>
        {node.marks && node.marks.length > 0 && (
          <span className="json-tree-marks">
            [{node.marks.map((mark) => mark.type).join(", ")}]
          </span>
        )}
      </div>
    );
  }

  const attrEntries = node.attrs ? Object.entries(node.attrs) : [];
  const children = node.content ?? [];

  return (
    <details className="json-tree-node" open>
      <summary>
        <span className="json-tree-type">{node.type}</span>
        {attrEntries.map(([key, value]) => (
          <span key={key} className="json-tree-attr">
            {key}=
            <span className="json-tree-value">{JSON.stringify(value)}</span>
          </span>
        ))}
      </summary>
      {children.length > 0 && (
        <div className="json-tree-children">
          {children.map((child, index) => (
            <JsonNode key={index} node={child} />
          ))}
        </div>
      )}
    </details>
  );
};

const JsonTreeViewer = ({ json }: JsonTreeViewerProps) => {
  if (!json) {
    return <p className="json-tree-empty">데이터 없음</p>;
  }

  return (
    <div className="json-tree">
      <JsonNode node={json} />
    </div>
  );
};

export default JsonTreeViewer;
