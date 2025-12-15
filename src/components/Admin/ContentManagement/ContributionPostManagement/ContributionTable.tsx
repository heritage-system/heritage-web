import React from "react";
import { Eye, CheckCircle, XCircle, CircleSlash, RotateCcw } from "lucide-react";
import { ContributionOverviewItemListResponse } from "../../../../types/contribution";
import { ContributionStatus } from "../../../../types/enum";

interface ContributionTableProps {
  data: ContributionOverviewItemListResponse[];
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onView: (item: ContributionOverviewItemListResponse) => void;
  onAction: (item: ContributionOverviewItemListResponse, action: "approve" | "reject" | "disable" | "reactive") => void;
  loading?: boolean;
  activeTabStatus?: ContributionStatus | undefined; 
}

const ContributionTable: React.FC<ContributionTableProps> = ({
  data,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onView,
  onAction,
  loading,
  activeTabStatus,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ContributionStatus.PENDING:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Chờ duyệt
          </span>
        );
      case ContributionStatus.APPROVED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Đã duyệt
          </span>
        );
      case ContributionStatus.REJECTED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Đã từ chối
          </span>
        );
      case ContributionStatus.DISABLE:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Vô hiệu hóa
          </span>
        );
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thẻ di sản</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>

              {activeTabStatus === ContributionStatus.APPROVED && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày duyệt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày xuất bản</th>
                </>
              )}

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
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
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm">{c.id}</td>
                  <td className="px-6 py-4 text-sm font-medium truncate max-w-xs">{c.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={c.contributionHeritageTags?.map((tag) => tag.name).join(", ")}>
                    {c.contributionHeritageTags?.map((tag) => tag.name).join(", ") || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : "-"}
                  </td>

                  {activeTabStatus === ContributionStatus.APPROVED && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {c.approvedAt ? new Date(c.approvedAt).toLocaleDateString("vi-VN") : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {c.publishedAt ? new Date(c.publishedAt).toLocaleDateString("vi-VN") : "-"}
                      </td>
                    </>
                  )}

                  <td className="px-6 py-4">{getStatusBadge(c.status)}</td>

                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => onView(c)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {c.status === ContributionStatus.APPROVED && (
                        <>
                          <button
                            onClick={() => onAction(c, "disable")}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Vô hiệu hóa"
                          >
                            <CircleSlash size={16} />
                          </button>                       
                        </>
                      )}
                      {c.status === ContributionStatus.DISABLE && (
                        <>
                          <button
                            onClick={() => onAction(c, "reactive")}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Vô hiệu hóa"
                          >
                            <RotateCcw size={16} />
                          </button>                       
                        </>
                      )}
                      {c.status === ContributionStatus.PENDING && (
                        <>
                          <button
                            onClick={() => onAction(c, "approve")}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Duyệt bài"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => onAction(c, "reject")}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Từ chối"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* 🔹 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 p-4 text-sm text-gray-600">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className={`px-3 py-1 rounded ${page === 1 ? "opacity-50" : "hover:bg-gray-100"}`}
          >
            Trước
          </button>
          <span>Trang {page}/{totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className={`px-3 py-1 rounded ${page === totalPages ? "opacity-50" : "hover:bg-gray-100"}`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ContributionTable;
