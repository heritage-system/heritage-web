import React, { useState } from "react";
import { HeritageSearchRequest } from "../../types/heritage";
import { CalendarType, SortBy } from "../../types/enum";
import { Province } from "../../types/location";
import { Category } from "../../types/category";
import { Tag } from "../../types/tag";
import { Search } from "lucide-react";
import PortalModal from "../Layouts/ModalLayouts/PortalModal"
interface DiscoveryQuickFiltersProps {
  filters: HeritageSearchRequest;
  onFiltersChange: (filters: Partial<HeritageSearchRequest>) => void;
  view: "grid" | "map"; 
  locations?: Province[];
  categories?: Category[];
  tags: Tag[];
}

const MultiSelectModal: React.FC<{
  open: boolean;
  title: string;
  items: { key: string | number; label: string; selected: boolean }[];
  onToggle: (key: string | number) => void;
  onClose: () => void;
}> = ({ open, title, items, onToggle, onClose }) => (
  <PortalModal
  open={open}
  onClose={onClose}
  size="sm"
  contentClassName="bg-white rounded-2xl p-4 shadow-xl"
>
    <div className="bg-white shadow-lg p-4 rounded-xl w-80">
      <h5 className="font-medium mb-2">{title}</h5>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onToggle(it.key)}
            className={`px-3 py-1 rounded-2xl text-sm border ${
              it.selected
                ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                : "bg-white text-gray-700 border-yellow-300"
            }`}
          >
            {it.label}
            {it.selected && <span className="ml-1">✕</span>}
          </button>
        ))}
      </div>
      <div className="mt-3 text-right">
        <button onClick={onClose} className="px-3 py-1 bg-yellow-600 text-white rounded-lg">OK</button>
      </div>
    </div>
  </PortalModal>
);


const DiscoveryQuickFilters: React.FC<DiscoveryQuickFiltersProps> = ({
  filters,
  onFiltersChange,
  locations,
  categories,
  tags
}) => {
  const [showTagsPopup, setShowTagsPopup] = useState(false);
  const [showCategoriesPopup, setShowCategoriesPopup] = useState(false);
  const [showLocationsPopup, setShowLocationsPopup] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const currentCalendar = filters.calendarType ?? CalendarType.SOLAR;

  type FilterKey = "categoryIds" | "tagIds" | "locations";

const toggleArrayValue = (key: FilterKey, value: number | string) => {
  if (key === "locations" && typeof value === "string") {
    const current: string[] = filters.locations || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ locations: updated });
  } else {
    const current: number[] = (filters[key] as number[]) || [];
    const updated = current.includes(value as number)
      ? current.filter((v) => v !== value)
      : [...current, value as number];
    onFiltersChange({ [key]: updated });
  }
};




  const clearDateFilters = () => {
  onFiltersChange({
    ...filters,
    startDay: undefined,
    startMonth: undefined,
    endDay: undefined,
    endMonth: undefined,
    calendarType: CalendarType.SOLAR,
    page: filters.page ?? 1, // giữ nguyên page
  });
};

const clearAllFilters = () => {
  onFiltersChange({
    ...filters,
    keyword: undefined,
    categoryIds: [],
    tagIds: [],
    locations: [],
    startDay: undefined,
    startMonth: undefined,
    endDay: undefined,
    endMonth: undefined,
    calendarType: CalendarType.SOLAR,
    sortBy: SortBy.NameAsc,
    page: filters.page ?? 1, // giữ nguyên page
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
    <div className="p-4 pt-7 bg-white rounded-xl shadow space-y-4">
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
      ? (categories || []).filter((c) => filters.categoryIds?.includes(c.id))
      : (categories || []).slice(0, 3)
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
        {cat.name} {/* Nếu muốn icon thì cần bổ sung từ API */}
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
            <h4 className="font-medium mb-2">Thể loại</h4>
            <div className="flex flex-wrap gap-2">
              {(filters.tagIds?.length
                ? (tags || []).filter((t) => filters.tagIds?.includes(t.id))
                : (tags || []).slice(0, 3)
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
    {(filters.locations?.length
      ? locations?.filter((l) => filters.locations?.includes(l.name))
      : locations?.slice(0, 3)
    )?.map((loc) => (
      <button
        key={loc.name}
        onClick={() => toggleArrayValue("locations", loc.name)}
        className={`px-3 py-1 rounded-2xl text-sm border transition ${
          filters.locations?.includes(loc.name)
            ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
            : "bg-white text-gray-700 border-yellow-300 hover:bg-yellow-50"
        }`}
      >
        {loc.name}
        {filters.locations?.includes(loc.name) && <span className="ml-1">✕</span>}
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
      <MultiSelectModal
  open={showCategoriesPopup}
  title="Chọn nhiều danh mục"
  items={(categories || []).map(c => ({
    key: c.id,
    label: c.name,
    selected: !!filters.categoryIds?.includes(c.id)
  }))}
  onToggle={(key) => toggleArrayValue("categoryIds", key as number)}
  onClose={() => setShowCategoriesPopup(false)}
/>

<MultiSelectModal
  open={showTagsPopup}
  title="Chọn nhiều Tag"
  items={(tags || []).map(t => ({
    key: t.id,
    label: t.name,
    selected: !!filters.tagIds?.includes(t.id)
  }))}
  onToggle={(key) => toggleArrayValue("tagIds", key as number)}
  onClose={() => setShowTagsPopup(false)}
/>

<MultiSelectModal
  open={showLocationsPopup}
  title="Chọn nhiều địa phương"
  items={(locations || []).map(l => ({
    key: l.name,
    label: l.name,
    selected: !!filters.locations?.includes(l.name)
  }))}
  onToggle={(key) => toggleArrayValue("locations", key as string)}
  onClose={() => setShowLocationsPopup(false)}
/>


    </div>
  );
};

export default DiscoveryQuickFilters;
