import { Map } from "lucide-react";
import React from "react";

interface DiscoveryViewToggleProps {
  view: "grid" | "map";
  onViewChange: (view: "grid" | "map") => void;
}

const DiscoveryViewToggle: React.FC<DiscoveryViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange("grid")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          view === "grid"
            ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white shadow-sm"
            : "text-gray-600 hover:text-yellow-700"
        }`}
      >
        Lưới
      </button>
      <button
        onClick={() => onViewChange("map")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          view === "map"
            ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white shadow-sm"
            : "text-gray-600 hover:text-yellow-700"
        }`}
      >
        <Map className="w-4 h-4 inline mr-1" />
        Bản đồ
      </button>
    </div>
  );
};

export default DiscoveryViewToggle;
