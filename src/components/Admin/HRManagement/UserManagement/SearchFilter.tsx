// components/UserManagement/SearchFilter.tsx
import { Search } from "lucide-react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const itemsPerPageOptions = [10, 20, 50, 100];

// ĐÃ ĐỒNG BỘ 100% VỚI ENUM CỦA BẠN
const sortOptions = [
  { label: "Tên: A → Z", value: "NAMEASC" },
  { label: "Tên: Z → A", value: "NAMEDESC" },
  { label: "Mới nhất", value: "DATEDESC" },
  { label: "Cũ nhất", value: "DATEASC" },
  { label: "ID tăng dần", value: "IDASC" },
  { label: "ID giảm dần", value: "IDDESC" },
];

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  sortBy,
  onSortChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-end">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm tên, email hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sắp xếp:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Items per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Hiển thị:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {itemsPerPageOptions.map((num) => (
            <option key={num} value={num}>
              {num} / trang
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}