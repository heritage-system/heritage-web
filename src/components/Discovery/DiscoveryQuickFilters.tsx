import React, { useState } from "react";
import { HeritageSearchRequest } from "../../types/heritage";
import { CalendarType, SortBy } from "../../types/enum";
import { 
  Search

} from "lucide-react";

interface DiscoveryQuickFiltersProps {
  filters: HeritageSearchRequest;
  onFiltersChange: (filters: Partial<HeritageSearchRequest>) => void;
}

const CATEGORIES = [
  { id: 1, name: "Lễ hội", icon: "🎉" },
  { id: 2, name: "Biểu diễn", icon: "🎪" },
  { id: 3, name: "Âm nhạc", icon: "🎵" },
  { id: 4, name: "Thủ công", icon: "🏺" },
  { id: 5, name: "Ẩm thực", icon: "🍲" },
];

const TAGS = [
  { id: 1, name: "Lễ hội mùa xuân" },
  { id: 2, name: "Văn hóa dân gian" },
  { id: 3, name: "Nghệ thuật truyền thống" },
  { id: 4, name: "Lễ hội tôn giáo" },
  { id: 5, name: "Trang phục truyền thống" },
];

const DiscoveryQuickFilters: React.FC<DiscoveryQuickFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [showTagsPopup, setShowTagsPopup] = useState(false);
  const [showCategoriesPopup, setShowCategoriesPopup] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleArrayValue = (key: "categoryIds" | "tagIds", value: number) => {
    const current = filters[key] || [];
    const exists = current.includes(value);
    const updated = exists ? current.filter((v) => v !== value) : [...current, value];
    onFiltersChange({ [key]: updated });
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-4">
      {/* Search + Sort */}
     
      <div className="flex gap-2">
       {/* Search Bar (Filters) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm di sản..."
            value={filters.keyword || ""}
            onChange={(e) => onFiltersChange({ keyword: e.target.value })}
            className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-2xl 
                      focus:ring-4 focus:ring-yellow-600/20 focus:border-yellow-600 outline-none 
                      transition-all duration-300 bg-gray-50 hover:bg-white font-medium"
          />
        </div>

        <select
          value={filters.sortBy || SortBy.NameAsc}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value as SortBy })}
          className="p-3 border border-gray-200 rounded-2xl w-40"
        >
          <option value={SortBy.NameAsc}>Tên A-Z</option>
          <option value={SortBy.NameDesc}>Tên Z-A</option>
          <option value={SortBy.DateAsc}>Ngày ↑</option>
          <option value={SortBy.DateDesc}>Ngày ↓</option>
        </select>
      </div>

      {/* Expanded Filters */}
      {expanded && (
        <>
          {/* Categories */}
          <div>
            <h4 className="font-medium mb-2">Danh mục</h4>
            <div className="flex flex-wrap gap-2">
              {(filters.categoryIds?.length ? 
                CATEGORIES.filter(c => filters.categoryIds?.includes(c.id)) 
                : CATEGORIES.slice(0,3)
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleArrayValue("categoryIds", cat.id)}
                  className={`px-3 py-1 rounded-2xl text-sm border transition ${
                    filters.categoryIds?.includes(cat.id)
                      ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                      : "bg-white text-gray-700 border-yellow-300 hover:bg-yellow-50"
                  }`}
                >
                  {cat.icon} {cat.name}
                  {filters.categoryIds?.includes(cat.id) && <span className="ml-1">✕</span>}
                </button>
              ))}
              <button
                onClick={() => setShowCategoriesPopup(true)}
                className="px-3 py-1 rounded-2xl border text-sm bg-white hover:bg-yellow-50"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {(filters.tagIds?.length ? 
                TAGS.filter(t => filters.tagIds?.includes(t.id)) 
                : TAGS.slice(0,3)
              ).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleArrayValue("tagIds", tag.id)}
                  className={`px-3 py-1 rounded-2xl text-sm border transition ${
                    filters.tagIds?.includes(tag.id)
                      ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                      : "bg-white text-gray-700 border-yellow-300 hover:bg-yellow-50"
                  }`}
                >
                  {tag.name}
                  {filters.tagIds?.includes(tag.id) && <span className="ml-1">✕</span>}
                </button>
              ))}
              <button
                onClick={() => setShowTagsPopup(true)}
                className="px-3 py-1 rounded-2xl border text-sm bg-white hover:bg-yellow-50"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Date range + Calendar type */}
          <div>
            <h4 className="font-medium mb-2">Thời gian</h4>
            <div className="flex gap-2">
              {/* Date fields chiếm 2/3 */}
              <div className="flex gap-2 w-2/3">
                <input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ngày bắt đầu"
                  value={filters.startDay || ""}
                  onChange={(e) => onFiltersChange({ startDay: +e.target.value })}
                  className="w-1/2 p-2 border rounded-2xl"
                />
                <input
                  type="number"
                  min={1}
                  max={12}
                  placeholder="Tháng bắt đầu"
                  value={filters.startMonth || ""}
                  onChange={(e) => onFiltersChange({ startMonth: +e.target.value })}
                  className="w-1/2 p-2 border rounded-2xl"
                />
                <input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ngày kết thúc"
                  value={filters.endDay || ""}
                  onChange={(e) => onFiltersChange({ endDay: +e.target.value })}
                  className="w-1/2 p-2 border rounded-2xl"
                />
                <input
                  type="number"
                  min={1}
                  max={12}
                  placeholder="Tháng kết thúc"
                  value={filters.endMonth || ""}
                  onChange={(e) => onFiltersChange({ endMonth: +e.target.value })}
                  className="w-1/2 p-2 border rounded-2xl"
                />
              </div>

              {/* Calendar chiếm 1/3 */}
            <div className="flex w-1/3 bg-gray-100 rounded-lg p-1">
  {[
    { value: CalendarType.SOLAR, label: "Dương" },
    { value: CalendarType.LUNAR, label: "Âm" },
    { value: CalendarType.BOTH, label: "Cả hai" },
  ].map((opt) => (
    <button
      key={opt.value}
      onClick={() => onFiltersChange({ calendarType: opt.value })}
      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        (filters.calendarType || CalendarType.BOTH) === opt.value
          ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white shadow-sm"
          : "text-gray-600 hover:text-yellow-700"
      }`}
    >
      {opt.label}
    </button>
  ))}
</div>


            </div>
          </div>
        </>
      )}

      {/* Toggle expand */}
      <div className="text-right">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm text-yellow-700 hover:underline"
        >
          {expanded ? "Ẩn bớt bộ lọc ↑" : "Hiện thêm bộ lọc ↓"}
        </button>
      </div>

      {/* Popup chọn nhiều Category */}
      {showCategoriesPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white shadow-lg p-4 rounded-xl w-80">
            <h5 className="font-medium mb-2">Chọn nhiều danh mục</h5>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleArrayValue("categoryIds", cat.id)}
                  className={`px-3 py-1 rounded-2xl text-sm border ${
                    filters.categoryIds?.includes(cat.id)
                      ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                      : "bg-white text-gray-700 border-yellow-300"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
            <div className="mt-3 text-right">
              <button
                onClick={() => setShowCategoriesPopup(false)}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup chọn nhiều Tag */}
      {showTagsPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white shadow-lg p-4 rounded-xl w-80">
            <h5 className="font-medium mb-2">Chọn nhiều Tag</h5>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleArrayValue("tagIds", tag.id)}
                  className={`px-3 py-1 rounded-2xl text-sm border ${
                    filters.tagIds?.includes(tag.id)
                      ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                      : "bg-white text-gray-700 border-yellow-300"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="mt-3 text-right">
              <button
                onClick={() => setShowTagsPopup(false)}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryQuickFilters;
