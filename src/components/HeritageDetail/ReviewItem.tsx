import React from "react";
import { Review, ReviewMedia } from "../../types/review";
import { Play, ThumbsUp, MoreHorizontal } from "lucide-react";
import ConfirmModal from "../Layouts/ModalLayouts/ConfirmModal"
// Hàm format thời gian
const timeAgoVi = (iso: string) => {
  // ép chuỗi về UTC (thêm Z nếu thiếu)
  const safeIso = iso.endsWith("Z") ? iso : iso + "Z";
  const date = new Date(safeIso);

  // Giờ hiện tại ở VN
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  console.log("ISO từ server:", iso);
  console.log("Đã ép UTC parse:", date.toString());

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 30) return `${diffDay} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};




// Avatar
const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({ src, name, size = 36 }) =>
  src ? (
    <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <div
      className="rounded-full bg-gray-200 flex items-center justify-center text-gray-600"
      style={{ width: size, height: size }}
    >
      {name?.[0]?.toUpperCase() || "U"}
    </div>
  );

// Media helpers
const isVideo = (m: ReviewMedia) => m.mediaType?.toUpperCase() === "VIDEO";

const VidThumb: React.FC<{ src: string }> = ({ src }) => (
  <div className="relative w-full h-full bg-black/80 flex items-center justify-center rounded-lg overflow-hidden">
    <Play className="w-8 h-8 text-white" />
    <video className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" src={src} />
  </div>
);

const ReviewMediaList: React.FC<{ medias?: ReviewMedia[] }> = ({ medias }) => {
  if (!medias || medias.length === 0) return null;

  return (
    <div className="mt-2 md:max-w-[60%] flex gap-2 flex-wrap">
      {medias.map((m) =>
        isVideo(m) ? (
          <div key={m.id} className="w-32 aspect-video rounded-lg overflow-hidden border">
            <VidThumb src={m.url} />
          </div>
        ) : (
          <img
            key={m.id}
            src={m.url}
            alt="media"
            className="w-24 h-24 object-cover rounded-lg border"
          />
        )
      )}
    </div>
  );
};

interface ReviewItemProps {
  review: Review;
  depth?: number;
  expanded: Record<number, boolean>;
  onToggleReplies?: (id: number) => void;
  onReplyClick?: (review: Review) => void;
  onLikeToggle?: (id: number) => void;
  onEditSubmit?: (id: number, comment: string) => void;
  onDelete?: (id: number) => void;
  currentUserName?: string;
  isLoggedIn: boolean;
  variant?: "full" | "compact";
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  depth = 0,
  expanded,
  onToggleReplies,
  onReplyClick,
  onLikeToggle,
  onEditSubmit,
  onDelete,
  isLoggedIn,
  variant = "full",
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editComment, setEditComment] = React.useState(review.comment);
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const repliesCount = review.replies?.length || 0;
  const isOpen = expanded[review.id];

  // đóng menu khi click ngoài
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div className={`flex gap-3 ${depth ? "mt-2" : ""}`}>
      <Avatar src={review.userImageUrl} name={review.username} size={34} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {/* Khung comment */}
          <div className="inline-block bg-gray-100 rounded-2xl p-3 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{review.username}</span>
              <span className="text-xs text-gray-500">{timeAgoVi(review.createdAt)}</span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  className="w-full border rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600/30"
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="text-sm px-3 py-1.5 rounded-lg text-white bg-yellow-700 hover:bg-yellow-800"
                    onClick={() => {
                      if (editComment.trim()) {
                        onEditSubmit?.(review.id, editComment.trim());
                        setIsEditing(false);
                      }
                    }}
                  >
                    Lưu
                  </button>
                  <button
                    className="text-sm px-3 py-1.5 rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300"
                    onClick={() => {
                      setIsEditing(false);
                      setEditComment(review.comment);
                    }}
                  >
                    Huỷ
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-800 text-sm whitespace-pre-wrap break-words">
                {review.comment}
              </div>
            )}
          </div>
  <div className="relative flex-shrink-0 self-center w-6">
          {/* Menu 3 chấm chỉ hiện ở chế độ full */}
          {variant === "full" && review.createdByMe && !isEditing && (
            <div className="relative flex-shrink-0 self-center" ref={menuRef}>
              <button
                className="text-gray-500 hover:text-gray-700 p-1"
                onClick={() => setShowMenu(!showMenu)}
                title="Tùy chọn"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                     onClick={() => {
                  setShowMenu(false);
                  setShowDeleteModal(true); 
                }}
              >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        

        {/* Media */}
        {review.reviewMedias && review.reviewMedias.length > 0 && (
          <ReviewMediaList medias={review.reviewMedias} />
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
          {variant === "full" && isLoggedIn && onReplyClick && (
            <button className="hover:underline" onClick={() => onReplyClick(review)}>
              Trả lời
            </button>
          )}

          <button
            className={`inline-flex items-center gap-1 hover:underline ${
              review.likedByMe ? "text-yellow-700" : ""
            } ${!isLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={() => isLoggedIn && onLikeToggle?.(review.id)}
            disabled={!isLoggedIn}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{review.likes ?? 0}</span>
          </button>

          {review.isUpdated && <span className="text-gray-400">Đã chỉnh sửa</span>}
        </div>

        {/* Replies chỉ hiện ở chế độ full */}
        {variant === "full" && repliesCount > 0 && (
          <button
            className="mt-2 text-xs text-yellow-700 hover:underline"
            onClick={() => onToggleReplies?.(review.id)}
          >
            {isOpen ? "Ẩn bình luận" : `Xem ${repliesCount} bình luận`}
          </button>
        )}

        {variant === "full" && isOpen &&
          review.replies?.map((r) => (
            <ReviewItem
              key={r.id}
              review={r}
              depth={depth + 1}
              expanded={expanded}
              onToggleReplies={onToggleReplies}
              onReplyClick={onReplyClick}
              onLikeToggle={onLikeToggle}
              onEditSubmit={onEditSubmit}
              onDelete={onDelete}
              isLoggedIn={isLoggedIn}
              variant="full"
            />
          ))}
      </div>

       {/* Modal xác nhận xoá */}
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (onDelete) await onDelete(review.id);
        }}
        title="Xác nhận xoá bình luận"
        message="Bạn có chắc chắn muốn xoá bình luận này? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default ReviewItem;
