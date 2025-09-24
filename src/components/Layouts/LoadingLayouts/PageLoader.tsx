// components/Feedback/PageLoader.tsx
import React from "react";
import Spinner from "./Spinner";

type PageLoaderProps = {
  show: boolean;
  text?: string;
  blur?: boolean;
};

const PageLoader: React.FC<PageLoaderProps> = ({ show, text = "Đang tải…", blur = true }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-[9998]">
      <div
        className={`absolute inset-0 ${
          blur ? "backdrop-blur-sm" : ""
        } bg-black/30`}
      />
      <div className="absolute inset-0 z-[9999] flex items-center justify-center">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white shadow-lg border border-white/40">
          <Spinner size={26} />
          <span className="text-sm font-medium text-gray-900">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
