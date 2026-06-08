import type { FileAttachmentAttributes } from "./FileAttachment";

export const DefaultFileAttachmentComponent = ({
  name,
  url,
}: FileAttachmentAttributes) => (
  <a
    href={url}
    download={name}
    className="file-attachment"
    tabIndex={0}
    aria-label={`${name} 다운로드`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="file-attachment__icon"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
    <span className="file-attachment__name">{name}</span>
  </a>
);
