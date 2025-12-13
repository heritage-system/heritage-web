import { useEffect, useRef } from "react";

type Props = {
  embedId: string;
  height?: number;
};

const TheasysEmbed: React.FC<Props> = ({ embedId, height = 750 }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <head>
          <style>
            html, body { margin:0; padding:0; overflow:hidden; height:100%; }
          </style>
        </head>
        <body>
          <div id="theasys-container"></div>
          <script src="https://static.theasys.io/embed.js" async
            data-theasys="${embedId}"
            data-height="${height}">
          </script>
        </body>
      </html>
    `);
    doc.close();
  }, [embedId, height]);

  return (
    <iframe
      ref={iframeRef}
      style={{ width: "100%", height: `${height}px`, border: "none" }}
      title="Theasys Viewer"
    />
  );
};

export default TheasysEmbed;
