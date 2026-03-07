import { Toolbar, ToolbarGroup, ToolbarSeparator } from '../components/tiptap-ui-primitive/toolbar'
import { Button } from '../components/tiptap-ui-primitive/button'
import { RiItalic, RiBold } from '@remixicon/react'
import { UndoRedoButton } from '../components/tiptap-ui/undo-redo-button'
import type { Editor } from '@tiptap/react'
import { ColorTextPopover } from '@/components/custom/color-text-popover'

export default function menubar({ editor }: { editor: Editor }) {
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
        <ColorTextPopover editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* <ToolbarGroup>
        <Button data-style="ghost" tooltip="Format" onClick={() => editor.chain().focus().toggleFormat('paragraph').run()}>Format</Button>
      </ToolbarGroup> */}

    </Toolbar>
  )
}