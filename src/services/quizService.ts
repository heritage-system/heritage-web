import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  QuizListRequest,
  QuizListResponse,
  QuizDetailResponse,
  SaveQuizResultRequest
} from "../types/quiz";


export const searchQuizz = async (
  params: QuizListRequest
): Promise<ApiResponse<PageResponse<QuizListResponse>>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<PageResponse<QuizListResponse>>(
    `${API_URL}/api/v1/quiz/search_quiz?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};


export const getQuizDetail = async (id: number): Promise<ApiResponse<QuizDetailResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<QuizDetailResponse>(
    `${API_URL}/api/v1/quiz/get_quiz_detail?${queryString}`,
    {
      method: "GET",
    }
  );
};

export const saveQuizResult = async (
  data: SaveQuizResultRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/quiz/save_quiz_result`,
    {
      method: "POST",
      body: data as any,
    }
  );
};