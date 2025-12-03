import { Sparkles, Filter } from "lucide-react";
import React from "react";

interface DiscoverySearchToggleProps {
  view: "filter" | "ai";
  onFilterChange: (mode: "filter" | "ai") => void;
}

const DiscoverySearchToggle: React.FC<DiscoverySearchToggleProps> = ({ view, onFilterChange }) => {
  // Khi nhấn nút, chuyển view sang cái còn lại
  const handleToggle = () => {
    onFilterChange(view === "filter" ? "ai" : "filter");
  };

  return (
    <div className="inline-flex items-center bg-white rounded-full shadow-lg border border-gray-200 pl-5"  style={{ height: "30px" }}>
       <span className=" text-sm font-medium text-gray-900">
        {view === "filter" ? "Nhận diện AI" : "Dùng bộ lọc"}
      </span>
      <button
        onClick={() => onFilterChange(view === "filter" ? "ai" : "filter")}
        className="ml-3 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-red-500 text-white hover:scale-105 transition-transform"
      >
        {view === "filter" ? <Sparkles className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
      </button>
      
    </div>
  );
};

export default DiscoverySearchToggle;
