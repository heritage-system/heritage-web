import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  ContributionOverviewResponse,
  ContributionOverviewItemListResponse,
  ContributionOverviewSearchRequest,
} from "../types/contribution";

export const getListContributionsOverviewForStaff = async (
  params: ContributionOverviewSearchRequest
): Promise<ApiResponse<PageResponse<ContributionOverviewItemListResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.append("Keyword", params.keyword);
  if (params.contributionStatus !== undefined) 
    query.append("ContributionStatus", params.contributionStatus.toString());
  if (params.sortBy) query.append("SortBy", params.sortBy);
  if (params.page) query.append("Page", params.page.toString());
  if (params.pageSize) query.append("PageSize", params.pageSize.toString());

  return await fetchInterceptor<PageResponse<ContributionOverviewItemListResponse>>(
    `${API_URL}/api/v1/contribution-acceptances/staff/contributions-overview?${query.toString()}`,
    { method: "GET" }
  );
};

export const getContributionOverviewForStaff = async (
  contributionId: number
): Promise<ApiResponse<ContributionOverviewResponse>> => {
  return await fetchInterceptor<ContributionOverviewResponse>(
    `${API_URL}/api/v1/contribution-acceptances/staff/contributions/${contributionId}/overview`,
    { method: "GET" }
  );
};

export const approveContributionAcceptance = async (
  acceptanceId: number
): Promise<ApiResponse<object>> => {
  if (!acceptanceId || acceptanceId <= 0)
    throw new Error("acceptanceId is invalid or missing");

  return await fetchInterceptor<object>(
    `${API_URL}/api/v1/contribution-acceptances/staff/acceptances/${acceptanceId}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const rejectContributionAcceptance = async (
  acceptanceId: number,
  note: string
): Promise<ApiResponse<object>> => {
  if (!acceptanceId || acceptanceId <= 0)
    throw new Error("acceptanceId is invalid or missing");

  if (!note || note.trim() === "")
    throw new Error("note is required for rejection");

  return await fetchInterceptor<object>(
    `${API_URL}/api/v1/contribution-acceptances/staff/acceptances/${acceptanceId}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note }),
    }
  );
};