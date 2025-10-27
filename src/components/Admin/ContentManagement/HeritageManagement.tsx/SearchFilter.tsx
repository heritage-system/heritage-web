import React, { useState } from "react";
import { Search, Tag } from "lucide-react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters?: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
  }[];
  onFilterChange?: (filterKey: string, value: string) => void;
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
  tags: { label: string; value: string }[];
  sortBy?: string;
  onSortChange?: (value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  filters = [],
  onFilterChange,
  selectedTags,
  onTagChange,
  tags,
  sortBy,
  onSortChange,
}) => {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>(selectedTags);

  const handleTagToggle = (tagValue: string) => {
    setTempSelectedTags((prev) =>
      prev.includes(tagValue)
        ? prev.filter((t) => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const handleClearTags = () => {
    setTempSelectedTags([]);
  };

  const handleApplyTags = () => {
    onTagChange(tempSelectedTags);
    setIsTagModalOpen(false);
  };

  const handleCancelTags = () => {
    setTempSelectedTags(selectedTags);
    setIsTagModalOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filter */}
      {filters.map((filter) => (
        <select
          key={filter.value}
          onChange={(e) => onFilterChange?.(filter.value, e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {/* Tag Filter Button */}
      <button
        onClick={() => setIsTagModalOpen(true)}
        className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Tag size={16} />
        {selectedTags.length > 0
          ? `${selectedTags.length} Tag đã chọn`
          : "Lọc theo Tag"}
      </button>

      {/* Sort Dropdown */}
      {onSortChange && (
        <select
          value={sortBy || ""}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sắp xếp</option>
          <option value="NAMEASC">Tên A-Z</option>
          <option value="NAMEDESC">Tên Z-A</option>
          <option value="DATEASC">Ngày tạo (Cũ → Mới)</option>
          <option value="DATEDESC">Ngày tạo (Mới → Cũ)</option>
          <option value="IDASC">ID tăng dần</option>
          <option value="IDDESC">ID giảm dần</option>
        </select>
      )}

      {/* Tag Selection Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Chọn Tags</h3>
            <div className="max-h-64 overflow-y-auto mb-4">
              {tags.map((tag) => (
                <div
                  key={tag.value}
                  className="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded"
                >
                  {tag.value === "" ? (
                    <button
                      onClick={handleClearTags}
                      className="w-full text-left text-gray-600 font-medium"
                    >
                      {tag.label}
                    </button>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={tempSelectedTags.includes(tag.value)}
                        onChange={() => handleTagToggle(tag.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span>{tag.label}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelTags}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyTags}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;