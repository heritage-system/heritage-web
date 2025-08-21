import React from 'react';
import {
  Search,
} from 'lucide-react';


// Search and Filter Component
interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters?: { label: string; value: string; options: { label: string; value: string }[] }[];
  onFilterChange?: (filterKey: string, value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  filters = [],
  onFilterChange
}) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
  </div>
);

export default SearchFilter;