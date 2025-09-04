import React from "react";
import PortalModal from "../Layouts/PortalModal";
import { Review, ReviewMedia } from "../../types/review";
import { Play, ThumbsUp } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;

  reviews: Review[];
  onSubmitReview?: (payload: {
    rating: number;
    comment: string;
    media?: File[];
  }) => Promise<void> | void;

  onReply?: (payload: {
    parentReviewId: number;
    comment: string;
    media?: File[];
  }) => Promise<void> | void;

  currentUserName?: string;
  currentUserAvatar?: string;
}

const timeVi = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });



const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({ src, name, size = 36 }) =>
  src ? (
    <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full bg-gray-200 flex items-center justify-center text-gray-600" style={{ width: size, height: size }}>
      {name?.[0]?.toUpperCase() || "U"}
    </div>
  );

/** Hiển thị media cho 1 comment (ảnh dạng lưới; video là thẻ <video> nếu file trực tiếp, còn link thì nút mở tab) */
const isVideo = (m: ReviewMedia) => m.mediaType?.toUpperCase() === "VIDEO";

const Img: React.FC<{ src: string; alt?: string; className?: string }> = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={`w-full h-full object-cover ${className || ""}`} loading="lazy" />
);

const VidThumb: React.FC<{ src: string }> = ({ src }) => (
  <div className="relative w-full h-full bg-black/80 flex items-center justify-center rounded-lg overflow-hidden">
    <Play className="w-8 h-8 text-white" />
    {/* Có thể dùng <video poster="..."> nếu có thumbnail thật */}
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

  // 1 ảnh/video
  if (items.length === 1) {
    return (
      <div className="mt-2">
        {isVideo(items[0]) ? (
          <div className="rounded-xl overflow-hidden border aspect-video">
            <VidThumb src={items[0].url} />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border max-h-[420px]">
            {/* object-contain cho ảnh đơn */}
            <img src={items[0].url} className="w-full h-auto object-contain" />
          </div>
        )}
      </div>
    );
  }

  // 2 ảnh/video: 2 cột bằng nhau
  if (items.length === 2) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {items.map((m) => (
          <Cell key={m.id} m={m} />
        ))}
      </div>
    );
  }

  // 3 ảnh/video: 1 lớn + 2 nhỏ
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

  // 4 hoặc 5+: lưới 2×2, ô cuối overlay +N
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

const ReviewItem: React.FC<{
  review: Review;
  depth?: number;
  expanded: Record<number, boolean>;
  onToggleReplies: (id: number) => void;
  onReplyClick: (review: Review) => void;
  onLikeToggle?: (id: number) => void;        // <-- mới
  likedByMe?: boolean;                         // <-- mới
  likeCount?: number;                          // <-- mới
}> = ({
  review,
  depth = 0,
  expanded,
  onToggleReplies,
  onReplyClick,
  onLikeToggle,
  likedByMe,
  likeCount,
}) => {
  const repliesCount = review.replies?.length || 0;
  const isOpen = expanded[review.id];

return (
  <div className={`flex gap-3 ${depth ? "mt-2" : ""}`}>
    <Avatar src={review.userImageUrl} name={review.username} size={34} />
    <div className="flex-1">
      {/* Bubble CHỈ có chữ */}
      <div className="bg-gray-100 rounded-2xl p-3">
        <div className="font-medium text-gray-900 mb-1">{review.username}</div>
        <div className="text-gray-800 text-sm whitespace-pre-wrap">
          {review.comment}
        </div>
      </div>

      {/* MEDIA bên dưới, canh trái, không trong bubble */}
      {review.reviewMedias?.length ? (
        <div className="mt-2 md:max-w-[60%]">
          <ReviewMediaList medias={review.reviewMedias} />
        </div>
      ) : null}

      {/* Actions dưới bubble */}
      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
        <span>{timeVi(review.createdAt)}</span>

        <button className="hover:underline" onClick={() => onReplyClick(review)}>
          Trả lời
        </button>

        <button
          className={`inline-flex items-center gap-1 hover:underline ${
            likedByMe ? "text-yellow-700" : ""
          }`}
          onClick={() => onLikeToggle?.(review.id)}
          title={likedByMe ? "Bỏ thích" : "Thích"}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{typeof likeCount === "number" ? likeCount : (review.likes ?? 0)}</span>
        </button>
      </div>

      {repliesCount > 0 && (
        <button
          className="mt-1 text-xs text-yellow-700 hover:underline"
          onClick={() => onToggleReplies(review.id)}
        >
          {isOpen ? "Ẩn bình luận" : `Xem ${repliesCount} bình luận`}
        </button>
      )}

      {isOpen && repliesCount > 0 && (
        <div className="mt-2 pl-6 border-l border-gray-200 space-y-2">
          {review.replies!.map((r) => (
            <ReviewItem
              key={r.id}
              review={r}
              depth={depth + 1}
              expanded={expanded}
              onToggleReplies={onToggleReplies}
              onReplyClick={onReplyClick}
              onLikeToggle={onLikeToggle}
              likedByMe={likedByMe}
              likeCount={r.likes}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

};

type MediaKind = "IMAGE" | "VIDEO";
type MediaDraft = { file: File; url: string; kind: MediaKind };

const ReviewComposer: React.FC<{
  placeholder?: string;
  showRating?: boolean;
  currentUserName?: string;
  currentUserAvatar?: string;
  submitLabel?: string;
  onSubmit: (data: { rating?: number; comment: string; media: File[] }) => void | Promise<void>;
}> = ({ placeholder = "Viết cảm nhận của bạn…", showRating = false, currentUserName, currentUserAvatar, submitLabel = "Đăng", onSubmit }) => {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [files, setFiles] = React.useState<MediaDraft[]>([]);
  const [loading, setLoading] = React.useState(false);

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
        rating: showRating ? rating : undefined,
        comment: comment.trim(),
        media: files.map((f) => f.file),
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
                  <img src={f.url} className="w-full h-24 object-cover rounded-lg border" />
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
}) => {
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const [replyingTo, setReplyingTo] = React.useState<Review | null>(null);

  // Like state (optimistic)
  const [likedByMe, setLikedByMe] = React.useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = React.useState<Map<number, number>>(
    () =>
      new Map(
        reviews.map((r) => [r.id, typeof r.likes === "number" ? r.likes : 0])
      )
  );

  const toggleReplies = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleLikeToggle = (id: number) => {
    setLikedByMe((prev) => {
      const next = new Set(prev);
      const on = next.has(id);
      if (on) next.delete(id);
      else next.add(id);
      return next;
    });
    setLikeCounts((prev) => {
      const next = new Map(prev);
      const cur = next.get(id) ?? 0;
      next.set(id, likedByMe.has(id) ? Math.max(0, cur - 1) : cur + 1);
      return next;
    });
    // TODO: gọi API like/unlike nếu cần
  };

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="xl"
      maxWidth="min(95vw, 980px)"
      maxHeight="90vh"
      fullScreenOnMobile
      contentClassName="bg-white rounded-2xl p-0 overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Bình luận & đánh giá</div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-sm text-gray-600">Chưa có bình luận nào.</div>
          ) : (
            reviews.map((rv) => (
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
                  likedByMe={likedByMe.has(rv.id)}
                  likeCount={likeCounts.get(rv.id)}
                />
              </div>
            ))
          )}
        </div>

        <div className="bg-white border-t px-4 py-3 space-y-2">
          {replyingTo ? (
            <div className="text-xs text-gray-600">
              Đang trả lời <span className="font-medium">@{replyingTo.username}</span>
              <button className="ml-2 text-yellow-700 hover:underline" onClick={() => setReplyingTo(null)}>
                Hủy
              </button>
            </div>
          ) : (
            <div className="text-xs text-gray-500">Viết đánh giá mới cho di sản</div>
          )}

          <ReviewComposer
            showRating={!replyingTo}
            placeholder={replyingTo ? "Viết phản hồi…" : "Chia sẻ cảm nhận của bạn…"}
            onSubmit={async ({ rating, comment, media }) => {
              if (replyingTo) {
                await onReply?.({ parentReviewId: replyingTo.id, comment, media });
                setReplyingTo(null);
              } else {
                await onSubmitReview?.({ rating: rating || 5, comment, media });
              }
            }}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            submitLabel={replyingTo ? "Trả lời" : "Đăng đánh giá"}
          />
        </div>
      </div>
    </PortalModal>
  );
};

export default ReviewThreadModal;
