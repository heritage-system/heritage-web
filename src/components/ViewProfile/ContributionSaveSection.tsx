import React, { useState, useEffect, useRef } from "react";
import { 
  LucideBookMarked,
  HeartCrack
} from 'lucide-react';
import { ContributionSaveResponse } from "../../types/contribution";
import { getContributionSaves, removeContributionSave } from "../../services/contributionService";
import { useNavigate } from "react-router-dom";
import Pagination from "../Layouts/Pagination";
import Spinnner from "../Layouts/LoadingLayouts/Spinner";
import toast from "react-hot-toast";
interface ContributionSaveListProps {
  onRefresh?: () => void;
}

const ContributionSaveSection: React.FC<ContributionSaveListProps> = ({ onRefresh })  => {
  const [contributionSaves, setContributionSaves] = useState<ContributionSaveResponse[]>([]);
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
      const response = await getContributionSaves({
        keyword: search || undefined,
        page: page,
        pageSize: pageSize
      });


      // chỉ nhận kết quả mới nhất
      if (currentId !== requestIdRef.current) return;

      if (response.code === 200 && response.result) {
        setContributionSaves(response.result.items);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      } else {
        toast.error("Không thể tải danh sách lưu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách lưu");
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

  const handleRemoveFavorite = async (contributionId: number) => {
    try {
      setRemovingId(contributionId);
      const response = await removeContributionSave(contributionId);
      if (response.code === 200) {
        setContributionSaves((prev) => prev.filter((fav) => fav.contributionId !== contributionId));
        setTotalElements((prev) => Math.max(prev - 1, 0));
        toast.success("Đã xóa khỏi danh sách lưu");
        onRefresh?.();
      } else {
        toast.error("Không thể xóa khỏi danh sách lưu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa khỏi danh sách lưu");
    } finally {
      setRemovingId(null);
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const noResults = !loading && contributionSaves.length === 0;
  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-black mb-3 flex items-center gap-3">
            <LucideBookMarked className="w-10 h-10 text-green-500" />
            Bài viết đã lưu
          </h2>
          <p className="text-gray-700 text-lg">Những bài viết đóng góp mà bạn đã lưu</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-yellow-300/50 shadow-lg">
          <div className="text-3xl font-bold text-yellow-700">{totalElements}</div>
          <div className="text-sm text-yellow-600 font-medium">Bài viết lưu</div>
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
          placeholder="Tìm theo tên bài viết..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
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
          <span className="flex items-center gap-2 text-sm text-gray-500 ml-1">          
              <Spinnner size={20}/>          
            Đang tải...
          </span>
        )}
      </div>

      {/* List hoặc Empty state */}
      {!noResults ? (
        <>
          {contributionSaves.map((favorite) => (
  <div
    key={favorite.contributionId}
    className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow cursor-pointer flex gap-4"
    onClick={() => navigate(`/contributions/${favorite.contributionId}`)}
  >
    {/* Ảnh preview */}
    <img
      src={favorite.mediaUrl || "/default-thumbnail.jpg"}
      alt={favorite.title}
      className="w-28 h-28 object-cover rounded-lg flex-shrink-0"
    />

    {/* Nội dung */}
    <div className="flex-1 min-w-0">
      {/* Tên di sản */}
      <h3 className="font-semibold text-gray-800 text-lg truncate">
        {favorite.title}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 my-2">
        {favorite.contributionHeritageTags?.map((tag) => (
          <span
            key={tag.id}
            className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full"
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Tác giả */}
      <div className="flex items-center gap-2 mt-2">
        <img
          src={favorite.avatarUrl || "/default-avatar.png"}
          alt={favorite.contributorName}
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-sm text-gray-700">{favorite.contributorName}</span>
      </div>
    </div>

    {/* Nút remove */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleRemoveFavorite(favorite.contributionId);
      }}
      disabled={removingId === favorite.contributionId}
      className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 self-start"
      title="Xóa khỏi danh sách lưu"
    >
      {removingId === favorite.contributionId ? (
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
          <div className="flex justify-center items-center text-gray-400 text-lg mb-2">
            <HeartCrack className="w-10 h-10" />
          </div>
          <div className="text-gray-500">
            {debouncedSearch
              ? `Không tìm thấy bài viết nào cho “${debouncedSearch}”`
              : "Chưa có bài viết được lưu nào"}
          </div>
          {!debouncedSearch && (
            <div className="text-sm text-gray-400 mt-1">
              Hãy khám phá và thêm bài viết vào danh sách lưu của bạn
            </div>
          )}
        </div>
      )}
    </div>
      </div>
    </div>
  );
};

export default ContributionSaveSection;