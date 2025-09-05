import React, { useState, useEffect } from "react";
import { FavoriteHeritage } from "../../types/favorite";
import { getFavorites, removeFavorite } from "../../services/favoriteService";
import { authToast } from "../../utils/authToast";
import { useNavigate } from "react-router-dom";
import Pagination from "../Layouts/Pagination";

interface FavoriteHeritageListProps {
  onRefresh?: () => void;
}

const FavoriteHeritageList: React.FC<FavoriteHeritageListProps> = ({
  onRefresh,
}) => {
  const [favorites, setFavorites] = useState<FavoriteHeritage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const navigate = useNavigate();

  const fetchFavorites = async (
    searchName?: string,
    pageArg?: number,
    pageSizeArg?: number
  ) => {
    try {
      setLoading(true);
      const response = await getFavorites(
        pageArg ?? page,
        pageSizeArg ?? pageSize,
        searchName && searchName.trim() !== "" ? searchName : undefined
      );
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
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (heritageId: number) => {
    try {
      setRemovingId(heritageId);
      const response = await removeFavorite(heritageId);
      if (response.code === 200) {
        setFavorites((prev) =>
          prev.filter((fav) => fav.heritageId !== heritageId)
        );
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

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Refetch when debounced search changes
  useEffect(() => {
    setPage(1);
    fetchFavorites(debouncedSearch, 1);
  }, [debouncedSearch]);

  // Refetch when paging changes
  useEffect(() => {
    fetchFavorites(debouncedSearch, page, pageSize);
  }, [page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">💔</div>
        <div className="text-gray-500">Chưa có di sản yêu thích nào</div>
        <div className="text-sm text-gray-400 mt-1">
          Hãy khám phá và thêm di sản vào danh sách yêu thích của bạn
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Page size selector */}
      <div className="flex items-center gap-2 mb-4">
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
      </div>

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
              {/* Description removed */}
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
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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

      {/* Pagination component */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={pageSize}
        totalItems={totalElements}
      />
    </div>
  );
};

export default FavoriteHeritageList;
