// components/RichTextEditor.tsx
import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { makeImageHandler, thisCaptionHandler } from "../../utils/quillConfig";
import { collectImageUrlsFromDelta } from "../../utils/imageUtils";

interface RichTextEditorProps {
  initialDelta?: any;
  onChange?: (html: string, delta: any) => void;
  onTempImage?: (blobUrl: string, file: File, hash: string) => void;
  onImagesChanged?: (urls: Set<string>) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialDelta,
  onChange,
  onTempImage,
  onImagesChanged,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current || !toolbarRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      //placeholder: "Nhập nội dung bài viết…",
      modules: {
        toolbar: {
          container: toolbarRef.current,
          handlers: {
            image: makeImageHandler((blobUrl, file, hash) => {
              onTempImage?.(blobUrl, file, hash);
            }),
          },
        },
        imageResize: { modules: ["Resize", "DisplaySize"] },
        clipboard: { matchVisual: false },
      },
    });

    const captionBtn = toolbarRef.current.querySelector<HTMLButtonElement>(
      '[data-action="caption"]'
    );
    if (captionBtn) {
      captionBtn.onclick = () => thisCaptionHandler.call({ quill });
    }

    if (initialDelta) quill.setContents(initialDelta);

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      const delta = quill.getContents();
      onChange?.(html, delta);

      const urls = collectImageUrlsFromDelta(delta.ops);
      onImagesChanged?.(urls);
    });

    quillRef.current = quill;

    const qlContainer = containerRef.current.querySelector('.ql-container') as HTMLElement | null;
    const qlEditor = containerRef.current.querySelector('.ql-editor') as HTMLElement | null;
    if (qlContainer) {
      qlContainer.style.height = 'auto';
      qlContainer.style.overflow = 'visible';
    }
    if (qlEditor) {
      qlEditor.style.height = 'auto';
      qlEditor.style.maxHeight = 'unset';
      qlEditor.style.overflowY = 'visible';
    }
  }, [initialDelta, onChange, onTempImage, onImagesChanged]);

 const hasInitialized = useRef(false);

useEffect(() => {
  if (quillRef.current && initialDelta && !hasInitialized.current) {
    quillRef.current.setContents(initialDelta);
    hasInitialized.current = true; 
  }
}, [initialDelta]);

  return (
    <div ref={wrapperRef} className="relative h-[720px] rounded-md  flex flex-col overflow-hidden">
      <div
        ref={toolbarRef}
        className="sticky top-0 z-10 bg-white/90 backdrop-blur px-2 py-2 shadow-sm border-b flex flex-wrap items-center justify-center gap-2"
      >
        <div className="flex items-center gap-1 rounded-full border px-2 py-1 bg-white">
          <button className="ql-bold" title="Đậm" />
          <button className="ql-italic" title="Nghiêng" />
          <button className="ql-underline" title="Gạch dưới" />
          <button className="ql-strike" title="Gạch ngang" />
          <button className="ql-blockquote" title="Trích dẫn" />
        </div>

        <div className="flex items-center gap-1 rounded-full border px-2 py-1 bg-white">
          <select className="ql-header" title="Tiêu đề">
            <option value="false" />
            <option value="1" />
            <option value="2" />
            <option value="3" />
            <option value="4" />
            <option value="5" />
            <option value="6" />
          </select>
          <select className="ql-size" title="Kích thước" />
          <select className="ql-align" title="Căn lề" />
        </div>

        <div className="flex items-center gap-1 rounded-full border px-2 py-1 bg-white">
          <button className="ql-list" value="ordered" title="Danh sách số" />
          <button className="ql-list" value="bullet" title="Danh sách chấm" />
          {/* <button className="ql-list" value="check" title="Danh sách check" /> */}
        </div>

        <div className="flex items-center gap-1 rounded-full border px-2 py-1 bg-white">
          <select className="ql-color" title="Màu chữ" />
          <select className="ql-background" title="Màu nền" />
        </div>

        <div className="flex items-center gap-1 rounded-full border px-2 py-1 bg-white">
          <button className="ql-link" title="Chèn liên kết" />
          <button className="ql-image" title="Chèn ảnh" />
          {/* <button className="ql-video" title="Chèn video" /> */}
          {/* <button className="ql-clean" title="Xoá định dạng" /> */}
          <button type="button" data-action="caption" title="Chèn caption" className="flex items-center gap-1">
            <svg viewBox="0 0 18 18" className="w-4 h-4" fill="none">
              <line x1="3" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.5" />
              <rect x="3" y="4" width="12" height="7" stroke="currentColor" fill="none" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto p-3 min-h-[320px] scrollbar-hide" />
    </div>
  );
};

export default RichTextEditor;
