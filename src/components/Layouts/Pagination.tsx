import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPages = () => {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const add = (value: number | string) => {
    if (!pages.includes(value)) pages.push(value);
  };

  add(1);

  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) add("…");

  for (let p = left; p <= right; p++) add(p);

  if (right < totalPages - 1) add("…");

  add(totalPages);

  return pages;
};



  const pages = getPages();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        Hiển thị {startItem} - {endItem} của {totalItems} kết quả
      </div>

      <div className="flex items-center space-x-2">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Pages */}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dots-${i}`} className="px-2 text-gray-500">
              …
            </span>
          ) : (
            <button
              key={`page-${p}-${i}`}
              onClick={() => onPageChange(p as number)}
              className={`px-3 py-1 rounded ${
                currentPage === p
                  ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}


        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
