import React from "react";
import { X, Calendar, Tag, Eye } from "lucide-react";
import { htmlFromDeltaWithImgAlign, toHtml } from "../../../../utils/deltaUtils";
import { ContributionStatus } from "../../../../types/enum";
import { ContributionOverviewResponse } from "../../../../types/contribution";

interface ContributionViewProps {
  open: boolean;
  onClose: () => void;
  contribution: ContributionOverviewResponse | null;
  loading?: boolean;
}

const ContributionView: React.FC<ContributionViewProps> = ({ 
  open, 
  onClose, 
  contribution,
  loading = false 
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case ContributionStatus.APPROVED:
        return <span className="text-green-700 font-semibold">Đã duyệt</span>;
      case ContributionStatus.REJECTED:
        return <span className="text-red-700 font-semibold">Đã từ chối</span>;
      default:
        return <span className="text-yellow-700 font-semibold">Chờ duyệt</span>;
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết bài đóng góp</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* No Data State */}
        {!loading && !contribution && (
          <div className="flex items-center justify-center p-12">
            <p className="text-gray-500 text-lg">Không thể tải dữ liệu bài đóng góp</p>
          </div>
        )}

        {/* Content */}
        {!loading && contribution && (
          <div className="overflow-y-auto">
            {/* Ảnh bìa */}
            {contribution.mediaUrl && (
              <img
                src={contribution.mediaUrl}
                alt="Ảnh bìa"
                className="w-full h-64 sm:h-80 object-cover"
              />
            )}

            {/* Header thông tin bài */}
            <div className="p-6 border-b border-gray-200">
              {/* Heritage Tags */}
              {contribution.contributionHeritageTags && contribution.contributionHeritageTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {contribution.contributionHeritageTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-700 to-red-700 text-white"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {contribution.title || "(Chưa có tiêu đề)"}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(contribution.createdAt)}</span>
                </div>

                {contribution.view != null && (
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{contribution.view} lượt xem</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="font-medium">Trạng thái:</span>
                  {getStatusBadge(contribution.status)}
                </div>

                {contribution.isPremium && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                    Premium
                  </span>
                )}
              </div>

              {/* Monthly Views Stats */}
              {contribution.monthlyViews && contribution.monthlyViews.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Thống kê lượt xem theo tháng</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {contribution.monthlyViews.map((stat, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">Tháng {stat.month}/{stat.year}:</span>
                        <span className="font-medium">{stat.views} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nội dung */}
            <div className="p-6">
              {(() => {
                let delta = null;
                try {
                  delta = contribution.content ? JSON.parse(contribution.content) : null;
                } catch {
                  delta = null;
                }

                if (delta && delta.ops) {
                  return (
                    <div
                      className="prose max-w-none quill-content
                        [&_blockquote]:border-l-4
                        [&_blockquote]:border-black
                        [&_blockquote]:pl-4
                        [&_blockquote]:my-2
                        [&_.ql-caption]:text-gray-500
                        [&_.ql-caption]:italic
                        [&_.ql-caption]:text-sm
                        [&_.ql-caption]:m-0
                        prose-headings:mt-0 prose-p:mt-0 prose-img:mt-0 prose-figure:mt-0
                        border rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[600px]"
                      dangerouslySetInnerHTML={{ __html: htmlFromDeltaWithImgAlign(delta.ops) }}
                    />
                  );
                } else if (contribution.content) {
                  // Fallback: hiển thị content dưới dạng text
                  return (
                    <div className="border rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[600px]">
                      <p className="text-gray-700 whitespace-pre-wrap">{contribution.content}</p>
                    </div>
                  );
                } else {
                  return <p className="text-gray-500 italic">Không có nội dung để hiển thị</p>;
                }
              })()}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 sticky bottom-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContributionView;
