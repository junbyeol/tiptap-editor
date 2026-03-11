import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./menubar";
import { useMemo } from "react";
import {
  TextStyle,
  Color,
  BackgroundColor,
} from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit, TableCell } from "@tiptap/extension-table";
import { Gapcursor } from "@tiptap/extensions";

const extensions = [
  StarterKit,
  TextStyle,
  Color,
  BackgroundColor,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Gapcursor,
  TableKit.configure({
    table: { resizable: true },
  }),
  // TableCell extension을 별도로 extend 해 준 이유
  // https://github.com/ueberdosis/tiptap/issues/862
  TableCell.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        backgroundColor: {
          default: null,
          renderHTML: (attributes) => {
            if (!attributes.backgroundColor) {
              return {};
            }

            return {
              style: `background-color: ${attributes.backgroundColor}`,
            };
          },
          parseHTML: (element) => {
            return element.style.backgroundColor.replace(/['"]+/g, "");
          },
        },
      };
    },
  }),
];

export default () => {
  const editor = useEditor({
    extensions,
    content: `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That's a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.
</p>
<blockquote>
  Wow, that's amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`,
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <TiptapWrapper>
      <EditorContext.Provider value={providerValue}>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </EditorContext.Provider>
    </TiptapWrapper>
  );
};

const TiptapWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="tiptap-wrapper">{children}</div>
);
