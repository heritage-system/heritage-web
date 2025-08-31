import React, { useState } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

const HeritageEditor = () => {
  const [jsonContent, setJsonContent] = useState<JSONContent | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Link,
      Placeholder.configure({
        placeholder: "Viết nội dung nghiên cứu di sản tại đây…",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose w-full min-h-[300px] p-4 bg-white text-black outline-none",
      },
    },
    content: "",
    onUpdate: ({ editor }) => setJsonContent(editor.getJSON()),
  });

  const save = () => {
    if (!editor) return;
    console.log("JSON:", editor.getJSON());
    console.log("HTML:", editor.getHTML());
    alert("Check console for saved JSON/HTML");
  };

  if (!editor) return null;

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-300" : ""}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-300" : ""}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-300" : ""}
        >
          Underline
        </button>
        <button
          onClick={() =>
            editor.chain().focus().setColor("#ff0000").run()
          }
        >
          Red
        </button>
        <button
          onClick={() =>
            editor.chain().focus().unsetColor().run()
          }
        >
          Clear Color
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""}
        >
          H2
        </button>
        <button
          onClick={() => {
            const url = prompt("Enter URL") || "";
            editor.chain().focus().toggleLink({ href: url }).run();
          }}
        >
          Link
        </button>
      </div>

      {/* Editor */}
      <div className="border p-2 mb-4 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>

      {/* Save */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={save}
      >
        Save
      </button>

      {/* Live JSON Preview */}
      <div className="mt-4 p-2 border bg-gray-50">
        <h2 className="text-lg font-bold">Live Preview JSON:</h2>
        <pre>{JSON.stringify(jsonContent, null, 2)}</pre>
      </div>
    </div>
  );
};

export default HeritageEditor;
