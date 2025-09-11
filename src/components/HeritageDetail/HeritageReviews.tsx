import React, { useEffect, useState } from "react";
import { Review } from "../../types/review";
import ReviewThreadModal from "./ReviewThreadModal";
import { getReviewsByHeritageId } from "../../services/reviewService";
import { createReview } from "../../services/reviewService";
import { ReviewCreateRequest } from "../../types/review";
import { deleteReview  } from "../../services/reviewService";

interface Props {
  heritageId: number;   // ✅ new prop
  onSubmitReview?: (payload: { comment: string; media?: File[] }) => Promise<void> | void;
  onReply?: (payload: { parentReviewId: number; comment: string; media?: File[] }) => Promise<void> | void;
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
export const addReplyToTree = (
  reviews: Review[],
  parentId: number,
  reply: Review
): Review[] =>
  reviews.map(r =>
    r.id === parentId
      ? { ...r, replies: [...(r.replies || []), reply] }
      : { ...r, replies: addReplyToTree(r.replies || [], parentId, reply) }
  );

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  right,
  children,
}) => (
  <section className="bg-white rounded-2xl shadow-sm border p-5">
    <header className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {right}
    </header>
    <div>{children}</div>
  </section>
);

export const HeritageReviews: React.FC<Props> = ({
  heritageId,
  onSubmitReview,
  onReply,
  currentUserName,
  currentUserAvatar,
}) => {
  const [openModal, setOpenModal] = React.useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!heritageId) return;
    setLoading(true);

    getReviewsByHeritageId(heritageId)
      .then((res) => {
        if (res.result) setReviews(res.result);
        else setReviews([]);
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, [heritageId]);

  const displayedReviews = reviews.length > 0 ? reviews : [];
 
// copy the same helpers into parent (or export/import them)
// recursive removal that returns a NEW array (no mutation)
const deleteReviewInTree = (reviews: Review[], reviewId: number): Review[] =>
  reviews
    .filter(r => r.id !== reviewId)
    .map(r => ({
      ...r,
      replies: r.replies ? deleteReviewInTree(r.replies, reviewId) : [],
    }));

const updateReviewInTree = (reviews: Review[], reviewId: number, updater: (r: Review) => Review): Review[] =>
  reviews.map(r => {
    if (r.id === reviewId) return updater(r);
    return { ...r, replies: r.replies ? updateReviewInTree(r.replies, reviewId, updater) : [] };
  });

// parent handler to remove from its state
const handleDeleteFromModal = async (id: number) => {
  // Optimistic update
  setReviews(prev => deleteReviewInTree(prev, id));

  try {
    const res = await deleteReview({ id });

    if (!res.result?.success) {
      // rollback if API fails
      const fresh = await getReviewsByHeritageId(heritageId);
      setReviews(fresh.result ?? []);
      alert(res.result?.message || "Xóa bình luận thất bại");
    }
  } catch (err) {
    console.error(err);
    const fresh = await getReviewsByHeritageId(heritageId);
    setReviews(fresh.result ?? []);
    alert("Có lỗi khi xóa bình luận");
  }
};

// in parent
const handleEditFromModal = (
  reviewId: number,
  comment: string,
  media?: { file: File; type: string }[]
) => {
  setReviews(prev =>
    updateReviewInTree(prev, reviewId, r => ({
      ...r,
      comment,
      updatedAt: new Date().toISOString(), // ✅ UTC timestamp
      reviewMedias: media
        ? media.map((m, i) => ({
            id: i, // temp id for frontend until backend saves
            reviewId: r.id, // required by ReviewMedia
            url: URL.createObjectURL(m.file),
            mediaType: m.type,
          }))
        : r.reviewMedias,
    }))
  );
};



const handleCreateReview = async (payload: { comment: string; media?: { file: File; type: string }[] }) => {
  try {
    const res = await createReview({
      heritageId,
      comment: payload.comment,
      media: payload.media,
    });

    if (res.result) {
      const newReview: Review = {
        ...res.result,
        createdByMe: true, // ✅ force it for new reviews
      };
      setReviews((prev) => [newReview, ...prev]);
    }
  } catch (err) {
    console.error("Error creating review:", err);
  }
};


const handleReply = async (payload: { parentReviewId: number; comment: string; media?: { file: File; type: string }[] }) => {
  try {
    const res = await createReview({
      heritageId,
      comment: payload.comment,
      parentReviewId: payload.parentReviewId,
      media: payload.media,
    });

    if (res.result) {
      const replyReview: Review = {
        ...res.result,
        createdByMe: true,
      };

      setReviews(prev => addReplyToTree(prev, payload.parentReviewId, replyReview));
    }
  } catch (err) {
    console.error("Error replying to review:", err);
  }
};


  return (
    <>
      <SectionCard
  title="Đánh giá (Review)"
  right={
    displayedReviews.length > 0 ? (
      <button
        type="button"
        onClick={() => setOpenModal(true)}
        className="text-sm text-yellow-700 hover:underline"
      >
        Xem tất cả
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpenModal(true)}
        className="text-sm text-yellow-700 hover:underline"
      >
        Viết đánh giá
      </button>
    )
  }
>
  {loading ? (
    <div className="text-sm text-gray-500">Đang tải đánh giá...</div>
  ) : displayedReviews.length === 0 ? (
    <div className="text-sm text-gray-500">
      Chưa có đánh giá nào.{" "}
      <button
        type="button"
        onClick={() => setOpenModal(true)}
        className="text-yellow-700 hover:underline"
      >
        Viết đánh giá đầu tiên
      </button>
    </div>
  ) : (
    <div className="space-y-3">
      {displayedReviews.slice(0, 3).map((review) => (
        <div key={review.id} className="border-b last:border-b-0 pb-3 last:pb-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-900">{review.username}</span>
            <span className="text-xs text-gray-500 ml-1">
              {new Date(review.updatedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <p className="text-sm text-gray-700">{review.comment}</p>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setOpenModal(true)}
        className="text-sm text-yellow-700 hover:underline"
      >
        Xem thêm {displayedReviews.length} bình luận
      </button>
    </div>
  )}
</SectionCard>


      {/* Full Review Modal */}
<ReviewThreadModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  reviews={reviews} // use parent state directly
  onSubmitReview={handleCreateReview}
  onReply={handleReply}
  onDeleteReview={handleDeleteFromModal}
  onEditReview={handleEditFromModal}
  currentUserName={currentUserName}
  currentUserAvatar={currentUserAvatar}
/>




    </>
  );
};
