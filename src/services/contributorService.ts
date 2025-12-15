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
  ContributorApplyRequest,
  ContributorApplyResponse,
  DropdownUserResponse,
} from "../types/contributor";

// ------------------- Contributor API -------------------

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

// Search Contributors (ADMIN)
export const searchContributors = async (
  params: ContributorSearchRequest
): Promise<ApiResponse<PageResponse<ContributorResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.append("Keyword", params.keyword);
  // if (params.verified !== undefined)
  //   query.append("Verified", params.verified.toString());
  if (params.status) query.append("Status", params.status);
  if (params.sortBy) query.append("SortBy", params.sortBy);
  if (params.page) query.append("Page", params.page.toString());
  if (params.pageSize) query.append("PageSize", params.pageSize.toString());

  return await fetchInterceptor<PageResponse<ContributorResponse>>(
    `${API_URL}/api/v1/contributors/search?${query.toString()}`,
    { method: "GET" }
  );
};

// Apply Contributor (MEMBER)
export const applyContributor = async (
  data: ContributorApplyRequest
): Promise<ApiResponse<ContributorApplyResponse>> => {
  return await fetchInterceptor<ContributorApplyResponse>(
    `${API_URL}/api/v1/contributors/apply`,
    {
      method: "POST",
      body: data as any,
    }
  );
};

// Approve Contributor (ADMIN)
export const approveContributor = async (
  id: number
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/${id}/approve`,
    { method: "PUT" }
  );
};

// Reject Contributor (ADMIN)
export const rejectContributor = async (
  id: number
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/${id}/reject`,
    { method: "PUT" }
  );
};

// Search Dropdown Users (ADMIN)
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

// Get My Application (MEMBER)
export const getMyApplication = async (): Promise<ApiResponse<ContributorApplyResponse | null>> => {
  return await fetchInterceptor<ContributorApplyResponse | null>(
    `${API_URL}/api/v1/contributors/my-application`,
    { method: "GET" }
  );
};

// Re-Activate Contributor (ADMIN)
export const reactivateContributor = async (
  id: number
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/${id}/reactivate`,
    { method: "PUT" }
  );
};

export const isContributorPremiumEligible = async (): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/contributors/is_contributor_premium_eligible`,
    { method: "GET" }
  );
};