import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, FileText } from "lucide-react";

interface ContributionTableProps {
  filterStatus?: string;
  onView: (contribution: any) => void;
  onAction: (contribution: any, action: "approve" | "reject") => void;
  refreshTrigger: number;
  onCountsUpdate?: (counts: any) => void;
}

// Enums
const ContributionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const PremiumType = {
  FREE: "FREE",
  SUBSCRIPTION_ONLY: "SUBSCRIPTION_ONLY",
  ONE_TIME_PURCHASE: "ONE_TIME_PURCHASE",
  HYBRID: "HYBRID",
};

// Current staff ID (trong thực tế lấy từ auth context)
const CURRENT_STAFF_ID = 1;

// Mock data - chỉ hiển thị contributions được phân cho staff này
const mockContributions = [
  {
    id: 1,
    title: "Văn hóa ẩm thực Việt Nam",
    coverImageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800",
    htmlContent: "<h1>Văn hóa ẩm thực Việt Nam</h1><p>Nội dung chi tiết về văn hóa ẩm thực...</p>",
    contributorName: "Nguyễn Văn A",
    contributorEmail: "nguyenvana@example.com",
    status: ContributionStatus.PENDING,
    premiumType: PremiumType.FREE,
    createdAt: new Date().toISOString(),
    heritageTags: ["Ẩm thực", "Văn hóa"],
    staffApprovals: [], // Danh sách staff đã approve
    requiredApprovals: 2, // Số lượng staff cần approve
    assignedStaffIds: [1, 2], // Staff được phân công
  },
  {
    id: 2,
    title: "Lễ hội truyền thống miền Bắc",
    coverImageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    htmlContent: "<h1>Lễ hội truyền thống</h1><p>Mô tả về các lễ hội truyền thống...</p>",
    contributorName: "Trần Thị B",
    contributorEmail: "tranthib@example.com",
    status: ContributionStatus.APPROVED,
    premiumType: PremiumType.SUBSCRIPTION_ONLY,
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    heritageTags: ["Lễ hội", "Truyền thống"],
    staffApprovals: [1, 2],
    requiredApprovals: 2,
    assignedStaffIds: [1, 2],
  },
  {
    id: 3,
    title: "Nghề thủ công truyền thống",
    coverImageUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800",
    htmlContent: "<h1>Nghề thủ công</h1><p>Các nghề thủ công truyền thống Việt Nam...</p>",
    contributorName: "Lê Văn C",
    contributorEmail: "levanc@example.com",
    status: ContributionStatus.PENDING,
    premiumType: PremiumType.ONE_TIME_PURCHASE,
    createdAt: new Date().toISOString(),
    heritageTags: ["Thủ công", "Nghề truyền thống"],
    staffApprovals: [1], // Đã có 1 người approve
    requiredApprovals: 2,
    assignedStaffIds: [1, 2],
  },
];

const ContributionTable: React.FC<ContributionTableProps> = ({
  filterStatus,
  onView,
  onAction,
  refreshTrigger,
  onCountsUpdate,
}) => {
  const [contributions, setContributions] = useState(mockContributions);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load contributions when refreshTrigger changes
    setLoading(true);
    
    // TODO: Call API to fetch contributions
    // const fetchContributions = async () => {
    //   const response = await getStaffContributions(CURRENT_STAFF_ID, filterStatus);
    //   setContributions(response.data);
    // };
    // fetchContributions();

    setTimeout(() => {
      // Filter contributions assigned to current staff
      const staffContributions = mockContributions.filter(c => 
        c.assignedStaffIds.includes(CURRENT_STAFF_ID)
      );
      setContributions(staffContributions);
      setLoading(false);

      // Update counts
      if (onCountsUpdate) {
        onCountsUpdate({
          pending: staffContributions.filter(c => c.status === ContributionStatus.PENDING).length,
          approved: staffContributions.filter(c => c.status === ContributionStatus.APPROVED).length,
          rejected: staffContributions.filter(c => c.status === ContributionStatus.REJECTED).length,
          all: staffContributions.length,
        });
      }
    }, 500);
  }, [refreshTrigger, filterStatus, onCountsUpdate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ContributionStatus.PENDING:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
            Chờ duyệt
          </span>
        );
      case ContributionStatus.APPROVED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            Đã duyệt
          </span>
        );
      case ContributionStatus.REJECTED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
            Đã từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const getPremiumBadge = (premiumType: string) => {
    switch (premiumType) {
      case PremiumType.FREE:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">
            Miễn phí
          </span>
        );
      case PremiumType.SUBSCRIPTION_ONLY:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">
            Đăng ký
          </span>
        );
      case PremiumType.ONE_TIME_PURCHASE:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 font-medium">
            Mua 1 lần
          </span>
        );
      case PremiumType.HYBRID:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 font-medium">
            Kết hợp
          </span>
        );
      default:
        return null;
    }
  };

  const renderActionButtons = (contribution: any) => {
    const hasApproved = contribution.staffApprovals.includes(CURRENT_STAFF_ID);

    return (
      <div className="flex justify-end items-center gap-2">
        <button
          onClick={() => onView(contribution)}
          className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
          title="Xem chi tiết"
        >
          <Eye size={16} />
        </button>

        {contribution.status === ContributionStatus.PENDING && !hasApproved && (
          <>
            <button
              onClick={() => onAction(contribution, "approve")}
              className="text-green-600 hover:text-green-900 p-1 transition-colors"
              title="Duyệt bài"
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={() => onAction(contribution, "reject")}
              className="text-red-600 hover:text-red-900 p-1 transition-colors"
              title="Từ chối"
            >
              <XCircle size={16} />
            </button>
          </>
        )}

        {hasApproved && contribution.status === ContributionStatus.PENDING && (
          <span className="text-xs text-green-600 font-medium">Đã duyệt</span>
        )}
      </div>
    );
  };

  const filteredContributions = contributions.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contributorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm bài đăng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cộng tác viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duyệt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
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
            ) : filteredContributions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy kết quả nào"
                    : "Không có dữ liệu"}
                </td>
              </tr>
            ) : (
              filteredContributions.map((contribution) => (
                <tr key={contribution.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contribution.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {contribution.title}
                    </div>
                    <div className="text-xs text-gray-500 flex gap-1 mt-1 flex-wrap">
                      {contribution.heritageTags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-gray-100 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {contribution.contributorName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {contribution.contributorEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contribution.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPremiumBadge(contribution.premiumType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contribution.staffApprovals.length}/{contribution.requiredApprovals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contribution.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {renderActionButtons(contribution)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContributionTable;