import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { GripVertical } from 'lucide-react';
import { NodeSelection } from '@tiptap/pm/state';

interface DragHandleProps {
  editor: Editor | null;
}

export const DragHandle: React.FC<DragHandleProps> = ({ editor }) => {
  const [position, setPosition] = useState<{ top: number; left: number; height: number } | null>(null);
  const [currentNodePos, setCurrentNodePos] = useState<number | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Constants for positioning
  // Increased offset to 48 as requested to move handle further left
  const HANDLE_WIDTH = 24;
  const HANDLE_OFFSET_X = 110;
  const HANDLE_OFFSET_Y = 4; // Vertical adjustment

  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) return;

      const { clientX, clientY } = event;

      // Check if mouse is over the drag handle itself - if so, keep it visible
      if (dragHandleRef.current && dragHandleRef.current.contains(event.target as Node)) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        return;
      }

      // Get the position in the editor at the mouse coordinates
      let pos = editor.view.posAtCoords({ left: clientX, top: clientY });

      // If no pos found, check if we are in the "gutter" to the left of the editor
      if (!pos) {
        const editorRect = editor.view.dom.getBoundingClientRect();

        // Define gutter area:
        // Y must be within editor vertical bounds
        // X must be to the left of the editor content, but not too far (e.g. 150px)
        const isVerticallyInEditor = clientY >= editorRect.top && clientY <= editorRect.bottom;
        const isInLeftGutter = clientX < editorRect.left && clientX > (editorRect.left - 200);

        if (isVerticallyInEditor && isInLeftGutter) {
          // Try to find pos by projecting X into the editor
          // We use a point deeper inside the editor text area (e.g. +padding or even center)
          // ensuring we hit the text flow and not just the padding
          pos = editor.view.posAtCoords({
            left: editorRect.left + 100,
            top: clientY
          });
        }
      }

      if (!pos) {
        // If we still didn't find a pos, delay hiding to allow "jumping" gaps
        if (!hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setPosition(null);
            hideTimeoutRef.current = null;
          }, 300); // 300ms grace period
        }
        return;
      }

      // If we found a pos, clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      // Find the direct child or relevant block
      const $pos = editor.state.doc.resolve(pos.pos);

      // Search up for the best block to drag. 
      // If we are in a 'listItem' (clause), we want to drag that listItem, not just the p inside it.
      let targetDepth = 1;

      // We iterate from current depth up to 1.
      for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d);
        if (node.type.name === 'listItem') {
          targetDepth = d;
          break;
        }
        if (node.isBlock && d === 1) {
          targetDepth = d;
        }
      }

      const node = $pos.node(targetDepth);
      const nodePos = $pos.before(targetDepth);

      if (!node) {
        if (!hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setPosition(null);
            hideTimeoutRef.current = null;
          }, 300);
        }
        return;
      }

      const nodeDOM = editor.view.nodeDOM(nodePos) as HTMLElement;

      if (!nodeDOM || nodeDOM.nodeType !== 1) {
        return;
      }

      const rect = nodeDOM.getBoundingClientRect();

      let leftPos = rect.left;

      // Se for um item de lista, alinhar com o container pai (a lista) para evitar que a indentação desalinhe o handle
      // Isso corrige o problema com 'ul' padrão e mantém 'contract-clauses' alinhado corretamente
      if (node.type.name === 'listItem' && nodeDOM.parentElement) {
        leftPos = nodeDOM.parentElement.getBoundingClientRect().left;
      }

      setPosition({
        top: rect.top + HANDLE_OFFSET_Y,
        left: leftPos - HANDLE_OFFSET_X,
        height: rect.height
      });
      setCurrentNodePos(nodePos);
    };

    // Use window listener to catch moves outside the editor DOM (gutter)
    window.addEventListener('mousemove', handleMouseMove);

    const handleScroll = () => {
      if (!isDragging) {
        setPosition(null);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [editor, isDragging]);

  const handleDragStart = (e: React.DragEvent) => {
    if (!editor || currentNodePos === null) return;

    setIsDragging(true);

    // 1. Select the node in the editor
    const tr = editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, currentNodePos));
    editor.view.dispatch(tr);

    // 2. Set internal Tiptap/ProseMirror dragging state
    const slice = editor.state.selection.content();
    (editor.view as any).dragging = { slice, move: true };

    // 3. Set dataTransfer with invisible image
    // This prevents the browser from generating a default ghost image of the dragged element (the handle)
    // or the text, and prevents the scroll flash / shadow issues.
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '-10000px';
    div.style.opacity = '0';
    div.innerText = "";
    document.body.appendChild(div);

    e.dataTransfer.setDragImage(div, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', "block-move");

    // Remove the temp div immediately
    setTimeout(() => {
      if (document.body.contains(div)) {
        document.body.removeChild(div);
      }
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (editor) {
      (editor.view as any).dragging = null;
    }
    setPosition(null);
  };

  if (!position) return null;

  return (
    <div
      ref={dragHandleRef}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        cursor: 'grab',
        zIndex: 50,
        opacity: isDragging ? 0 : 1, // Hide handle while dragging
        transition: 'opacity 0.2s',
        display: 'flex',
        alignItems: 'flex-start', // Link to top
        marginTop: '-2px' // Adjustment to align with text baseline roughly
      }}
      className="drag-handle group"
    >
      <div className="p-1 rounded hover:bg-gray-200 text-gray-300 hover:text-gray-500 transition-colors">
        <GripVertical size={16} />
      </div>
    </div>
  );
};

export default DragHandle;

