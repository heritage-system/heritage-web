import React, { useState, useEffect } from "react";
import { Edit, Eye, Check, X, Ban, RotateCcw, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { searchContributors } from "../../../../services/contributorService";
import { ContributorResponse } from "../../../../types/contributor";
import { ContributorStatus, SortBy } from "../../../../types/enum";
import Pagination from "../../../Layouts/Pagination";

interface ContributorTableProps {
  filterStatus?: ContributorStatus;
  onEdit: (contributor: ContributorResponse) => void;
  onView: (contributor: ContributorResponse) => void;
  onAction: (
    contributor: ContributorResponse,
    action: "delete" | "approve" | "reject" | "restore"
  ) => void;
  refreshTrigger: number;
  onDataChange?: () => void;
}

const ContributorTable: React.FC<ContributorTableProps> = ({
  filterStatus,
  onEdit,
  onView,
  onAction,
  refreshTrigger,
  onDataChange,
}) => {
  const [contributors, setContributors] = useState<ContributorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.IdDesc);

  const loadContributors = async () => {
    setLoading(true);
    try {
      const res = await searchContributors({
        keyword: searchTerm,
        status: filterStatus,
        page: currentPage,
        pageSize: itemsPerPage,
        sortBy: sortBy,
      });

    if (res.code === 200 && res.result) {
        setContributors(res.result.items ?? []); 
        setTotalPages(res.result.totalPages);
        if (onDataChange) onDataChange();
      } else {
        setContributors([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Load contributors error:", error);
      toast.error("Không thể tải dữ liệu cộng tác viên");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadContributors();
  }, [searchTerm, currentPage, itemsPerPage, sortBy, filterStatus, refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // Hiển thị badge cho status
  const getStatusBadge = (status: ContributorStatus | string) => {
    const normalizedStatus =
      typeof status === "string" ? status.toUpperCase() : status;

    switch (normalizedStatus) {
      case ContributorStatus.APPLIED:
      case "APPLIED":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Chờ duyệt
          </span>
        );
      case ContributorStatus.REJECTED:
      case "REJECTED":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Bị từ chối
          </span>
        );
      case ContributorStatus.ACTIVE:
      case "ACTIVE":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Đang hoạt động
          </span>
        );
      case ContributorStatus.SUSPENDED:
      case "SUSPENDED":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Bị đình chỉ
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
            {String(status)}
          </span>
        );
    }
  };

  const getSortText = (sortValue: SortBy) => {
    switch (sortValue) {
      case SortBy.IdAsc:
        return "ID tăng dần";
      case SortBy.IdDesc:
        return "ID giảm dần";
      case SortBy.NameAsc:
        return "Tên A-Z";
      case SortBy.NameDesc:
        return "Tên Z-A";
      case SortBy.DateAsc:
        return "Ngày tăng dần";
      case SortBy.DateDesc:
        return "Ngày giảm dần";
      default:
        return "Mặc định";
    }
  };

  // Action buttons theo business logic
  const renderActionButtons = (contributor: ContributorResponse) => {
  const status =
    typeof contributor.status === "string"
      ? contributor.status.toUpperCase()
      : contributor.status;

  return (
    <>
      {/* View luôn có */}
      <button
        onClick={() => onView(contributor)}
        className="text-blue-600 hover:text-blue-900 p-1"
        title="Xem chi tiết"
      >
        <Eye size={16} />
      </button>

      {/* Edit luôn có */}
      {status !== ContributorStatus.APPLIED && 
        status !== ContributorStatus.REJECTED && 
        status !== ContributorStatus.SUSPENDED && (
        <button
          onClick={() => onEdit(contributor)}
          className="text-indigo-600 hover:text-indigo-900 p-1"
          title="Chỉnh sửa"
        >
          <Edit size={16} />
        </button>
      )}

      {/* APPLIED → Admin có thể Accept hoặc Reject */}
      {status === ContributorStatus.APPLIED && (
        <>
          <button
            onClick={() => onAction(contributor, "approve")}
            className="text-green-600 hover:text-green-900 p-1"
            title="Phê duyệt"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => onAction(contributor, "reject")}
            className="text-red-600 hover:text-red-900 p-1"
            title="Từ chối"
          >
            <X size={16} />
          </button>
        </>
      )}

      {/* REJECTED → chỉ xem, không có nút action khác */}

      {/* ACTIVE → Admin có thể đình chỉ (Suspend) */}
      {status === ContributorStatus.ACTIVE && (
        <button
          onClick={() => onAction(contributor, "delete")}
          className="text-red-600 hover:text-red-900 p-1"
          title="Đình chỉ"
        >
          <Ban size={16} />
        </button>
      )}

      {/* SUSPENDED → Admin có thể khôi phục (Activate lại) */}
        {status === ContributorStatus.SUSPENDED && (
          <button
            onClick={() => onAction(contributor, "restore")}
            className="text-green-600 hover:text-green-900 p-1"
            title="Khôi phục"
          >
            <RotateCcw size={16} />
          </button>
        )}
    </>
  );
};

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-end mb-6">
        {/* Ô tìm kiếm đẹp */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sắp xếp:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortBy);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          >
            <option value={SortBy.IdDesc}>Mới nhất</option>
            <option value={SortBy.IdAsc}>Cũ nhất</option>
            <option value={SortBy.NameAsc}>Tên: A → Z</option>
            <option value={SortBy.NameDesc}>Tên: Z → A</option>
            <option value={SortBy.DateDesc}>Ngày cập nhật giảm</option>
            <option value={SortBy.DateAsc}>Ngày cập nhật tăng</option>
          </select>
        </div>

        {/* Số lượng / trang */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Hiển thị:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
            <option value={100}>100 / trang</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Cộng Tác Viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cập nhật
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số đóng góp
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : contributors.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy kết quả nào"
                    : "Không có dữ liệu"}
                </td>
              </tr>
            ) : (
              contributors.map((contributor) => (
                <tr
                  key={contributor.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contributor.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contributor.userFullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contributor.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contributor.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contributor.updatedAt
                      ? new Date(contributor.updatedAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contributor.count ?? 0}
                  </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      {renderActionButtons(contributor)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && contributors.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={contributors.length}
          />
        </div>
      )}
    </div>
  );
};

export default ContributorTable;
