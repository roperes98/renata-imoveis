import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Editor, Range, Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  TextQuote,
  Minus,
  Image as ImageIcon
} from "lucide-react";

interface CommandItemProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface CommandProps {
  editor: Editor;
  range: Range;
}

export const Command = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: "Heading 1",
      description: "Big section heading.",
      icon: Heading1,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      icon: Heading2,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading.",
      icon: Heading3,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list.",
      icon: List,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      description: "Create a list with numbering.",
      icon: ListOrdered,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Quote",
      description: "Capture a quote.",
      icon: TextQuote,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Divider",
      description: "Visually separate sections.",
      icon: Minus,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ].filter((item) => {
    if (typeof query === "string" && query.length > 0) {
      return item.title.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });
};

export const CommandList = forwardRef(({
  items,
  command,
  editor,
  range,
}: {
  items: any[];
  command: any;
  editor: any;
  range: any;
}, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    },
    [command, items]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  const commandListContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = commandListContainer.current;

    const item = container?.children[selectedIndex] as HTMLElement;

    if (item && container) {
      const containerHeight = container.offsetHeight;
      const itemHeight = item ? item.offsetHeight : 0;

      const top = item.offsetTop;
      const bottom = top + itemHeight;

      if (top < container.scrollTop) {
        container.scrollTop -= container.scrollTop - top + 5;
      } else if (bottom > container.offsetHeight + container.scrollTop) {
        container.scrollTop += bottom - container.offsetHeight - container.scrollTop + 5;
      }
    }
  }, [selectedIndex]);

  return (
    <div
      id="slash-command"
      ref={commandListContainer}
      className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-white px-1 py-2 shadow-md transition-all"
    >
      {items.map((item: any, index: number) => {
        const Icon = item.icon;
        return (
          <button
            className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm text-gray-900 hover:bg-gray-100 ${index === selectedIndex ? "bg-gray-100 text-primary" : ""
              }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-white">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
});

CommandList.displayName = "CommandList";

export const renderItems = () => {
  let component: ReactRenderer | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      // @ts-ignore
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate: (props: any) => {
      component?.updateProps(props);

      popup &&
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
    },
    onKeyDown: (props: any) => {
      if (props.event.key === "Escape") {
        popup?.[0].hide();
        return true;
      }

      // @ts-ignore
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};

export const SlashCommand = Command.configure({
  suggestion: {
    items: getSuggestionItems,
    render: renderItems,
  },
});
