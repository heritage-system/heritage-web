// components/ContentPreview.tsx
import React, { useState } from "react";
import { htmlFromDeltaWithImgAlign,toHtml } from "../../utils/deltaUtils";
import { HeritageName } from "../../types/heritage";
import { SubscriptionDto } from "../../types/subscription";
import { Eye, Calendar, Tag, Coins, Ticket, HelpCircle } from "lucide-react";
import { useReadingTracker } from "../../hooks/useReadingTracker";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../Layouts/ModalLayouts/ConfirmModal"
interface ContributionContentProps {
  contributionId: number;
  title: string;
  cover?: string | null;
  delta?: any;
  html?: string | null;
  publishedAt?: string | null;
  view?: number | null;
  contentPreview?: string | null; // nội dung rút gọn khi locked
  heritageTags?: HeritageName[];
  subscription?: SubscriptionDto;
  onUnlock: () => void;
  onUnlockWithPoints: () => void;
  isAuthenticated?: boolean;
  userPoints: number;
  isUnSubscriptionLock: boolean;
  unlockLoading: boolean;
}

const ContributionContent: React.FC<ContributionContentProps> = ({
  contributionId,
  title,
  cover,
  delta,
  html,
  publishedAt,
  view,
  contentPreview,
  heritageTags = [],
  subscription,
  onUnlock,
  onUnlockWithPoints,
  isAuthenticated,
  userPoints,
  isUnSubscriptionLock,
  unlockLoading
}) => {

  useReadingTracker( contributionId ?? 0, !!html);

  const navigate = useNavigate();
  const [usePoints, setUsePoints] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"points" | "subscription" | null>(null);
  // fallback
  const viewsCount = view ?? 0;
  const displayDate = publishedAt
  ? new Date(publishedAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  : new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const triggerConfirm = (type: "points" | "subscription") => {
    setConfirmAction(type);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;

    if (confirmAction === "points") {
      onUnlockWithPoints();
    } else {
      onUnlock();
    }

    setConfirmOpen(false);
  };


  return (
    <div className="space-y-2">
      {/* Cover Image */}
      <div className="relative">
        {cover && (
          <img
            src={cover}
            alt="cover"
            className="w-full h-64 sm:h-80 object-cover border-t-4  rounded-tl-2xl rounded-tr-2xl"
          />
        )}
      </div>


      {/* Article Header */}
      <div className="p-6 border-b border-gray-200">
        {/* Heritage Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {heritageTags.map((heritage, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-700 to-red-700 text-white"
            >
              <Tag className="w-3 h-3 mr-1" />
              {heritage.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {title || "(Chưa có tiêu đề)"}
        </h1>

        {/* Meta Info */}
        {publishedAt != null && view != null && ( <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{displayDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>{viewsCount} lượt xem</span>
          </div>
        </div>)}
      </div>

      {/* Article Content */}
      <div className="relative p-6">
        {/* Case 1: html có → detail */}
        {html && (
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
              prose-headings:mt-0 prose-p:mt-0 prose-img:mt-0 prose-figure:mt-0"
            dangerouslySetInnerHTML={{
              __html: toHtml(html),
            }}
          />
        )}

        {/* Case 2: dùng delta → preview */}
        {!html && delta && (
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
              prose-headings:mt-0 prose-p:mt-0 prose-img:mt-0 prose-figure:mt-0"
            dangerouslySetInnerHTML={{
              __html: htmlFromDeltaWithImgAlign(delta.ops),
            }}
          />
        )}

        {/* Case 3: html = null, có contentPreview → locked content */}
        {!html && !delta && contentPreview && (
          <div className="relative">
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
                prose-headings:mt-0 prose-p:mt-0 prose-img:mt-0 prose-figure:mt-0"
              dangerouslySetInnerHTML={{
                __html: toHtml(contentPreview),
              }}
            />

            {/* overlay che phần dưới */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col items-center justify-end gap-3 pb-6">
              {/* Case 1: Chưa đăng nhập */}
              {!isAuthenticated && (
                <button 
                  onClick={() => navigate("/premium-packages")} 
                  className="bg-gradient-to-r from-yellow-700 to-red-700 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-lg animate-bounce"
                >
                  ⭐ Nâng cấp Premium để đọc tiếp
                </button>
              )}

            {/* Case 2: Đã đăng nhập nhưng không có subscription */}
{isAuthenticated && !subscription && (
  <>
    {/* Tooltip + điểm hiện có */}
    <div className="flex items-center justify-center gap-2 mb-4">
      <span 
        title="Bạn có thể mở bài bằng lượt Premium hoặc dùng điểm Linh Hội."
        className="inline-flex"
      >
        <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
      </span>

      {usePoints ? (
        <p className="text-sm text-gray-600">
          Điểm Linh Hội hiện có:{" "}
          <span
            className={`font-semibold ${
              userPoints < 60 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {userPoints?.toLocaleString() ?? "---"}
          </span>
        </p>
      ) : (
        <p className="text-sm text-gray-600">
         Bạn chưa phải hội viên      
        </p>
      )}
    </div>

    {/* Nút mở + nút đổi chế độ */}
    <div className="flex items-center justify-center gap-3 animate-bounce">
      {/* BUTTON CHÍNH */}
      <button
        disabled={unlockLoading || (usePoints && userPoints < 60)}
        onClick={() => {
          if (usePoints) {
            triggerConfirm("points");
          } else {
            navigate("/premium-packages");
          }
        }}
        className={`px-8 py-3 rounded-full shadow-lg text-lg font-semibold transition flex items-center gap-2
          ${
            usePoints
              ? userPoints < 60
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-700 to-emerald-700 text-white hover:brightness-110"
              : "bg-gradient-to-r from-yellow-700 to-red-700 text-white hover:brightness-110"
          }
        `}
      >
         {unlockLoading
            ? "Đang mở..."
          :usePoints
          ? userPoints < 60
            ? "Cần 60 điểm Linh Hội để mở"
            : "Mở bằng 60 điểm Linh Hội" 
            : "Đăng ký gói hội viên ngay"}
      </button>

      {/* NÚT ĐỔI CHẾ ĐỘ */}
      <button
        onClick={() => setUsePoints(!usePoints)}
        disabled={unlockLoading}
        title={
          usePoints
            ? "Chuyển sang mở bằng lượt Premium"
            : "Chuyển sang mở bằng điểm Linh Hội"
        }
        className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 shadow transition cursor-pointer"
      >
        {usePoints ? (
          <Ticket className="w-5 h-5 text-yellow-700" />
        ) : (
          <Coins className="w-5 h-5 text-yellow-700" />
        )}
      </button>
    </div>

    {isUnSubscriptionLock ? (
      <p className="text-sm text-gray-600">
         Bạn đã mở bài viết bằng lượt từ trước. Muốn mở vĩnh viễn bằng điểm Linh Hội không?      
      </p>
    ) : (
      <>
        {usePoints ? (
            <p className="text-sm text-gray-600">
              Dùng điểm Linh Hội có thể mở khóa vĩnh viễn nội dung
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Dùng lượt mở cho phép truy cập trong thời gian gói hội viên
            </p>
          )}
      </>
    )}
  </>
)}
{/* Case 3: Có subscription */}
{isAuthenticated && subscription && (
  <>
    {/* Ghi chú + text phụ */}
    <div className="flex items-center justify-center gap-2 mb-2">
     <span 
      title="Bạn có thể mở bài bằng lượt Premium hoặc dùng điểm Linh Hội."
      className="inline-flex"
    >
      <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
    </span>

      {usePoints ? (
        <p className="text-sm text-gray-600">
          Điểm Linh Hội hiện có:{" "}
          <span
            className={`font-semibold ${
              userPoints < 60 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {userPoints?.toLocaleString() ?? "---"}
          </span>
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          Lượt mở hiện tại:{" "}
          <span
            className={`font-semibold ${
              subscription.total !== 0 &&
              subscription.used >= subscription.total
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {subscription.isUnlimited? "∞" : subscription.used}/
            {subscription.isUnlimited ? "∞" : subscription.total}
          </span>
        </p>

      )}
    </div>

    {/* Nút mở + nút đổi chế độ */}
    <div className="flex items-center justify-center gap-3 animate-bounce">
      {/* BUTTON CHÍNH */}
      <button
        disabled={
          unlockLoading ||
          (!usePoints && !subscription.isUnlimited && subscription.used >= subscription.total) ||
          (usePoints && userPoints < 60)
        }

        onClick={() => {
          if (usePoints) triggerConfirm("points");
          else triggerConfirm("subscription");
        }}

        className={`px-8 py-3 rounded-full shadow-lg text-lg font-semibold transition flex items-center gap-2
          ${
            usePoints
              ? userPoints < 60
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-700 to-emerald-700 text-white hover:brightness-110"
              : subscription.used >= subscription.total && !subscription.isUnlimited
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-700 to-red-700 text-white hover:brightness-110"
          }
        `}
      >
        {unlockLoading
          ? "Đang mở..."
          : usePoints
            ? userPoints < 60
              ? "Cần 60 điểm Linh Hội để mở"
              : "Mở bằng 60 điểm Linh Hội"
            : subscription?.used >= subscription?.total && !subscription.isUnlimited
              ? "Bạn đã dùng hết lượt"
              : "Mở khóa bài viết bằng lượt"}

      </button>

      {/* NÚT ĐỔI CHẾ ĐỘ */}
      <button
        onClick={() => setUsePoints(!usePoints)}
        disabled={unlockLoading}
        title={
          usePoints
            ? "Chuyển sang mở bằng lượt Premium"
            : "Chuyển sang mở bằng điểm Linh Hội"
        }
        className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 shadow transition cursor-pointer"
      >
        {usePoints ? (
          <Ticket className="w-5 h-5 text-yellow-700" />
        ) : (
          <Coins className="w-5 h-5 text-yellow-700" />
        )}
      </button>
    </div>

    {usePoints ? (
      <p className="text-sm text-gray-600">
        Dùng điểm Linh Hội có thể mở khóa vĩnh viễn nội dung
      </p>
    ) : (
      <p className="text-sm text-gray-600">
        Dùng lượt mở cho phép truy cập trong thời gian gói hội viên
      </p>
    )}
  </>
)}

            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Xác nhận mở khóa"
        message={
          confirmAction === "points"
            ? "Bạn có chắc muốn dùng 60 điểm Linh Hội để mở khóa vĩnh viễn nội dung này không?"
            : "Bạn có chắc muốn dùng 1 lượt hội viên để mở khóa nội dung này không?"
        }
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={unlockLoading}
      />

    </div>
  );
};

export default ContributionContent;