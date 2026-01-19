"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { SlashCommand } from './editor-command';
import {
  Heading1,
  Heading2,
  Heading3,
  Quote as QuoteIcon
} from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder = "Comece a escrever..." }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BubbleMenuExtension,
      SlashCommand,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:absolute before:top-2 before:left-3 before:pointer-events-none before:h-0',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[150px] max-w-none px-3 py-2 text-gray-900',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // or getText() if we only want plain text, but Notion-style usually implies rich text.
      // However, check if DB supports rich text (HTML). Description is `text` type usually. 
      // If it's just `text` in Postgres, HTML string is fine.
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md border-gray-300 bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden">

      {/* Bubble Menu for selecting text */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center space-x-1 p-1 bg-white rounded shadow-lg border border-gray-200">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Separator orientation="vertical" className="h-6" />
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Separator orientation="vertical" className="h-6" />
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
          <Separator orientation="vertical" className="h-6" />
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <QuoteIcon className="h-4 w-4" />
          </Toggle>
        </BubbleMenu>
      )}

      {/* Static Toolbar (Optional, Notion usually hides it, but useful for basic discovery) - Maybe user wants CLEAN Notion style. 
          I will skip static toolbar for true "Notion style" and rely on BubbleMenu + Markdown shortcuts.
      */}

      <EditorContent editor={editor} />
    </div>
  );
}
