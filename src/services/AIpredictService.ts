import { PredictResponse } from "../types/AIpredict";
import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";

import { AI_API_URL,API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
export const predictHeritage = async (
  file: File,
  params?: { top_k?: number; results?: number; threshold?: number }
): Promise<ApiResponse<PredictResponse>> => {
  const formData = new FormData();
  formData.append("file", file);

  const query = new URLSearchParams();
  if (params?.top_k) query.append("top_k", params.top_k.toString());
  if (params?.results) query.append("results", params.results.toString());
  if (params?.threshold) query.append("threshold", params.threshold.toString());

  return await fetchInterceptor<PredictResponse>(
    `${AI_API_URL}/predict?${query.toString()}`,
    {
      method: "POST",
      body: formData,
      // skipAuth: true, // 👉 Nếu predict API của bạn KHÔNG yêu cầu login thì bật dòng này
    }
  );
};