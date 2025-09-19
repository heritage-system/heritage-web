import { ApiResponse } from "../types/apiResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  ContributionCreateRequest,
  ContributionCreateResponse,  
  ContributionResponse
} from "../types/contribution";


export const postContribution = async (
  data: ContributionCreateRequest
): Promise<ApiResponse<ContributionCreateResponse>> => {
  return await fetchInterceptor<ContributionCreateResponse>(
    `${API_URL}/api/v1/contributions`,
    {
      method: "POST",
      body: data as any,
    }
  );
};

export const getContributionDetail = async (id: number): Promise<ApiResponse<ContributionResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<ContributionResponse>(
    `${API_URL}/api/v1/contributions/get_contribution_detail?${queryString}`,
    {
      method: "GET",
    }
  );
};

export const unlockContribution = async (id: number): Promise<ApiResponse<ContributionResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<ContributionResponse>(
    `${API_URL}/api/v1/contributions/unlock_contribution?${queryString}`,
    {
      method: "POST",
    }
  );
};

export const addContributionSave = async (id: number): Promise<ApiResponse<boolean>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  const data = await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/contributions/add_contribution_save?${queryString}`,
    {
      method: "POST",   
    }
  );

  return data;
};

export const removContributionSave = async (id: number): Promise<ApiResponse<boolean>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  const data = await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/contributions/remove_contribution_save?${queryString}`,
    {
      method: "DELETE",  
    }
  );

  return data;
};