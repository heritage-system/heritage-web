import { ApiResponse } from "../types/apiResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { LikeReviewResponse, Review, ReviewCreateRequest, ReviewDeleteRequest, ReviewDeleteResponse, ReviewUpdateRequest, ReviewUpdateResponse } from "../types/review";
import { LikeReviewRequest } from "../types/review";


export async function createReview(
  req: ReviewCreateRequest
): Promise<ApiResponse<Review>> {
  const formData = new FormData();

  formData.append("HeritageId", String(req.heritageId));
  formData.append("Comment", req.comment);

  // nên check != null để không bỏ qua giá trị 0
  if (req.parentReviewId != null) {
    formData.append("ParentReviewId", String(req.parentReviewId));
  }

  req.media?.forEach((m, idx) => {
    if (!m.file) return;
    // ASP.NET/Core binder thường bắt được key dạng dot + index như dưới
    formData.append(`Media[${idx}].File`, m.file);     // file phải là File/Blob
    formData.append(`Media[${idx}].Type`, String(m.type));
  });

  return fetchInterceptor<Review>(`${API_URL}/api/v1/Reviews/create_review`, {
    method: "POST",
    body: formData,            // ❗️để nguyên FormData
    // headers: KHÔNG thêm Content-Type
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

export const updateReview = async (
  payload: ReviewUpdateRequest
): Promise<ApiResponse<ReviewUpdateResponse>> => {
  const formData = new FormData();
  formData.append("Id", payload.id.toString());
  formData.append("Comment", payload.comment);

  if (payload.media) {
    payload.media.forEach((m, i) => {
      formData.append(`Media[${i}].File`, m.file);
      formData.append(`Media[${i}].Type`, m.type);
    });
  }

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
