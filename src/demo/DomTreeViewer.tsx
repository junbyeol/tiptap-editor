import "./DomTreeViewer.css";

export interface DomTreeViewerProps {
  html: string;
}

const NODEVIEW_WRAPPER_CLASSES = ["tableWrapper"];
const NODEVIEW_WRAPPER_ATTRS = [
  "data-resize-container",
  "data-resize-wrapper",
  "data-resize-state",
];

function isNodeViewWrapper(el: Element): boolean {
  if (NODEVIEW_WRAPPER_CLASSES.some((cls) => el.classList.contains(cls))) {
    return true;
  }
  return NODEVIEW_WRAPPER_ATTRS.some((attr) => el.hasAttribute(attr));
}

const DomNode = ({ node }: { node: ChildNode }) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return null;
    return <div className="dom-tree-text">"{text}"</div>;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as Element;
  const children = Array.from(el.childNodes).filter(
    (child) =>
      child.nodeType === Node.ELEMENT_NODE ||
      (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()),
  );
  const attrs = Array.from(el.attributes);
  const isWrapper = isNodeViewWrapper(el);

  return (
    <details
      className={
        isWrapper ? "dom-tree-node dom-tree-node--nodeview" : "dom-tree-node"
      }
      open
    >
      <summary>
        <span className="dom-tree-tag">&lt;{el.tagName.toLowerCase()}</span>
        {attrs.map((attr) => (
          <span key={attr.name} className="dom-tree-attr">
            {attr.name}=<span className="dom-tree-value">"{attr.value}"</span>
          </span>
        ))}
        <span className="dom-tree-tag">&gt;</span>
        {isWrapper && (
          <span className="dom-tree-badge">NodeView 전용 wrapper</span>
        )}
      </summary>
      {children.length > 0 && (
        <div className="dom-tree-children">
          {children.map((child, index) => (
            <DomNode key={index} node={child as ChildNode} />
          ))}
        </div>
      )}
    </details>
  );
};

const DomTreeViewer = ({ html }: DomTreeViewerProps) => {
  if (!html.trim()) {
    return <p className="dom-tree-empty">데이터 없음</p>;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.body.childNodes);

  return (
    <div className="dom-tree">
      {nodes.map((node, index) => (
        <DomNode key={index} node={node} />
      ))}
    </div>
  );
};

export default DomTreeViewer;
