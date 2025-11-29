import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Eye,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";
import { Category } from "../../types/category";

interface Props {
  categories: Category[];
  onFilterChange: (filters: { keyword?: string; categoryIds?: number[] }) => void;
}

const VRToursFilter: React.FC<Props> = ({categories, onFilterChange }) => {
  const [keyword, setKeyword] = useState("");
  const [tempSelectedFilters, setTempSelectedFilters] = useState<number[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Danh sách filter hiển thị UI
  const filters = [
    { id: "temple", label: "Chùa chiền", icon: MapPin },
    { id: "palace", label: "Cung đình", icon: Star },
    { id: "museum", label: "Bảo tàng", icon: Eye },
    { id: "festival", label: "Lễ hội", icon: Calendar },
    { id: "history", label: "Lịch sử", icon: Star },
    { id: "nature", label: "Thiên nhiên", icon: MapPin },
    { id: "architecture", label: "Kiến trúc", icon: Eye },
    { id: "tradition", label: "Truyền thống", icon: Calendar },
  ];


  const openMenu = () => {
    setTempSelectedFilters(selectedFilters);
    setOpenDropdown(true);
  };

  const applyFilters = () => {
    setSelectedFilters(tempSelectedFilters);
    setOpenDropdown(false);
  };


  // Gửi filter ra parent
  useEffect(() => {
    onFilterChange({
      keyword,
      categoryIds: selectedFilters,
    });
  }, [keyword, selectedFilters]);

  const toggleFilter = (id: number) => {
    setSelectedFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Click outside để đóng dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <section className="bg-white py-6 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* SEARCH */}
          <div className="relative flex-[2] w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm tour VR..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600"
            />
          </div>

          {/* MULTI FILTER */}
<div ref={dropdownRef} className="relative flex-[1] w-full lg:w-auto">
  <button
    onClick={() => {
      setTempSelectedFilters(selectedFilters); // copy state
      setOpenDropdown(true);
    }}
    className="flex items-center gap-2 px-4 py-3 border w-full rounded-xl bg-white shadow-sm transition-all focus:ring-2 focus:ring-yellow-600"
  >
    <Filter className="w-5 h-5 text-gray-600" />
    <span className="font-medium text-gray-700">
      {selectedFilters.length === 0
        ? "Loại địa điểm"
        : `${selectedFilters.length} mục đã chọn`}
    </span>
    <ChevronDown
      className={`w-4 h-4 ml-auto text-gray-600 transition ${
        openDropdown ? "rotate-180" : ""
      }`}
    />
  </button>

  {/* DROPDOWN */}
  {openDropdown && (
    <div
      className="
        absolute mt-2
        left-1/2 -translate-x-1/2 w-[90%]
        lg:left-auto lg:-translate-x-0 lg:right-0 lg:w-[26rem]
        bg-white border border-gray-200 rounded-xl shadow-2xl z-40 overflow-hidden
      "
    >
      <div className="p-2 max-h-72 overflow-y-auto flex flex-col gap-1">
        {categories.map((f) => {
          const isChecked = tempSelectedFilters.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() =>
                setTempSelectedFilters((prev) =>
                  prev.includes(f.id)
                    ? prev.filter((x) => x !== f.id)
                    : [...prev, f.id]
                )
              }
              className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-gray-700 font-medium">{f.name}</span>
              {isChecked && <Check className="w-5 h-5 text-yellow-600" />}
            </button>
          );
        })}
      </div>

      <div className="border-t p-3 bg-gray-50 flex justify-end gap-2">
        <button
          onClick={() => setOpenDropdown(false)}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700"
        >
          Hủy
        </button>

        <button
          onClick={() => {
            setSelectedFilters(tempSelectedFilters);
            setOpenDropdown(false);
          }}
          className="px-4 py-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white font-medium rounded-lg shadow hover:opacity-90"
        >
          Áp dụng
        </button>
      </div>
    </div>
  )}
</div>

        </div>
      </div>
    </section>
  );
};

export default VRToursFilter;
