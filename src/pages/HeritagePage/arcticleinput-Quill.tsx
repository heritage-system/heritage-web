import React, { useRef, useState, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface HeritageEditorProps {
  initialDelta?: any; // Delta JSON đã lưu trước đó
  onSave?: (html: string, delta: any) => void;
}

const HeritageEditor: React.FC<HeritageEditorProps> = ({ initialDelta, onSave }) => {
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [deltaContent, setDeltaContent] = useState<any>(null);

  useEffect(() => {
    if (quillRef.current && !quillInstanceRef.current) {
      const quill = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: "Nhập mô tả di sản...",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
            ["link", "image", "video"],
            ["blockquote", "code-block"],
            ["clean"],
          ],
          clipboard: {
            matchVisual: false,
          },
        },
      });

      quillInstanceRef.current = quill;

      // Load nội dung cũ nếu có
      if (initialDelta) {
        quill.setContents(initialDelta);
      }

      quill.on("text-change", () => {
        setHtmlContent(quill.root.innerHTML);
        setDeltaContent(quill.getContents());
      });
    }
  }, [initialDelta]);

  // Hàm load lại Delta JSON vào editor
  const loadFromJSON = (delta: any) => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.setContents(delta);
    }
  };

  const handleSave = () => {
    if (onSave) onSave(htmlContent, deltaContent);
    alert("Đã lưu! Check console để xem JSON/HTML");
    console.log("HTML:", htmlContent);
    console.log("Delta:", deltaContent);
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div ref={quillRef} style={{ height: "300px" }} />
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Lưu Heritage Description
      </button>

      <button
        onClick={() => loadFromJSON(deltaContent)}
        className="mt-4 ml-2 bg-green-500 text-white px-4 py-2 rounded"
      >
        Load lại từ JSON
      </button>

      <div className="mt-4">
        <h2 className="font-bold">Render HTML Preview</h2>
        <div
          className="p-2 border bg-gray-50"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      <div className="mt-4">
  <h2 className="font-bold">Live Preview from Delta</h2>
  <div
    ref={(el) => {
      if (el && deltaContent) {
        // Tạo một instance tạm thời của Quill read-only để render Delta
        const preview = new Quill(el, {
          readOnly: true,
          theme: "bubble", // bubble theme cho clean
          modules: { toolbar: false },
        });
        preview.setContents(deltaContent);
      }
    }}
    className="p-2 border bg-gray-50 min-h-[150px]"
  />
</div>

    </div>
  );
};

export default HeritageEditor;
