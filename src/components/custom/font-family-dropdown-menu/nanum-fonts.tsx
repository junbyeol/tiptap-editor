export const NANUM_FONTS = [
  {
    label: "나눔고딕",
    family: "Nanum Gothic",
    href: "https://fonts.googleapis.com/css2?family=Nanum+Gothic&display=swap",
  },
  {
    label: "나눔명조",
    family: "Nanum Myeongjo",
    href: "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo&display=swap",
  },
  {
    label: "나눔바른고딕",
    family: "NanumBarunGothic",
    href: "https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-gothic.css",
  },
  {
    label: "나눔스퀘어",
    family: "NanumSquare",
    href: "https://hangeul.pstatic.net/hangeul_static/css/nanum-square.css",
  },
  {
    label: "나눔스퀘어 네오",
    family: "NanumSquareNeo",
    href: "https://hangeul.pstatic.net/hangeul_static/css/nanum-square-neo.css",
  },
  {
    label: "나눔손글씨 펜",
    family: "Nanum Pen Script",
    href: "https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap",
  },
] as const;

export type NanumFontEntry = (typeof NANUM_FONTS)[number];

export const NANUM_FONT_LINKS = NANUM_FONTS.map((f) => ({
  family: f.family,
  href: f.href,
}));

export function NanumFontStylesheets() {
  return NANUM_FONTS.map((font) => (
    <link key={font.family} rel="stylesheet" href={font.href} />
  ));
}
