// overlay trong 1 khối nội dung
import React from "react";
import Spinner from "./Spinner";

type SectionLoaderProps = {
  show: boolean;
  text?: string;
  minHeight?: number; // để tránh giật layout
};

const SectionLoader: React.FC<SectionLoaderProps> = ({ show, text, minHeight = 120 }) => {
  return (
    <div className="relative" style={{ minHeight }}>
      {show && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center bg-white/60">
          <div className="flex items-center gap-3">
            <Spinner size={26} />
            {text && <span className="text-sm text-gray-700">{text}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionLoader;
