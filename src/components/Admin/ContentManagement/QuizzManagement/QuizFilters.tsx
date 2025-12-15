import React from "react";
import { Search } from "lucide-react";

interface QuizFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  itemsPerPage?: number;
  setItemsPerPage?: (value: number) => void; // Optional
  showItemsPerPage?: boolean; // Có muốn hiện phần "Hiển thị" không?
}

const QuizFilters: React.FC<QuizFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  itemsPerPage = 10,
  setItemsPerPage,
  showItemsPerPage = true,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-end">
      {/* === Tìm kiếm === */}
      <div className="relative flex-1 min-w-0">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Tìm kiếm tiêu đề, câu hỏi, mã quiz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
        />
      </div>

      {/* === Sắp xếp === */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Sắp xếp:
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white shadow-sm"
        >
          <option value="dateDesc">Mới nhất</option>
          <option value="dateAsc">Cũ nhất</option>
          <option value="nameAsc">Tên: A to Z</option>
          <option value="nameDesc">Tên: Z to A</option>
          <option value="questionsDesc">Số câu hỏi nhiều nhất</option>
          <option value="questionsAsc">Số câu hỏi ít nhất</option>
        </select>
      </div>

      {/* === Hiển thị số mục / trang - AN TOÀN 100% === */}
      {showItemsPerPage && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Hiển thị:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const value = Number(e.target.value);
              // Chỉ gọi nếu setItemsPerPage tồn tại
              if (setItemsPerPage) {
                setItemsPerPage(value);
              }
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white shadow-sm"
          >
            {[10, 20, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num} / trang
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default QuizFilters;