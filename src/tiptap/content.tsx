export interface TiptapContentProps {
  html: string;
  className?: string;
}

const TiptapContent = ({ html, className }: TiptapContentProps) => (
  <div
    className={className ? `tiptap ${className}` : "tiptap"}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

export default TiptapContent;
