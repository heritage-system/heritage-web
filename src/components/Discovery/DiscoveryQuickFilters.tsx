import React, { useState } from "react";
import { HeritageSearchRequest } from "../../types/heritage";
import { CalendarType, SortBy } from "../../types/enum";
import { Search } from "lucide-react";

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

const LOCATIONS = [
  { id: 1, name: "Hà Nội" },
  { id: 2, name: "Huế" },
  { id: 3, name: "Đà Nẵng" },
  { id: 4, name: "TP. Hồ Chí Minh" },
  { id: 5, name: "Quảng Ninh" },
];

const DiscoveryQuickFilters: React.FC<DiscoveryQuickFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [showTagsPopup, setShowTagsPopup] = useState(false);
  const [showCategoriesPopup, setShowCategoriesPopup] = useState(false);
  const [showLocationsPopup, setShowLocationsPopup] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const currentCalendar = filters.calendarType ?? CalendarType.SOLAR;

  const toggleArrayValue = (
    key: "categoryIds" | "tagIds" | "locationIds",
    value: number
  ) => {
    const current = filters[key] || [];
    const exists = current.includes(value);
    const updated = exists ? current.filter((v) => v !== value) : [...current, value];
    onFiltersChange({ [key]: updated });
  };

  const clearDateFilters = () => {
    onFiltersChange({
      startDay: undefined,
      startMonth: undefined,
      endDay: undefined,
      endMonth: undefined,
      calendarType: CalendarType.SOLAR, 
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      keyword: undefined,
      categoryIds: [],
      tagIds: [],
      locationIds: [],
      startDay: undefined,
      startMonth: undefined,
      endDay: undefined,
      endMonth: undefined,
      calendarType: CalendarType.SOLAR,
      sortBy: SortBy.NameAsc,
    });
  };

  const handleDateChange = (field: keyof typeof filters, value?: number) => {
    const newFilters = { ...filters, [field]: value };


    const allEmpty =
      !newFilters.startDay &&
      !newFilters.startMonth &&
      !newFilters.endDay &&
      !newFilters.endMonth;

    onFiltersChange({
      ...newFilters,
      calendarType: allEmpty
        ? undefined
        : (value !== undefined && !filters.calendarType
            ? CalendarType.SOLAR
            : filters.calendarType),
    });
  };


  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-4">
      {/* Search + Sort */}
      <div className="flex gap-2">
        {/* Search Bar */}
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
        </select>
      </div>

      {/* Expanded Filters */}
      {expanded && (
        <>
          {/* Categories */}
          <div>
            <h4 className="font-medium mb-2">Danh mục</h4>
            <div className="flex flex-wrap gap-2">
              {(filters.categoryIds?.length
                ? CATEGORIES.filter((c) => filters.categoryIds?.includes(c.id))
                : CATEGORIES.slice(0, 3)
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
              {(filters.tagIds?.length
                ? TAGS.filter((t) => filters.tagIds?.includes(t.id))
                : TAGS.slice(0, 3)
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

          {/* Locations */}
          <div>
            <h4 className="font-medium mb-2">Địa phương</h4>
            <div className="flex flex-wrap gap-2">
              {(filters.locationIds?.length
                ? LOCATIONS.filter((l) => filters.locationIds?.includes(l.id))
                : LOCATIONS.slice(0, 3)
              ).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => toggleArrayValue("locationIds", loc.id)}
                  className={`px-3 py-1 rounded-2xl text-sm border transition ${
                    filters.locationIds?.includes(loc.id)
                      ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                      : "bg-white text-gray-700 border-yellow-300 hover:bg-yellow-50"
                  }`}
                >
                  {loc.name}
                  {filters.locationIds?.includes(loc.id) && <span className="ml-1">✕</span>}
                </button>
              ))}
              <button
                onClick={() => setShowLocationsPopup(true)}
                className="px-3 py-1 rounded-2xl border text-sm bg-white hover:bg-yellow-50"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Date range + Calendar type */}
          <div>
            <h4 className="font-medium mb-2 flex justify-between items-center">
              Thời gian
              <button
                onClick={clearDateFilters}
                className="text-xs text-red-600 hover:underline"
              >
                Dọn sạch
              </button>
            </h4>
            <div className="flex gap-2">
              {/* Date fields */}
              <div className="flex gap-2 w-2/3">
                <input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ngày bắt đầu"
                  value={filters.startDay || ""}
                  onChange={(e) =>
                    handleDateChange("startDay", e.target.value ? +e.target.value : undefined)
                  }
                  onBlur={() => {
                    if (filters.startDay) {
                      handleDateChange(
                        "startDay",
                        Math.min(Math.max(1, filters.startDay), 30)
                      );
                    }
                  }}
                  className="w-1/2 p-2 border rounded-2xl"
                />

                <input
                  type="number"
                  min={1}
                  max={12}
                  placeholder="Tháng bắt đầu"
                  value={filters.startMonth || ""}
                  onChange={(e) =>
                    handleDateChange("startMonth", e.target.value ? +e.target.value : undefined)
                  }
                  onBlur={() => {
                    if (filters.startMonth) {
                      handleDateChange(
                        "startMonth",
                        Math.min(Math.max(1, filters.startMonth), 12)
                      );
                    }
                  }}
                  className="w-1/2 p-2 border rounded-2xl"
                />
              <input
                type="number"
                min={1}
                max={31}
                placeholder="Ngày kết thúc"
                value={filters.endDay || ""}
                onChange={(e) =>
                  handleDateChange("endDay", e.target.value ? +e.target.value : undefined)
                }
                onBlur={() => {
                    if (filters.endDay) {
                      handleDateChange(
                        "endDay",
                        Math.min(Math.max(1, filters.endDay), 30)
                      );
                    }
                  }}
                className="w-1/2 p-2 border rounded-2xl"
              />

              <input
                type="number"
                min={1}
                max={12}
                placeholder="Tháng kết thúc"
                value={filters.endMonth || ""}
                onChange={(e) =>
                  handleDateChange("endMonth", e.target.value ? +e.target.value : undefined)
                }
                onBlur={() => {
                    if (filters.endMonth) {
                      handleDateChange(
                        "endMonth",
                        Math.min(Math.max(1, filters.endMonth), 12)
                      );
                    }
                  }}
                className="w-1/2 p-2 border rounded-2xl"
              />


              </div>

              {/* Calendar type */}
              <div className="flex w-1/3 bg-gray-100 rounded-lg p-1">
                {[ 
                  { value: CalendarType.SOLAR, label: "Dương" },
                  { value: CalendarType.LUNAR, label: "Âm" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onFiltersChange({
                        calendarType:
                          currentCalendar === opt.value ? undefined : opt.value,
                      })
                    }
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentCalendar  === opt.value
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

      {/* Toggle expand + Clear All */}
      <div className="flex justify-between items-center">
      
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:underline"
          >
            Dọn sạch tất cả
          </button>
       
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

      {/* Popup chọn nhiều Location */}
      {showLocationsPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white shadow-lg p-4 rounded-xl w-80">
            <h5 className="font-medium mb-2">Chọn nhiều địa phương</h5>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => toggleArrayValue("locationIds", loc.id)}
                  className={`px-3 py-1 rounded-2xl text-sm border ${
                    filters.locationIds?.includes(loc.id)
                      ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                      : "bg-white text-gray-700 border-yellow-300"
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
            <div className="mt-3 text-right">
              <button
                onClick={() => setShowLocationsPopup(false)}
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
