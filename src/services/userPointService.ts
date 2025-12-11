import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  PointToUnlockTokenRequest
} from "../types/userPoint";
import {  
  ContributionResponse,
} from "../types/contribution";
import {  
  PanoramaSceneResponse,
} from "../types/panoramaTour";

export const tradePointToUnlockContribution = async (
  data: PointToUnlockTokenRequest
): Promise<ApiResponse<ContributionResponse>> => {
  return await fetchInterceptor<ContributionResponse>(
    `${API_URL}/api/v1/user_point/trade_point_contribution`,
    { method: "POST", body: data as any }
  );
};

export const tradePointToUnlockScene = async (
  data: PointToUnlockTokenRequest
): Promise<ApiResponse<PanoramaSceneResponse>> => {
  return await fetchInterceptor<PanoramaSceneResponse>(
    `${API_URL}/api/v1/user_point/trade_point_scene`,
    { method: "POST", body: data as any }
  );
};

export const tradePointToUnlockQuiz = async (
  data: PointToUnlockTokenRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/user_point/trade_point_quiz`,
    { method: "POST", body: data as any }
  );
};

