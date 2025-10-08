import React from "react";
import { X } from "lucide-react";

interface ContributionViewProps {
  open: boolean;
  onClose: () => void;
  contribution: any | null;
}

const ContributionView: React.FC<ContributionViewProps> = ({
  open,
  onClose,
  contribution,
}) => {
  if (!open || !contribution) return null;

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Đã từ chối",
    };
    return statusMap[status] || status;
  };

  const getPremiumText = (premiumType: string) => {
    const premiumMap: Record<string, string> = {
      FREE: "Miễn phí",
      SUBSCRIPTION_ONLY: "Chỉ đăng ký",
      ONE_TIME_PURCHASE: "Mua một lần",
      HYBRID: "Kết hợp",
    };
    return premiumMap[premiumType] || premiumType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Chi tiết bài đăng</h3>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề
            </label>
            <p className="text-gray-900 text-lg font-semibold">
              {contribution.title}
            </p>
          </div>

          {/* Cover Image */}
          {contribution.coverImageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh bìa
              </label>
              <img
                src={contribution.coverImageUrl}
                alt="Cover"
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contributor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cộng tác viên
              </label>
              <p className="text-gray-900">{contribution.contributorName}</p>
              <p className="text-sm text-gray-500">
                {contribution.contributorEmail}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <p className="text-gray-900">
                {getStatusText(contribution.status)}
              </p>
            </div>

            {/* Premium Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại nội dung
              </label>
              <p className="text-gray-900">
                {getPremiumText(contribution.premiumType)}
              </p>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày tạo
              </label>
              <p className="text-gray-900">
                {new Date(contribution.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Heritage Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thẻ di sản
            </label>
            <div className="flex gap-2 flex-wrap">
              {contribution.heritageTags?.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Acceptance Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiến độ duyệt
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(contribution.staffApprovals.length / contribution.requiredApprovals) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {contribution.staffApprovals.length}/{contribution.requiredApprovals}
              </span>
            </div>
          </div>

          {/* HTML Content */}
          {contribution.htmlContent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung
              </label>
              <div 
                className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: contribution.htmlContent }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContributionView;