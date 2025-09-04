
// QuillHtmlPreview.tsx
import React, { useEffect, useRef } from "react";

export default function QuillHtmlPreview({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const doc = ref.current.contentDocument!;
    // CSS tối thiểu cho nội dung bên trong iframe
    const css = `
      html,body{margin:0;padding:0;font:16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;}
      img{max-width:100%;height:auto;display:inline;}
      /* Chỉ center ảnh khi Quill set text-align:center */
      p[style*="text-align:center"] img{display:block;margin-left:auto;margin-right:auto;}
      .ql-align-center{text-align:center;}
      .ql-align-right{text-align:right;}
      .ql-align-justify{text-align:justify;}
    `;
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
    doc.close();

    // auto-height iframe
    const resize = () => {
      if (ref.current) {
        ref.current.style.height = doc.body.scrollHeight + "px";
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(doc.body);
    return () => ro.disconnect();
  }, [html]);

  return <iframe ref={ref} className="w-full border rounded-xl" />;
}
