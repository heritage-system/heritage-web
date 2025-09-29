import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, 
 
} from 'lucide-react';
import { FavoriteHeritage } from "../../types/favorite";
import { getFavorites, removeFavorite } from "../../services/favoriteService";
import { authToast } from "../../utils/authToast";
import { useNavigate } from "react-router-dom";
import Pagination from "../Layouts/Pagination";

interface FavoriteHeritageListProps {
  onRefresh?: () => void;
}

const FavoriteSection: React.FC<FavoriteHeritageListProps> = ({ onRefresh })  => {
  const [favorites, setFavorites] = useState<FavoriteHeritage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // search
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // paging
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const navigate = useNavigate();
  const requestIdRef = useRef(0); // tránh race condition

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Khi search thay đổi (debounced) -> về trang 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchFavorites = async (s?: string, p?: number, ps?: number) => {
    const currentId = ++requestIdRef.current;
    try {
      setLoading(true);
      const response = await getFavorites(
        p ?? page,
        ps ?? pageSize,
        s && s !== "" ? s : undefined
      );

      // chỉ nhận kết quả mới nhất
      if (currentId !== requestIdRef.current) return;

      if (response.code === 200 && response.result) {
        setFavorites(response.result.items);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      } else {
        authToast.error("Không thể tải danh sách yêu thích");
      }
    } catch (error) {
      authToast.error("Có lỗi xảy ra khi tải danh sách yêu thích");
    } finally {
      // chỉ tắt loading nếu là request mới nhất
      if (currentId === requestIdRef.current) setLoading(false);
    }
  };

  // Fetch mỗi khi search/page/pageSize thay đổi
  useEffect(() => {
    fetchFavorites(debouncedSearch, page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, pageSize]);

  const handleRemoveFavorite = async (heritageId: number) => {
    try {
      setRemovingId(heritageId);
      const response = await removeFavorite(heritageId);
      if (response.code === 200) {
        setFavorites((prev) => prev.filter((fav) => fav.heritageId !== heritageId));
        setTotalElements((prev) => Math.max(prev - 1, 0));
        authToast.success("Đã xóa khỏi danh sách yêu thích");
        onRefresh?.();
      } else {
        authToast.error("Không thể xóa khỏi danh sách yêu thích");
      }
    } catch (error) {
      authToast.error("Có lỗi xảy ra khi xóa khỏi danh sách yêu thích");
    } finally {
      setRemovingId(null);
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const noResults = !loading && favorites.length === 0;
  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-black mb-3 flex items-center gap-3">
            <Heart className="w-10 h-10 text-red-500" />
            Di sản yêu thích
          </h2>
          <p className="text-gray-700 text-lg">Những di sản văn hóa mà bạn đã yêu thích</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-yellow-300/50 shadow-lg">
          <div className="text-3xl font-bold text-yellow-700">{totalElements}</div>
          <div className="text-sm text-yellow-600 font-medium">Di sản yêu thích</div>
        </div>
      </div>
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-yellow-200">
        <div className="space-y-4">
      {/* Search bar luôn hiển thị */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setDebouncedSearch(search.trim()); // search ngay, bỏ qua debounce
          }}
          placeholder="Tìm theo tên di sản..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            Xóa
          </button>
        )}
      </div>

      {/* Page size luôn hiển thị */}
      <div className="flex items-center gap-2 mb-2">
        <label className="flex items-center gap-1 text-sm text-gray-600">
          Hiển thị
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          mỗi trang
        </label>
        {loading && (
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></span>
            Đang tải...
          </span>
        )}
      </div>

      {/* List hoặc Empty state */}
      {!noResults ? (
        <>
          {favorites.map((favorite) => (
            <div
              key={favorite.heritageId}
              className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/heritagedetail/${favorite.heritageId}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {favorite.heritageName}
                    </h3>
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                      {favorite.categoryName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Đã thêm vào{" "}
                    {new Date(favorite.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.heritageId);
                  }}
                  disabled={removingId === favorite.heritageId}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  {removingId === favorite.heritageId ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Pagination (ẩn nếu chỉ có 1 trang) */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={pageSize}
              totalItems={totalElements}
            />
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">💔</div>
          <div className="text-gray-500">
            {debouncedSearch
              ? `Không tìm thấy di sản nào cho “${debouncedSearch}”`
              : "Chưa có di sản yêu thích nào"}
          </div>
          {!debouncedSearch && (
            <div className="text-sm text-gray-400 mt-1">
              Hãy khám phá và thêm di sản vào danh sách yêu thích của bạn
            </div>
          )}
        </div>
      )}
    </div>
      </div>
    </div>
  );
};

export default FavoriteSection;