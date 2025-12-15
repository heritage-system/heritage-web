// ContributionDetailSection.tsx - Updated with Staff UI styling
import React, { useState, useEffect } from "react";
import ContentPreview from "../../../components/ContributionForm/ContentPreview";
import { getContributionOverview } from "../../../services/contributionService";
import { getContributionOverviewForStaff } from "../../../services/contributionAcceptanceService";
import { ContributionOverviewResponse } from "../../../types/contribution";
import Spinner from "../../../components/Layouts/LoadingLayouts/Spinner";
import {
  ArrowLeft,
  ExternalLink,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Crown,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  BookmarkPlus,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface ContributionDetailSectionProps {
  contributionId: number;
  onBack?: () => void;
  forStaff?: boolean; // staff mode
  onApprove?: () => void; // callback khi approve
  onReject?: () => void; // callback khi reject
}

const ContributionDetailSection: React.FC<ContributionDetailSectionProps> = ({
  contributionId,
  onBack,
  forStaff = false, // contributor mode
  onApprove,
  onReject,
}) => {
  const [article, setArticle] = useState<ContributionOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      if (!contributionId) return;
      setLoading(true);
      try {
        // API call based on forStaff prop
        const res = forStaff
          ? await getContributionOverviewForStaff(contributionId)
          : await getContributionOverview(contributionId);

        if (res.result) {
          setArticle(res.result);
          setError(null); 
        } else {
          setError("Không tìm thấy bài viết.");
        }
      } catch (err: any) {
        console.error("❌ Error loading contribution:", err);
        
        if (err?.response?.status === 403) {
          setError("Bạn không có quyền xem bài viết này.");
        } else if (err?.response?.status === 404) {
          setError("Bài viết không tồn tại.");
        } else {
          setError("Lỗi khi tải dữ liệu.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [contributionId, forStaff]); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size={40} thickness={5} />
          <div className="text-xl font-semibold text-gray-700 mt-4">
            Đang tải thông tin...
          </div>
          <div className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-semibold text-red-600 mb-2">{error}</div>
          {onBack && (
            <button
              onClick={onBack}
              className={`mt-4 px-6 py-2 text-white rounded-lg hover:brightness-110 transition ${
                forStaff 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700"
              }`}
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className={`min-h-screen py-6 rounded-3xl relative ${
      forStaff 
        ? "bg-white" 
        : "bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50"
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8 px-6">
          <div className="flex gap-4">
            {/* Quay lại */}
            {onBack && (
              <button
                onClick={onBack}
                className={`flex items-center px-4 py-2 rounded-xl shadow transition-all duration-200 ${
                  forStaff
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-white bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700 hover:brightness-110"
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </button>
            )}

            {/* Approve & Reject buttons - chỉ hiện khi staff và status = PENDING */}
            {forStaff && article.status === "PENDING" && (
              <>
                <button
                  onClick={onApprove}
                  className="flex items-center px-4 py-2 rounded-xl shadow transition-all duration-200 bg-green-600 text-white hover:bg-green-700"
                  title="Duyệt bài"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Duyệt bài
                </button>
                <button
                  onClick={onReject}
                  className="flex items-center px-4 py-2 rounded-xl shadow transition-all duration-200 bg-red-600 text-white hover:bg-red-700"
                  title="Từ chối"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </button>
              </>
            )}

            {/* Xem trực tiếp (chỉ hiện khi Approved) */}
            {article.status === "APPROVED" && (
              <a
                href={`/contributions/${article.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center px-4 py-2 rounded-xl shadow transition-all duration-200 ${
                  forStaff
                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Xem trực tiếp
              </a>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="px-6">
          <div className={`h-[100vh] overflow-y-auto relative scrollbar-hide px-9 ${
            forStaff ? "bg-white" : ""
          }`}>
            <ContentPreview
              title={article.title}
              cover={article.mediaUrl}
              html={article.content}
              publishedAt={article.publishedAt}
              view={article.view}
              heritageTags={article.contributionHeritageTags}
            />
          </div>
        </div>

        {/* Stats Overlay */}
        <div
          className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl p-6 z-40 overflow-y-auto transform transition-transform duration-500 ${
            showStats ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${
            forStaff ? "text-gray-900" : "text-gray-800"
          }`}>
            <BarChart3 className={`w-6 h-6 ${forStaff ? "text-blue-600" : "text-indigo-600"}`} />
            Thống kê bài viết
          </h3>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Status */}
            <div className={`p-3 rounded-lg shadow-sm flex flex-col items-center ${
              forStaff ? "bg-gray-50" : "bg-gradient-to-r from-green-50 to-green-100"
            }`}>
              {article.status === "APPROVED" ? (
                <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
              ) : article.status === "REJECTED" ? (
                <XCircle className="w-5 h-5 text-red-600 mb-1" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-600 mb-1" />
              )}
              <p className={`text-base font-bold ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                {article.status === "APPROVED"
                  ? "Đã duyệt"
                  : article.status === "REJECTED"
                  ? "Từ chối"
                  : "Chờ duyệt"}
              </p>
              <p className="text-xs text-gray-500">Trạng thái</p>
            </div>

            {/* Premium / Free */}
            <div className={`p-3 rounded-lg shadow-sm flex flex-col items-center ${
              forStaff ? "bg-gray-50" : "bg-gradient-to-r from-purple-50 to-purple-100"
            }`}>
              {article.isPremium ? (
                <Crown className={`w-5 h-5 mb-1 ${forStaff ? "text-blue-600" : "text-purple-600"}`} />
              ) : (
                <BookOpen className="w-5 h-5 text-blue-600 mb-1" />
              )}
              <p className={`text-base font-bold ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                {article.isPremium ? "Premium" : "Miễn phí"}
              </p>
              <p className="text-xs text-gray-500">Loại bài viết</p>
            </div>

            {/* Views */}
            <div className={`p-3 rounded-lg shadow-sm flex flex-col items-center ${
              forStaff ? "bg-gray-50" : "bg-gradient-to-r from-yellow-50 to-yellow-100"
            }`}>
              <Eye className={`w-5 h-5 mb-1 ${forStaff ? "text-gray-700" : "text-yellow-600"}`} />
              <p className={`text-base font-bold ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                {article.view ?? 0}
              </p>
              <p className="text-xs text-gray-500">Lượt xem</p>
            </div>

            {/* Saves */}
            <div className={`p-3 rounded-lg shadow-sm flex flex-col items-center ${
              forStaff ? "bg-gray-50" : "bg-gradient-to-r from-pink-50 to-pink-100"
            }`}>
              <BookmarkPlus className={`w-5 h-5 mb-1 ${forStaff ? "text-gray-700" : "text-pink-600"}`} />
              <p className={`text-base font-bold ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                {article.save ?? 0}
              </p>
              <p className="text-xs text-gray-500">Lượt lưu</p>
            </div>

            {/* Comments */}
            <div className={`p-3 rounded-lg shadow-sm flex flex-col items-center ${
              forStaff ? "bg-gray-50" : "bg-gradient-to-r from-indigo-50 to-indigo-100"
            }`}>
              <MessageSquare className={`w-5 h-5 mb-1 ${forStaff ? "text-gray-700" : "text-indigo-600"}`} />
              <p className={`text-base font-bold ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                {article.comments ?? 0}
              </p>
              <p className="text-xs text-gray-500">Bình luận</p>
            </div>

            {/* Reports */}
            <div className={`p-3 rounded-lg shadow-sm flex flex-col items-center ${
              forStaff ? "bg-gray-50" : "bg-gradient-to-r from-red-50 to-red-100"
            }`}>
              <XCircle className="w-5 h-5 text-red-600 mb-1" />
              <p className={`text-base font-bold ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                {article.reports ?? 0}
              </p>
              <p className="text-xs text-gray-500">Báo cáo</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className={`flex items-center gap-3 p-3 rounded-lg shadow-sm ${
              forStaff ? "bg-gray-50" : "bg-gray-50"
            }`}>
              <Calendar className={`w-5 h-5 ${forStaff ? "text-blue-600" : "text-indigo-600"}`} />
              <div>
                <p className="text-xs text-gray-500">Ngày nộp</p>
                <p className={`font-semibold ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                  {article.createdAt
                    ? new Date(article.createdAt).toLocaleDateString("vi-VN")
                    : "Chưa rõ"}
                </p>
              </div>
            </div>
            {article.status === "APPROVED" && (
              <div className={`flex items-center gap-3 p-3 rounded-lg shadow-sm ${
                forStaff ? "bg-gray-50" : "bg-gray-50"
              }`}>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Ngày duyệt</p>
                  <p className={`font-semibold ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("vi-VN")
                      : "Chưa duyệt"}
                  </p>
                </div>
              </div>
            )}
           {article.status === "REJECTED" && article.note && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg shadow-sm border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 mt-1" />
                <div>
                  <p className="text-xs text-red-500 font-semibold uppercase mb-1">
                    Lý do từ chối
                  </p>
                  <p className={`text-sm whitespace-pre-line ${forStaff ? "text-gray-900" : "text-gray-800"}`}>
                    {article.note}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="h-64 flex items-center justify-center">
            {!article.monthlyViews || article.monthlyViews.length <= 1 ? (
              <p className="text-gray-500 text-sm italic">
                Không đủ dữ liệu để hiển thị biểu đồ
              </p>
            ) : (
              <ResponsiveContainer>
                <BarChart
                  data={article.monthlyViews.map((m) => ({
                    month: `${m.month}/${m.year}`,
                    views: m.views,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="views" 
                    fill={forStaff ? "#2563eb" : "#f97316"} 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Toggle Stats Button */}
        <div
          className={`fixed right-0 z-50 cursor-pointer 
                      px-4 py-2 rounded-l-lg shadow-lg 
                      hover:scale-105 transition-transform duration-200 flex items-center gap-2
                      ${showStats ? "top-6" : "top-40"}
                      ${
                        forStaff
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700 text-white"
                      }`}
          onClick={() => setShowStats(!showStats)}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-semibold">Thống kê</span>
          {showStats ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributionDetailSection;