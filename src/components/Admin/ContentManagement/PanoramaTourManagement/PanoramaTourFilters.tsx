import React from "react";
import { Search } from "lucide-react";

interface PanoramaTourFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
}

const PanoramaTourFilters: React.FC<PanoramaTourFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  itemsPerPage,
  setItemsPerPage,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-end">
      {/* Tìm kiếm */}
      <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm tên tour, địa điểm, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 
                      transition-all shadow-sm text-base"
          />
        </div>

      {/* Sắp xếp */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Sắp xếp:
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     text-sm font-medium bg-white shadow-sm"
        >
          <option value="dateDesc">Mới nhất</option>
          <option value="dateAsc">Cũ nhất</option>
          <option value="nameAsc">Tên: A to Z</option>
          <option value="nameDesc">Tên: Z to A</option>
        </select>
      </div>

      {/* Hiển thị số mục / trang */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Hiển thị:
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     text-sm font-medium bg-white shadow-sm"
        >
          {[10, 20, 50, 100].map((num) => (
            <option key={num} value={num}>
              {num} / trang
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PanoramaTourFilters;