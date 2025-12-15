import React from "react";
import PortalModal from "../Layouts/ModalLayouts/PortalModal";
import { Review, ReviewMedia } from "../../types/review";
import { Play, ThumbsUp, MoreHorizontal } from "lucide-react";
import { toggleLikeReview } from "../../services/reviewService";
import { updateReview, deleteReview } from "../../services/reviewService";
import ReviewItem from "./ReviewItem"
interface Props {
  open: boolean;
  onClose: () => void;
  reviews: Review[];
  onSubmitReview?: (payload: { comment: string; media?: { file: File; type: string }[] }) => void | Promise<void>;
  onReply?: (payload: { parentReviewId: number; comment: string; media?: { file: File; type: string }[] }) => void | Promise<void>;
  onDeleteReview?: (reviewId: number) => void;
  onEditReview?: (reviewId: number, comment: string, media?: { file: File; type: string }[]) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
  isLoggedIn: boolean;
}

const detectMediaType = (file: File): "IMAGE" | "VIDEO" | "DOCUMENT" => {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type === "application/pdf") return "DOCUMENT";
  return "DOCUMENT";
};



const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({ src, name, size = 36 }) =>
  src ? (
    <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full bg-gray-200 flex items-center justify-center text-gray-600" style={{ width: size, height: size }}>
      {name?.[0]?.toUpperCase() || "U"}
    </div>
  );

const isVideo = (m: ReviewMedia) => m.mediaType?.toUpperCase() === "VIDEO";

const Img: React.FC<{ src: string; alt?: string; className?: string }> = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={`w-full h-full object-cover ${className || ""}`} loading="lazy" />
);

const updateReviewInTree = (
  reviews: Review[],
  reviewId: number,
  updater: (r: Review) => Review
): Review[] =>
  reviews.map(r => {
    if (r.id === reviewId) return updater(r);
    if (r.replies && r.replies.length > 0) {
      return { ...r, replies: updateReviewInTree(r.replies, reviewId, updater) };
    }
    return r;
  });

const deleteReviewInTree = (reviews: Review[], reviewId: number): Review[] =>
  reviews
    .filter(r => r.id !== reviewId)
    .map(r => ({
      ...r,
      replies: r.replies ? deleteReviewInTree(r.replies, reviewId) : [],
    }));

const VidThumb: React.FC<{ src: string }> = ({ src }) => (
  <div className="relative w-full h-full bg-black/80 flex items-center justify-center rounded-lg overflow-hidden">
    <Play className="w-8 h-8 text-white" />
    <video className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" src={src} />
  </div>
);

const Cell: React.FC<{ m: ReviewMedia; rounded?: string }> = ({ m, rounded }) => {
  const base = `overflow-hidden ${rounded || "rounded-lg"} border`;
  if (isVideo(m)) {
    return (
      <div className={`${base} aspect-video bg-black`}>
        <VidThumb src={m.url} />
      </div>
    );
  }
  return (
    <div className={`${base}`}>
      <Img src={m.url} className="max-h-80" />
    </div>
  );
};

const OverlayMore: React.FC<{ count: number }> = ({ count }) => (
  <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-xl font-semibold rounded-lg">
    +{count}
  </div>
);

const ReviewMediaList: React.FC<{ medias?: ReviewMedia[] }> = ({ medias }) => {
  if (!medias || medias.length === 0) return null;

  const items = medias.slice(0, 5);
  const more = medias.length - items.length;

  if (items.length === 1) {
    return (
      <div className="mt-2">
        {isVideo(items[0]) ? (
          <div className="rounded-xl overflow-hidden border aspect-video">
            <VidThumb src={items[0].url} />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border max-h-[420px]">
            <img src={items[0].url} className="w-full h-auto object-contain" />
          </div>
        )}
      </div>
    );
  }

  if (items.length === 2) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {items.map((m) => (
          <Cell key={m.id} m={m} />
        ))}
      </div>
    );
  }

  if (items.length === 3) {
    return (
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <div className={isVideo(items[0]) ? "aspect-video" : "max-h-[360px]"}>
            <Cell m={items[0]} rounded="rounded-xl" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Cell m={items[1]} />
          <Cell m={items[2]} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {items.slice(0, 4).map((m, idx) => (
        <div key={m.id} className="relative">
          <Cell m={m} />
          {more > 0 && idx === 3 && <OverlayMore count={more} />}
        </div>
      ))}
    </div>
  );
};

// const ReviewItem: React.FC<{
//   review: Review;
//   depth?: number;
//   expanded: Record<number, boolean>;
//   onToggleReplies: (id: number) => void;
//   onReplyClick: (review: Review) => void;
//   onLikeToggle?: (id: number) => void;
//   onEditSubmit?: (id: number, comment: string) => void;
//   onDelete?: (id: number) => void;
//   currentUserName?: string;
//   isLoggedIn: boolean;
// }> = ({
//   review,
//   depth = 0,
//   expanded,
//   onToggleReplies,
//   onReplyClick,
//   onLikeToggle,
//   onEditSubmit,
//   onDelete,
//   currentUserName,
//   isLoggedIn,
// }) => {
//   const [isEditing, setIsEditing] = React.useState(false);
//   const [editComment, setEditComment] = React.useState(review.comment);
//   const [showMenu, setShowMenu] = React.useState(false);
//   const menuRef = React.useRef<HTMLDivElement>(null);

//   const repliesCount = review.replies?.length || 0;
//   const isOpen = expanded[review.id];

//   React.useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setShowMenu(false);
//       }
//     };

//     if (showMenu) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showMenu]);

//   return (
//     <div className={`flex gap-3 ${depth ? "mt-2" : ""}`}>
//       <Avatar src={review.userImageUrl} name={review.username} size={34} />
//       <div className="flex-1 min-w-0">
//         <div className="flex items-start gap-2">
//           <div className="inline-block bg-gray-100 rounded-2xl p-3 min-w-0 flex-1">
//             <div className="flex items-center justify-between">
//               <span className="font-medium text-gray-900">{review.username}</span>
//               <span className="text-xs text-gray-500">{timeAgoVi(review.createdAt)}</span>
//             </div>

//             {isEditing ? (
//               <div className="space-y-2">
//                 <textarea
//                   className="w-full border rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600/30"
//                   rows={3}
//                   value={editComment}
//                   onChange={(e) => setEditComment(e.target.value)}
//                 />
//                 <div className="flex gap-2">
//                   <button
//                     className="text-sm px-3 py-1.5 rounded-lg text-white bg-yellow-700 hover:bg-yellow-800"
//                     onClick={() => {
//                       if (editComment.trim()) {
//                         onEditSubmit?.(review.id, editComment.trim());
//                         setIsEditing(false);
//                       }
//                     }}
//                   >
//                     Lưu
//                   </button>
//                   <button
//                     className="text-sm px-3 py-1.5 rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300"
//                     onClick={() => {
//                       setIsEditing(false);
//                       setEditComment(review.comment);
//                     }}
//                   >
//                     Huỷ
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-gray-800 text-sm whitespace-pre-wrap break-words">{review.comment}</div>
//             )}
//           </div>

//           {review.createdByMe && !isEditing && (
//             <div className="relative flex-shrink-0 self-center" ref={menuRef}>
//               <button
//                 className="text-gray-500 hover:text-gray-700 p-1"
//                 onClick={() => setShowMenu(!showMenu)}
//                 title="Tùy chọn"
//               >
//                 <MoreHorizontal className="w-4 h-4" />
//               </button>
//               {showMenu && (
//                 <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
//                   <button
//                     className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     onClick={() => {
//                       setIsEditing(true);
//                       setShowMenu(false);
//                     }}
//                   >
//                     Chỉnh sửa
//                   </button>
//                   <button
//                     className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                     onClick={async () => {
//                       setShowMenu(false);
//                       if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
//                       if (onDelete) await onDelete(review.id);
//                     }}
//                   >
//                     Xóa
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {review.reviewMedias && review.reviewMedias.length > 0 && (
//           <div className="mt-2 md:max-w-[60%]">
//             <ReviewMediaList medias={review.reviewMedias} />
//           </div>
//         )}

//         <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
//           {/* <span>{timeAgoVi(review.createdAt)}</span> */}
//           {isLoggedIn && (
//             <button className="hover:underline" onClick={() => onReplyClick(review)}>
//               Trả lời
//             </button>
//           )}
//           <button
//             className={`inline-flex items-center gap-1 hover:underline ${
//               review.likedByMe ? "text-yellow-700" : ""
//             } ${!isLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
//             onClick={() => isLoggedIn && onLikeToggle?.(review.id)}
//             title={!isLoggedIn ? "Đăng nhập để thích" : review.likedByMe ? "Bỏ thích" : "Thích"}
//             disabled={!isLoggedIn}
//           >
//             <ThumbsUp className="w-3.5 h-3.5" />
//             <span>{review.likes ?? 0}</span>
//           </button>
//           {review.isUpdated && (
//             <span className="text-gray-400">Đã chỉnh sửa</span>
//           )}
//         </div>

//         {repliesCount > 0 && (
//           <button
//             className="mt-2 text-xs text-yellow-700 hover:underline"
//             onClick={() => onToggleReplies(review.id)}
//           >
//             {isOpen ? "Ẩn bình luận" : `Xem ${repliesCount} bình luận`}
//           </button>
//         )}

//         {isOpen &&
//           review.replies?.map((r) => (
//             <ReviewItem
//               key={r.id}
//               review={r}
//               depth={depth + 1}
//               expanded={expanded}
//               onToggleReplies={onToggleReplies}
//               onReplyClick={onReplyClick}
//               onLikeToggle={onLikeToggle}
//               onEditSubmit={onEditSubmit}
//               onDelete={onDelete}
//               currentUserName={currentUserName}
//               isLoggedIn={isLoggedIn}
//             />
//           ))}
//       </div>
//     </div>
//   );
// };

type MediaKind = "IMAGE" | "VIDEO";
type MediaDraft = { file: File; url: string; kind: MediaKind };

const ReviewComposer: React.FC<{
  placeholder?: string;
  initialComment?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  submitLabel?: string;
  onSubmit: (data: { comment: string; media?: { file: File; type: "IMAGE" | "VIDEO" | "DOCUMENT" }[] }) => void | Promise<void>;
}> = ({ placeholder = "Viết cảm nhận của bạn…", currentUserName, currentUserAvatar, submitLabel = "Đăng", initialComment = "", onSubmit }) => {
  const [comment, setComment] = React.useState(initialComment);
  const [files, setFiles] = React.useState<MediaDraft[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    const drafts = list.map<MediaDraft>((f) => {
      const kind: MediaKind = f.type.startsWith("video") ? "VIDEO" : "IMAGE";
      return { file: f, url: URL.createObjectURL(f), kind };
    });
    setFiles((prev) => [...prev, ...drafts]);
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].url);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const submit = async () => {
    if (!comment.trim() && files.length === 0) return;
    setLoading(true);
    try {
      await onSubmit({
        comment: comment.trim(),
        media: files.map((f) => ({ file: f.file, type: detectMediaType(f.file) })),
      });

      setComment("");
      files.forEach((f) => URL.revokeObjectURL(f.url));
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar src={currentUserAvatar} name={currentUserName || "Bạn"} />
      <div className="flex-1">
        <textarea
          className="w-full border rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600/30"
          rows={3}
          placeholder={placeholder}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {files.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative">
                {f.kind === "IMAGE" ? (
                  <img src={f.url} alt="Review media" className="w-full h-24 object-cover rounded-lg border" />
                ) : (
                  <video src={f.url} className="w-full h-24 object-cover rounded-lg border" />
                )}
                <button
                  className="absolute -top-2 -right-2 bg-black/60 text-white rounded-full w-6 h-6"
                  onClick={() => removeFile(i)}
                  title="Xoá"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <label className="text-sm px-2 py-1 rounded-lg border cursor-pointer hover:bg-gray-50">
            Tải ảnh/video
            <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={pickFiles} />
          </label>
          <button
            onClick={submit}
            disabled={loading || (!comment.trim() && files.length === 0)}
            className={`text-sm px-3 py-1.5 rounded-lg text-white ${loading ? "bg-gray-300" : "bg-yellow-700 hover:bg-yellow-800"}`}
          >
            {loading ? "Đang đăng…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewThreadModal: React.FC<Props> = ({
  open,
  onClose,
  reviews,
  onSubmitReview,
  onReply,
  currentUserName,
  currentUserAvatar,
  onDeleteReview,
  onEditReview,
  isLoggedIn,
}) => {
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const [replyingTo, setReplyingTo] = React.useState<Review | null>(null);
  const [localReviews, setLocalReviews] = React.useState<Review[]>(reviews);

  React.useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const handleDelete = async (reviewId: number) => {
    const previous = [...localReviews];
    setLocalReviews(prev => deleteReviewInTree(prev, reviewId));

    try {
      await onDeleteReview?.(reviewId);
    } catch (err) {
      setLocalReviews(previous);
      console.error("delete failed propagated from parent", err);
    }
  };

  const handleEditReview = async (
    reviewId: number,
    comment: string,
    media?: { file: File; type: string }[]
  ) => {
    try {
      const res = await updateReview({ id: reviewId, comment, media });
      const updated = res.result;

      if (updated) {
        setLocalReviews(prev =>
          updateReviewInTree(prev, reviewId, r => ({
            ...r,
            comment: updated.comment,
            reviewMedias: updated.reviewMedias ?? r.reviewMedias,
            isUpdated: true,
          }))
        );

        onEditReview?.(reviewId, comment, media);
      }
    } catch (err) {
      console.error("Failed to update review", err);
    }
  };

  const handleLikeToggle = async (reviewId: number) => {
    let currentlyLiked = false;
    let currentlyLikes = 0;

    const updatedReviews = updateReviewInTree(localReviews, reviewId, (r) => {
      currentlyLiked = r.likedByMe ?? false;
      currentlyLikes = r.likes ?? 0;
      return {
        ...r,
        likedByMe: !currentlyLiked,
        likes: currentlyLiked ? Math.max(0, currentlyLikes - 1) : currentlyLikes + 1,
      };
    });
    setLocalReviews(updatedReviews);

    try {
      const res = await toggleLikeReview({ reviewId, like: !currentlyLiked });
      const { likeCount, likedByMe } = res.result || {};
      const updatedReviewsFromServer = updateReviewInTree(localReviews, reviewId, (r) => ({
        ...r,
        likedByMe,
        likes: likeCount,
      }));
      setLocalReviews(updatedReviewsFromServer);
    } catch {
      const rollbackReviews = updateReviewInTree(localReviews, reviewId, (r) => ({
        ...r,
        likedByMe: currentlyLiked,
        likes: currentlyLikes,
      }));
      setLocalReviews(rollbackReviews);
    }
  };

  const toggleReplies = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="md"
      maxWidth="min(90vw, 700px)"
      maxHeight="90vh"
      fullScreenOnMobile
      contentClassName="bg-white rounded-2xl p-0 overflow-hidden"
    >
      <div className="flex flex-col h-full max-h-[90vh]">
        <div className="flex-shrink-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Bình luận & đánh giá</div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

       <div className="flex-1 overflow-y-auto px-4 py-3">
  {localReviews.length === 0 ? (
    <div className="h-full flex items-center justify-center text-center text-sm text-gray-600">
      <div>
        <p>Chưa có bình luận nào.</p>
        {!isLoggedIn && (
          <p className="mt-2 text-yellow-700">Đăng nhập để viết bình luận</p>
        )}
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      {localReviews.map((rv) => (
        <div key={rv.id} className="pb-2 border-b last:border-b-0">
          <ReviewItem
            review={rv}
            expanded={expanded}
            onToggleReplies={toggleReplies}
            onReplyClick={(r) => {
              setExpanded((prev) => ({ ...prev, [r.id]: true }));
              setReplyingTo(r);
            }}
            onLikeToggle={handleLikeToggle}
            onEditSubmit={handleEditReview}
            onDelete={handleDelete}
            currentUserName={currentUserName}
            isLoggedIn={isLoggedIn}
            variant="full"
          />
        </div>
      ))}
    </div>
  )}
</div>


        {isLoggedIn && (
          <div className="flex-shrink-0 bg-white border-t px-4 py-4 space-y-2">
            {replyingTo ? (
              <div className="text-xs text-gray-600">
                Đang trả lời <span className="font-medium">@{replyingTo.username}</span>
                <button className="ml-2 text-yellow-700 hover:underline" onClick={() => setReplyingTo(null)}>
                  Hủy
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-500">Viết bình luận về di sản</div>
            )}

            <ReviewComposer
              placeholder={replyingTo ? "Viết phản hồi…" : "Chia sẻ cảm nhận của bạn…"}
              onSubmit={async ({ comment, media }) => {
                if (replyingTo) {
                  await onReply?.({
                    parentReviewId: replyingTo.id,
                    comment,
                    media: media?.map((f) => ({ file: f.file, type: detectMediaType(f.file) })),
                  });
                  setReplyingTo(null);
                } else {
                  await onSubmitReview?.({
                    comment,
                    media: media?.map((f) => ({ file: f.file, type: detectMediaType(f.file) })),
                  });
                }
              }}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              submitLabel={replyingTo ? "Trả lời" : "Đăng đánh giá"}
            />
          </div>
        )}
      </div>
    </PortalModal>
  );
};

export default ReviewThreadModal;