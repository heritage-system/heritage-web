import React, { useState, useEffect, useRef } from "react";
import { HeritageName } from "../../types/heritage";
import { searchHeritageNames } from "../../services/heritageService";

interface Props {
  selected: HeritageName[];
  onChange: (heritages: HeritageName[]) => void;
}

const HeritageMultiSelect: React.FC<Props> = ({ selected, onChange }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<HeritageName[]>([]);
  const [open, setOpen] = useState(false); // 👈 quản lý hiển thị khung gợi ý

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Fetch gợi ý
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const fetchData = async () => {
      const res = await searchHeritageNames(query);
      setSuggestions(res.result || []);
      setOpen(true);
    };

    fetchData();
  }, [query]);

  // Detect click outside -> đóng gợi ý
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSelect = (h: HeritageName) => {
    if (selected.some((s) => s.id === h.id)) {
      onChange(selected.filter((s) => s.id !== h.id));
    } else {
      onChange([...selected, h]);
    }
    setOpen(false); // 👈 chọn xong thì đóng luôn
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="block text-sm font-medium">Liên quan đến di sản</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nhập tên di sản..."
        className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-700/40"
        onFocus={() => suggestions.length > 0 && setOpen(true)} // focus thì mở
      />

      {/* Suggest list */}
      {open && suggestions.length > 0 && (
        <div className="absolute mt-1 w-full border rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto z-10">
          {suggestions.map((h) => (
            <button
              key={h.id}
              onClick={() => toggleSelect(h)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                selected.some((s) => s.id === h.id)
                  ? "bg-yellow-50 text-yellow-800"
                  : ""
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {selected.map((h) => (
          <span
            key={h.id}
            className="px-3 py-1 text-sm rounded-full bg-yellow-700 text-white flex items-center gap-1"
          >
            {h.name}
            <button onClick={() => toggleSelect(h)} className="ml-1">
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default HeritageMultiSelect;
