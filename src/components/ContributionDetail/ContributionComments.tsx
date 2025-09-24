import React, { useEffect, useState } from "react";
import { ThumbsUp, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../Layouts/ModalLayouts/ConfirmModal";

import {
  getReviewsByContributionId,
  createContributionReview,
  toggleLikeContributionReview,
  updateReview,
  deleteReview,
} from "../../services/contributionService";

import {
  ContributionReviewResponse,
  ContributionReviewCreateRequest,
  ContributionReviewUpdateRequest,
} from "../../types/contributionReview";
import { LikeReviewRequest } from "../../types/review";
import { tokenStorage } from "../../utils/tokenStorage";

interface Props {
  contributionId: number;
  currentUserName?: string;
  currentUserAvatar?: string;
}

const COMMENTS_PER_PAGE = 2;

const ContributionComments: React.FC<Props> = ({
  contributionId,
  currentUserName,
  currentUserAvatar,
}) => {
  const [reviews, setReviews] = useState<ContributionReviewResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE);

  const [replyBox, setReplyBox] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // toggle replies
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

  const isLoggedIn = !!tokenStorage.getAccessToken();

  // load comments
  useEffect(() => {
    if (!contributionId) return;
    setLoading(true);
    getReviewsByContributionId(contributionId)
      .then((res) => {
        if (res.result) setReviews(res.result);
      })
      .catch((err) => console.error("Error fetching reviews:", err))
      .finally(() => setLoading(false));
  }, [contributionId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const payload: ContributionReviewCreateRequest = {
        contributionId,
        comment: newComment.trim(),
      };
      const res = await createContributionReview(payload);
      if (res.result) {
        setReviews((prev) => [res.result!, ...prev]);
        setNewComment("");
        toast.success("Đã đăng bình luận!");
      }
    } catch (err) {
      toast.error("Không thể đăng bình luận");
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyText.trim()) return;
    try {
      const payload: ContributionReviewCreateRequest = {
        contributionId,
        comment: replyText.trim(),
        parentReviewId: parentId,
      };
      const res = await createContributionReview(payload);
      if (res.result) {
        const addReply = (items: ContributionReviewResponse[]): ContributionReviewResponse[] =>
          items.map((r) =>
            r.id === parentId
              ? { ...r, replies: [...(r.replies || []), res.result!] }
              : { ...r, replies: r.replies ? addReply(r.replies) : [] }
          );

        setReviews((prev) => addReply(prev));
        setReplyBox(null);
        setReplyText("");
        toast.success("Đã trả lời!");
      }
    } catch (err) {
      toast.error("Không thể trả lời");
    }
  };

  const handleEditSubmit = async (id: number) => {
    if (!editText.trim()) return;

    try {
      const payload: ContributionReviewUpdateRequest = { id, comment: editText.trim() };
      const res = await updateReview(payload);

      if (res.result) {
        const updateComment = (items: ContributionReviewResponse[]): ContributionReviewResponse[] =>
          items.map((r) =>
            r.id === id
              ? { ...r, comment: res.result!.comment, updatedAt: res.result!.updatedAt }
              : { ...r, replies: r.replies ? updateComment(r.replies) : [] }
          );

        setReviews((prev) => updateComment(prev));
        toast.success("Cập nhật bình luận thành công!");
      }
    } catch (err) {
      toast.error("Không thể cập nhật bình luận");
    }

    setEditingId(null);
    setEditText("");
  };

  const confirmDelete = (id: number) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      const res = await deleteReview(deleteTargetId);
      if (res.result) {
        const deleteRecursive = (items: ContributionReviewResponse[]): ContributionReviewResponse[] =>
          items
            .filter((r) => r.id !== deleteTargetId)
            .map((r) => ({ ...r, replies: r.replies ? deleteRecursive(r.replies) : [] }));

        setReviews((prev) => deleteRecursive(prev));
        toast.success("Đã xoá bình luận!");
      } else {
        toast.error("Xoá bình luận thất bại!");
      }
    } catch (err) {
      toast.error("Lỗi khi xoá bình luận");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleToggleLike = async (id: number, likedByMe: boolean) => {
    try {
      const payload: LikeReviewRequest = { reviewId: id, like: !likedByMe };
      const res = await toggleLikeContributionReview(payload);

      if (res.result) {
        const updateLikes = (items: ContributionReviewResponse[]): ContributionReviewResponse[] =>
          items.map((r) =>
            r.id === id
              ? { ...r, likes: res.result!.likeCount, likedByMe: res.result!.likedByMe }
              : { ...r, replies: r.replies ? updateLikes(r.replies) : [] }
          );

        setReviews((prev) => updateLikes(prev));
      }
    } catch (err) {
      toast.error("Không thể like bình luận");
    }
  };

  const toggleReplies = (id: number) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayedReviews = reviews.slice(0, visibleCount);

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Bình luận ({reviews.length})
      </h3>

      {/* Comment Form */}
      {isLoggedIn ? (
        <div className="mb-8 flex space-x-3">
          {currentUserAvatar && (
            <img
              src={currentUserAvatar}
              alt={currentUserName}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700/40 focus:border-yellow-700 resize-none"
              rows={3}
            />
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Hãy bình luận một cách lịch sự và tôn trọng
              </span>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-yellow-700 to-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đăng bình luận
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center text-sm text-gray-600">
          <button className="text-yellow-700 hover:underline">
            Đăng nhập để bình luận
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-gray-500">Đang tải bình luận...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      ) : (
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
              <CommentItem
                review={review}
                isLoggedIn={isLoggedIn}
                replyBox={replyBox}
                replyText={replyText}
                menuOpen={menuOpen}
                editingId={editingId}
                editText={editText}
                setReplyBox={setReplyBox}
                setReplyText={setReplyText}
                setMenuOpen={setMenuOpen}
                setEditingId={setEditingId}
                setEditText={setEditText}
                handleReplySubmit={handleReplySubmit}
                handleEditSubmit={handleEditSubmit}
                confirmDelete={confirmDelete}
                handleToggleLike={handleToggleLike}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
              />
            </div>
          ))}

          {/* pagination buttons */}
          {visibleCount < reviews.length && (
            <button
              onClick={() => setVisibleCount((prev) => prev + COMMENTS_PER_PAGE)}
              className="text-sm text-yellow-700 hover:underline mt-3"
            >
              Xem thêm {Math.min(COMMENTS_PER_PAGE, reviews.length - visibleCount)} bình luận
            </button>
          )}
          {visibleCount > COMMENTS_PER_PAGE && (
            <button
              onClick={() => setVisibleCount(COMMENTS_PER_PAGE)}
              className="text-sm text-yellow-700 hover:underline mt-3 ml-3"
            >
              Ẩn bớt
            </button>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Xoá bình luận"
        message="Bạn có chắc chắn muốn xoá bình luận này? Hành động này không thể hoàn tác."
        confirmText="Xoá"
        cancelText="Hủy"
        loading={deleting}
      />
    </div>
  );
};

export default ContributionComments;

// 🔹 Component tái sử dụng cho comment & reply
const CommentItem = ({
  review,
  isLoggedIn,
  replyBox,
  replyText,
  menuOpen,
  editingId,
  editText,
  setReplyBox,
  setReplyText,
  setMenuOpen,
  setEditingId,
  setEditText,
  handleReplySubmit,
  handleEditSubmit,
  confirmDelete,
  handleToggleLike,
  expandedReplies,
  toggleReplies,
}: any) => {
  return (
    <div className="flex space-x-3">
      <img
        src={review.userImageUrl}
        alt={review.username}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-gray-900">{review.username}</h4>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          {review.createdByMe && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(menuOpen === review.id ? null : review.id)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              {menuOpen === review.id && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setEditingId(review.id);
                      setEditText(review.comment);
                      setMenuOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => confirmDelete(review.id)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Xoá
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {editingId === review.id ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleEditSubmit(review.id)}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded"
              >
                Lưu
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-3 py-1 bg-gray-200 text-sm rounded"
              >
                Huỷ
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 mb-3">{review.comment}</p>
        )}

        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <>
              <button
                onClick={() => handleToggleLike(review.id, review.likedByMe ?? false)}
                className={`flex items-center space-x-1 text-sm ${
                  review.likedByMe ? "text-yellow-700" : "text-gray-600 hover:text-yellow-700"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{review.likes ?? 0}</span>
              </button>

              <button
                onClick={() => setReplyBox(replyBox === review.id ? null : review.id)}
                className="text-sm text-gray-600 hover:text-yellow-700"
              >
                Trả lời
              </button>
            </>
          )}
        </div>

        {/* reply box */}
        {replyBox === review.id && isLoggedIn && (
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Viết trả lời..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReplySubmit(review.id)}
                disabled={!replyText.trim()}
                className="px-4 py-1 bg-yellow-600 text-white text-sm rounded disabled:opacity-50"
              >
                Đăng
              </button>
              <button
                onClick={() => {
                  setReplyBox(null);
                  setReplyText("");
                }}
                className="px-4 py-1 bg-gray-200 text-sm rounded"
              >
                Huỷ
              </button>
            </div>
          </div>
        )}

        {/* nút toggle replies */}
        {review.replies && review.replies.length > 0 && (
          <button
            onClick={() => toggleReplies(review.id)}
            className="text-sm text-yellow-700 hover:text-yellow-700 mt-2"
          >
            {expandedReplies.has(review.id)
              ? "Ẩn trả lời"
              : `Xem ${review.replies.length} trả lời`}
          </button>
        )}

        {/* replies */}
        {expandedReplies.has(review.id) && review.replies.length > 0 && (
          <div className="ml-12 mt-3 space-y-2">
            {review.replies.map((reply: ContributionReviewResponse) => (
              <CommentItem
                key={reply.id}
                review={reply}
                isLoggedIn={isLoggedIn}
                replyBox={replyBox}
                replyText={replyText}
                menuOpen={menuOpen}
                editingId={editingId}
                editText={editText}
                setReplyBox={setReplyBox}
                setReplyText={setReplyText}
                setMenuOpen={setMenuOpen}
                setEditingId={setEditingId}
                setEditText={setEditText}
                handleReplySubmit={handleReplySubmit}
                handleEditSubmit={handleEditSubmit}
                confirmDelete={confirmDelete}
                handleToggleLike={handleToggleLike}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
