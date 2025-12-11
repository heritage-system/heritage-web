import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  QuizListRequest,
  QuizListResponse,
  QuizDetailResponse,
  SaveQuizResultRequest,
  QuizCreationRequest,
  QuizUpdateRequest,
  QuizQuestionCreationRequest,
  QuizQuestionUpdateRequest,
  QuizDetailAdminResponse ,
  QuizOverviewResponse
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

export const getQuizOverview = async (id: number): Promise<ApiResponse<QuizOverviewResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<QuizOverviewResponse>(
    `${API_URL}/api/v1/quiz/get_quiz_overview?${queryString}`,
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

export const createQuiz = async (
  data: QuizCreationRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/quiz/create_quiz`,
    { method: "POST", body: data as any }
  );
};

export const updateQuiz = async (
  data: QuizUpdateRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/quiz/update_quiz`,
    { method: "PUT", body: data as any }
  );
};

export const deleteQuiz = async (id: number): Promise<ApiResponse<number | null>> => {
  return await fetchInterceptor<number | null>(
    `${API_URL}/api/v1/quiz/delete_quiz?id=${id}`,
    { method: "DELETE" }
  );
};

export const createQuizQuestion = async (
  data: QuizQuestionCreationRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/quiz/create_quiz_question`,
    { method: "POST", body: data as any }
  );
};

export const updateQuizQuestion = async (
  data: QuizQuestionUpdateRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/quiz/update_quiz_question`,
    { method: "PUT", body: data as any }
  );
};

export const deleteQuizQuestion = async (id: number): Promise<ApiResponse<number | null>> => {
  return await fetchInterceptor<number | null>(
    `${API_URL}/api/v1/quiz/delete_quiz_question?id=${id}`,
    { method: "DELETE" }
  );
};

export const getQuizDetailAdmin = async (
  quizId: number
): Promise<ApiResponse<QuizDetailAdminResponse>> => {

  return await fetchInterceptor<QuizDetailAdminResponse>(
    `${API_URL}/api/v1/quiz/admin/detail/${quizId}`,
    {
      method: "GET",
    }
  );
};

export const unlockQuiz = async (id: number): Promise<ApiResponse<boolean>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/quiz/unlock_quiz?${queryString}`,
    {
      method: "POST",
    }
  );
};
