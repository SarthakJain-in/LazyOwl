import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Undo,
  Redo,
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
        isActive
          ? 'bg-forge-accent text-white'
          : 'text-forge-textSecondary hover:bg-forge-surfaceHover hover:text-forge-textPrimary'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-forge-border bg-forge-bg rounded-t-xl">
      <div className="flex items-center gap-1 border-r border-forge-border pr-2 mr-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            disabled={!editor.can().chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter size={16} />
          </ToolbarButton>
          <div className="flex gap-1 items-center px-1">
            {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#e9d5ff'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                className={`w-4 h-4 rounded-full border transition-transform shadow-sm ${editor.isActive('highlight', { color }) ? 'border-gray-500 scale-125 ring-1 ring-gray-400' : 'border-gray-300 hover:scale-110'}`}
                style={{ backgroundColor: color }}
                title={`Highlight color`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-r border-forge-border pr-2 mr-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 border-r border-forge-border pr-2 mr-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = "Write your notes here..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          newGroupDelay: 100,
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[300px] p-4 text-forge-textPrimary',
        placeholder: placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Handle external content updates
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col flex-1 w-full border border-forge-border rounded-xl overflow-hidden bg-forge-bg shadow-sm focus-within:border-forge-accent transition-colors">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto bg-forge-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
