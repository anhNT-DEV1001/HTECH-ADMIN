'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Undo, Redo } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  onReady?: () => void;
}

const TiptapEditor = ({ content, onChange, editable = true, onReady }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in Link to avoid duplicate with the standalone LinkExtension below
        link: false,
      }),
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
    onCreate: () => {
      onReady?.();
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
        <div className="flex flex-wrap items-center gap-1 border p-2 rounded-md bg-muted/30">
          <Button
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleBold().run()}
            type="button"
          >
            <Bold size={18} />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            type="button"
          >
            <Italic size={18} />
          </Button>
          <Button
            variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            type="button"
          >
            <List size={18} />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            type="button"
          >
            <ListOrdered size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={addImage}
            type="button"
          >
            <ImageIcon size={18} />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().undo().run()}
            type="button"
          >
            <Undo size={18}/>
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().redo().run()}
            type="button"
          >
            <Redo size={18}/>
          </Button>
        </div>
      )}
      
      {/* Editor Content Area */}
      <EditorContent editor={editor} className="border rounded-md" />
    </div>
  );
};

export default TiptapEditor;