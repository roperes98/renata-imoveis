"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Undo,
  Redo
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

interface ContractToolbarProps {
  editor: Editor | null;
}

export function ContractToolbar({ editor }: ContractToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-transparent rounded-md p-1 flex items-center gap-1 mb-2 flex-wrap">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label="Toggle heading"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList", { class: "contract-clauses" })}
        onPressedChange={() => {
          if (editor.isActive("orderedList", { class: "contract-clauses" })) {
            // If already active as contract-clauses, toggle it off (back to paragraph or default list if we wanted, but standard behavior is toggle off)
            editor.chain().focus().toggleOrderedList().run();
          } else {
            // If not active, or active but different class, make it ordered list with this class
            // We use toggleOrderedList to ensure it wraps in a list, and then updateAttributes to set the class
            editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { class: "contract-clauses" }).run();
          }
        }}
        aria-label="Toggle Clauses"
        className="font-serif font-bold w-auto px-2"
      >
        CLÁUSULA
      </Toggle>

      <div className="flex-1" />

      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
