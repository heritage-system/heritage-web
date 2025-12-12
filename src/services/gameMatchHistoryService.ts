import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  UserMatchHistoryResponse
} from "../types/gameMatchHistory";


export const searchMatchHistory = async (
): Promise<ApiResponse<UserMatchHistoryResponse[]>> => {
 
  return await fetchInterceptor<UserMatchHistoryResponse[]>(
    `${API_URL}/api/v1/match_history/match_history`,
    { method: "GET" }
  );
};