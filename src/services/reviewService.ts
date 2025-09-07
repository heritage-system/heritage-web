import { ApiResponse } from "../types/apiResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { LikeReviewResponse, Review, ReviewCreateRequest, ReviewDeleteRequest, ReviewDeleteResponse, ReviewUpdateRequest, ReviewUpdateResponse } from "../types/review";
import { LikeReviewRequest } from "../types/review";


export async function createReview(
  req: ReviewCreateRequest
): Promise<ApiResponse<Review>> {
  const formData = new FormData();

  formData.append("HeritageId", req.heritageId.toString());
  formData.append("Comment", req.comment);

  if (req.parentReviewId !== undefined) {
    formData.append("ParentReviewId", req.parentReviewId.toString());
  }

  req.media?.forEach((m, idx) => {
    if (!m.file) return;
    formData.append(`Media[${idx}].File`, m.file);
    formData.append(`Media[${idx}].Type`, m.type);
  });

  // ✅ Only type the fetchInterceptor with ApiResponse<Review>
  return fetchInterceptor<Review>(`${API_URL}/api/v1/reviews`, {
    method: "POST",
    body: formData,
  });
}





// 🔹 Get Reviews by HeritageId
export const getReviewsByHeritageId = async (
  heritageId: number
): Promise<ApiResponse<Review[]>> => {
  return await fetchInterceptor<Review[]>(
    `${API_URL}/api/v1/reviews/reviewByheritage?heritageId=${heritageId}`,
    { method: "GET" }
  );
};
// 🔹 Toggle like/unlike for a review
export const toggleLikeReview = async (
  payload: LikeReviewRequest
): Promise<ApiResponse<LikeReviewResponse>> => {
  return await fetchInterceptor(`${API_URL}/api/v1/reviews/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

// 🔹 Update a review
export const updateReview = async (
  payload: ReviewUpdateRequest
): Promise<ApiResponse<ReviewUpdateResponse>> => {
  const formData = new FormData();
  formData.append("id", payload.id.toString());
  formData.append("comment", payload.comment);

  payload.media?.forEach((m, idx) => {
    formData.append(`media[${idx}].file`, m.file);
    formData.append(`media[${idx}].type`, m.type);
  });

  return await fetchInterceptor<ReviewUpdateResponse>(`${API_URL}/api/v1/reviews`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteReview = async (
  payload: ReviewDeleteRequest
): Promise<ApiResponse<ReviewDeleteResponse>> => {
  return await fetchInterceptor<ReviewDeleteResponse>(`${API_URL}/api/v1/reviews`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
