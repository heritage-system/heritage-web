import React from "react";

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
}

const PanoramaTourFilters: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-base">

      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 border rounded-lg"
        />
      </div>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2.5 border rounded-lg bg-white"
      >
        <option value="">Mặc định</option>
        <option value="date">Mới nhất</option>
        <option value="name">Tên A-Z</option>
      </select>
    </div>
  );
};

export default PanoramaTourFilters;