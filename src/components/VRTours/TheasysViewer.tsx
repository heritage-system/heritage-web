import { useEffect, useRef } from "react";

type Props = {
  embedId: string;
  height?: number;
  open: boolean;
};

const TheasysViewer: React.FC<Props> = ({ embedId, height = 450, open }) => {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!ref.current || loaded.current) return;

    const script = document.createElement("script");
    script.src = "https://static.theasys.io/embed.js";
    script.async = true;
    script.setAttribute("data-theasys", embedId);
    script.setAttribute("data-height", height.toString());

    ref.current.appendChild(script);
    loaded.current = true;
  }, [embedId, height]);

  return (
    <div
      ref={ref}
      style={{
        display: open ? "block" : "none",
        width: "70%",
        height,
      }}
      className="fixed inset-0 z-40 bg-black"
    />
  );
};


export default TheasysViewer;
