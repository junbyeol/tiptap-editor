import { Extension } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";

import { Paragraph } from "./Paragraph";

import Bold from "@tiptap/extension-bold";
import Code from "@tiptap/extension-code";
import Highlight from "@tiptap/extension-highlight";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import Strike from "@tiptap/extension-strike";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";

import { BlockquoteKit } from "./BlockquoteKit";
import { ListKit } from "@tiptap/extension-list";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details";
import Heading from "@tiptap/extension-heading";
import { Hr } from "./HrKit";

import { ImageKit } from "./ImageKit";
import { FigureKit } from "./FigureKit";
import { FigcaptionKit } from "./FigcaptionKit";
import Youtube from "@tiptap/extension-youtube";

import { TextStyleKit } from "@tiptap/extension-text-style";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { Placeholder } from "@tiptap/extensions/placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TrailingNode } from "@tiptap/extensions/trailing-node";
import Typography from "@tiptap/extension-typography";
import { UndoRedo } from "@tiptap/extensions/undo-redo";

import FileHandler from "@tiptap/extension-file-handler";

const lowlight = createLowlight(all);

const RequiredNodes = [Document, Paragraph, Text];

const Nodes = [
  ...RequiredNodes,
  BlockquoteKit,
  CodeBlockLowlight.configure({
    lowlight,
  }),
  ...[Details, DetailsContent, DetailsSummary],
  Heading,
  Hr,
  FigureKit,
  FigcaptionKit,
  Youtube,
  ImageKit.configure({
    allowBase64: true,
    resize: {
      enabled: true,
      directions: ["top-left", "top-right", "bottom-left", "bottom-right"], // can be any direction or diagonal combination
      minWidth: 50,
      minHeight: 50,
      alwaysPreserveAspectRatio: true,
    },
  }),
];

const Marks = [
  Bold,
  Code,
  Highlight,
  Italic,
  Link,
  Strike,
  Subscript,
  Superscript,
  Underline,
];

const Functionalities = [
  ListKit,
  TextStyleKit,
  Gapcursor,
  Dropcursor,
  FileHandler,
  Placeholder,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TrailingNode.configure({
    node: "paragraph",
    notAfter: ["paragraph"],
  }),
  Typography,
  UndoRedo,
];

export const BasicKit = Extension.create({
  addExtensions() {
    return [...Nodes, ...Marks, ...Functionalities];
  },
});
