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
} from "../types/contributor";

// ------------------ CRUD ------------------

// 🔹 Create Contributor
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

// 🔹 Update Contributor
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

// 🔹 Delete Contributor
export const deleteContributor = async (
  id: number
): Promise<ApiResponse<null>> => {
  return await fetchInterceptor<null>(
    `${API_URL}/api/v1/contributors/${id}`,
    { method: "DELETE" }
  );
};

// 🔹 Get Contributor Detail
export const getContributorDetail = async (
  id: number
): Promise<ApiResponse<ContributorResponse>> => {
  return await fetchInterceptor<ContributorResponse>(
    `${API_URL}/api/v1/contributors/${id}`,
    { method: "GET" }
  );
};

// ------------------ Search ------------------

// 🔹 Search Contributors (paged)
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
