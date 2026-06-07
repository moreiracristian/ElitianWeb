'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading2, Heading3,
  List, ListOrdered,
  Quote, Minus,
  Link2, Link2Off,
  Undo2, Redo2,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-green-100 text-green-700'
          : 'text-stone-500 hover:bg-stone-200 hover:text-stone-800'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-stone-200 mx-0.5 self-center" />
}

export default function TiptapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Escribí el contenido del artículo aquí...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'p-4 focus:outline-none',
      },
    },
  })

  // Sincronizar cuando se carga un post existente en el drawer
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  function handleSetLink() {
    const prev = editor?.getAttributes('link').href ?? ''
    const url = window.prompt('URL del enlace', prev)
    if (url === null) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  if (!editor) return null

  return (
    <div className="tiptap-editor border border-stone-200 rounded-xl overflow-hidden">

      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-stone-50 border-b border-stone-200">

        {/* Historia */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Deshacer (Ctrl+Z)">
          <Undo2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Rehacer (Ctrl+Y)">
          <Redo2 className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Formato de texto */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrita (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Subrayado (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Encabezados */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Título 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Listas */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista con viñetas"
        >
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Bloques */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Cita"
        >
          <Quote className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Línea divisoria"
        >
          <Minus className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn
          onClick={handleSetLink}
          active={editor.isActive('link')}
          title="Insertar enlace"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarBtn>
        {editor.isActive('link') && (
          <ToolbarBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Quitar enlace"
          >
            <Link2Off className="w-4 h-4" />
          </ToolbarBtn>
        )}
      </div>

      {/* Área de edición */}
      <EditorContent editor={editor} />
    </div>
  )
}
