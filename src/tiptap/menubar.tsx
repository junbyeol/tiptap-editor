import { Toolbar, ToolbarGroup, ToolbarSeparator } from '../components/tiptap-ui-primitive/toolbar'
import { Button } from '../components/tiptap-ui-primitive/button'
import { RiItalic, RiBold } from '@remixicon/react'
import { Spacer } from '../components/tiptap-ui-primitive/spacer'
import { UndoRedoButton } from '../components/tiptap-ui/undo-redo-button'
import type { Editor } from '@tiptap/react'

export default function MyComponent({ editor }: { editor: Editor }) {
  return (
    <Toolbar>
      <ToolbarGroup>
        <UndoRedoButton editor={editor} action="undo" />
        <UndoRedoButton editor={editor} action="redo" />
        <Button data-style="ghost" tooltip="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
          <RiBold className="tiptap-button-icon" />
        </Button>
        <Button data-style="ghost" tooltip="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <RiItalic className="tiptap-button-icon" />
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* <ToolbarGroup>
        <Button data-style="ghost" tooltip="Format" onClick={() => editor.chain().focus().toggleFormat('paragraph').run()}>Format</Button>
      </ToolbarGroup> */}

      <Spacer />

      <ToolbarGroup>
        <Button data-style="primary">Save</Button>
      </ToolbarGroup>
    </Toolbar>
  )
}