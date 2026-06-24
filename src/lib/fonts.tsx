import {
  NANUM_FONTS,
  NANUM_FONT_LINKS,
} from "@/components/custom/font-family-dropdown-menu/nanum-fonts";

export type FontEntry = {
  label: string;
  family: string;
  href: string;
};

export type FontLinkEntry = {
  family: string;
  href: string;
};

export const EDITOR_FONTS: FontEntry[] = [...NANUM_FONTS];

export const EDITOR_FONT_LINKS: FontLinkEntry[] = [...NANUM_FONT_LINKS];

export function EditorFontStylesheets() {
  return EDITOR_FONT_LINKS.map((font) => (
    <link key={font.family} rel="stylesheet" href={font.href} />
  ));
}
