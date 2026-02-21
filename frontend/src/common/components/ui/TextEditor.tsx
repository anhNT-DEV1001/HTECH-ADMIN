'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Undo, Redo } from 'lucide-react';
import { useCallback } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

const TiptapEditor = ({ content, onChange, editable = true }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: true, allowBase64: true }),
    ],
    content: content,
    editable: editable,
    immediatelyRender:false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border rounded-md',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Hàm xử lý upload ảnh chèn vào bài viết
  const addImage = useCallback(() => {
    // Logic upload file từ máy với preview base64
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result as string;
          editor?.chain().focus().setImage({ src: imageUrl }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap gap-2 border p-2 rounded-md bg-gray-50">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
            type="button" // Quan trọng để không submit form
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            <ListOrdered size={18} />
          </button>
          <button onClick={addImage} className="p-1 hover:bg-gray-200 rounded" type="button">
            <ImageIcon size={18} />
          </button>
          <div className="border-l mx-2"></div>
          <button onClick={() => editor.chain().focus().undo().run()} className="p-1 hover:bg-gray-200 rounded" type="button">
             <Undo size={18}/>
          </button>
          <button onClick={() => editor.chain().focus().redo().run()} className="p-1 hover:bg-gray-200 rounded" type="button">
             <Redo size={18}/>
          </button>
        </div>
      )}
      
      {/* Editor Content Area */}
      <EditorContent editor={editor} className="border rounded-md" />
    </div>
  );
};

export default TiptapEditor;