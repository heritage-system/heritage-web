import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  ContributorCreateRequest,
  ContributorUpdateRequest,
  ContributorResponse,
  ContributorSearchRequest,
  ContributorSearchResponse,
  DropdownUserResponse,
} from "../types/contributor";

// Create Contributor (ADMIN)
export const createContributor = async (
  data: ContributorCreateRequest
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors`,
    {
      method: "POST",
      body: data as any,
    }
  );
};

// Update Contributor (ADMIN)
export const updateContributor = async (
  id: number,
  data: ContributorUpdateRequest
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/${id}`,
    {
      method: "PUT",
      body: data as any,
    }
  );
};

// Disable Contributor (ADMIN)
export const disableContributor = async (
  id: number
): Promise<ApiResponse<null>> => {
  return await fetchInterceptor<null>(
    `${API_URL}/api/v1/contributors/${id}/disable`,
    { method: "PUT" }
  );
};

// Get Contributor Detail
export const getContributorDetail = async (
  id: number
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/${id}`,
    { method: "GET" }
  );
};


// Search Contributors 
export const searchContributors = async (
  params: ContributorSearchRequest
): Promise<ApiResponse<PageResponse<ContributorSearchResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.append("Keyword", params.keyword);
  if (params.verified !== undefined)
    query.append("Verified", params.verified.toString());
  if (params.status) query.append("Status", params.status);
  if (params.sortBy) query.append("SortBy", params.sortBy);
  if (params.page) query.append("Page", params.page.toString());
  if (params.pageSize) query.append("PageSize", params.pageSize.toString());

  return await fetchInterceptor<PageResponse<ContributorSearchResponse>>(
    `${API_URL}/api/v1/contributors/search?${query.toString()}`,
    { method: "GET" }
  );
};

// Apply Contributor
export const applyContributor = async (
  data: ContributorCreateRequest
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/apply`,
    {
      method: "POST",
      body: data as any,
    }
  );
};

// Approve Contributor
export const approveContributor = async (
  id: number
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/${id}/approve`,
    { method: "PUT" }
  );
};

//Reject Contributor
export const rejectContributor = async (
  id: number
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/${id}/reject`,
    { method: "PUT" }
  );
};

// Search dropdown users 
export const searchDropdownUser = async (
  keyword: string
): Promise<ApiResponse<DropdownUserResponse[]>> => {
  return await fetchInterceptor<DropdownUserResponse[]>(
    `${API_URL}/api/v1/contributors/dropdown-users?keyword=${encodeURIComponent(
      keyword
    )}`,
    { method: "GET" }
  );
};
