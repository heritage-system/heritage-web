import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  ContributionCreateRequest,
  ContributionCreateResponse,  
  ContributionResponse,
  ContributionSearchRequest,
  ContributionSearchResponse,
  ContributionRelatedRequest,
  ContributionOverviewResponse,
  ContributionOverviewItemListResponse,
  ContributionOverviewSearchRequest,
  ContributionDetailUpdatedResponse,
  ContributionUpdateRequest,
  ContributionSaveResponse
} from "../types/contribution";
import {
  ContributionReviewCreateRequest,
  ContributionReviewResponse,
  ContributionReviewUpdateRequest,
  ContributionReviewUpdateResponse
} from "../types/contributionReview";
import {
  ContributionHeritageTag
} from "../types/heritage";
import {
  TrendingContributor
} from "../types/contributor";
import {
  ContributionReportCreationRequest
} from "../types/contributionReport";
import { LikeReviewResponse, LikeReviewRequest} from "../types/review";

export const searchContribution = async (
  params: ContributionSearchRequest
): Promise<ApiResponse<PageResponse<ContributionSearchResponse>>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<PageResponse<ContributionSearchResponse>>(
    `${API_URL}/api/v1/contributions/search_contribution?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};

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

export const removeContributionSave = async (id: number): Promise<ApiResponse<boolean>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  const data = await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/contributions/remove_contribution_save?${queryString}`,
    {
      method: "DELETE",  
    }
  );

  return data;
};

export async function createContributionReview(
  req: ContributionReviewCreateRequest
): Promise<ApiResponse<ContributionReviewResponse>> {
  const formData = new FormData();

  formData.append("ContributionId", String(req.contributionId));
  formData.append("Comment", req.comment);

  if (req.parentReviewId != null) {
    formData.append("ParentReviewId", String(req.parentReviewId));
  }

  return fetchInterceptor<ContributionReviewResponse>(`${API_URL}/api/v1/contribution_reviews/create_review`, {
    method: "POST",
    body: formData,            
  });
}


export const getReviewsByContributionId = async (
 contributionId: number
): Promise<ApiResponse<ContributionReviewResponse[]>> => {
  return await fetchInterceptor<ContributionReviewResponse[]>(
    `${API_URL}/api/v1/contribution_reviews/get_contribution_reviews?contributionId=${contributionId}`,
    { method: "GET" }
  );
};

export const toggleLikeContributionReview = async (
  payload: LikeReviewRequest
): Promise<ApiResponse<LikeReviewResponse>> => {
  return await fetchInterceptor(`${API_URL}/api/v1/contribution_reviews/like`, {
    method: "POST",
    body: payload as any,
  });
};

export const updateReview = async (
  payload: ContributionReviewUpdateRequest
): Promise<ApiResponse<ContributionReviewUpdateResponse>> => {
  const formData = new FormData();
  formData.append("Id", payload.id.toString());
  formData.append("Comment", payload.comment);

  return await fetchInterceptor<ContributionReviewUpdateResponse>(`${API_URL}/api/v1/contribution_reviews/update_review`, {
    method: "PUT",
    body: formData,
  });
};


export const deleteReview = async (
  reviewId: number
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/contribution_reviews/delete_review?reviewId=${reviewId}`,
    { method: "DELETE" }
  );
};

export const getTrendingContributionHeritageTag = async (): 
Promise<ApiResponse<ContributionHeritageTag[]>> => {
  return await fetchInterceptor<ContributionHeritageTag[]>(
    `${API_URL}/api/v1/contributions/top_contribution_heritage_tag`,
    { method: "GET" }
  );
};

export const getTrendingContributor = async (): 
Promise<ApiResponse<TrendingContributor[]>> => {
  return await fetchInterceptor<TrendingContributor[]>(
    `${API_URL}/api/v1/contributions/top_contributor`,
    { method: "GET" }
  );
};

export const createContributionReport = async (
  payload: ContributionReportCreationRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor(`${API_URL}/api/v1/contributions/create_contribution_report`, {
    method: "POST",
    body: payload as any,
  });
};

export const getContributionRelated = async (
  params: ContributionRelatedRequest
): Promise<ApiResponse<ContributionSearchResponse[]>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<ContributionSearchResponse[]>(
    `${API_URL}/api/v1/contributions/contribution_related?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};

export const getContributionOverview = async (id: number): Promise<ApiResponse<ContributionOverviewResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<ContributionOverviewResponse>(
    `${API_URL}/api/v1/contributions/get_contribution_overview?${queryString}`,
    {
      method: "GET",
    }
  );
};

export const getListContributionOverview = async (
  params: ContributionOverviewSearchRequest
): Promise<ApiResponse<PageResponse<ContributionOverviewItemListResponse>>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<PageResponse<ContributionOverviewItemListResponse>>(
    `${API_URL}/api/v1/contributions/get_list_contribution_overview?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};

export const getContributionDetailForUpdated = async (id: number): Promise<ApiResponse<ContributionDetailUpdatedResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<ContributionDetailUpdatedResponse>(
    `${API_URL}/api/v1/contributions/get_contribution_updated?${queryString}`,
    {
      method: "GET",
    }
  );
};

export const updateContribution = async (
  data: ContributionUpdateRequest
): Promise<ApiResponse<ContributionCreateResponse>> => {
  return await fetchInterceptor<ContributionCreateResponse>(
    `${API_URL}/api/v1/contributions/updated_contribution`,
    {
      method: "PUT",
      body: data as any,
    }
  );
};

export const getContributionSaves = async (
  params: ContributionSearchRequest
): Promise<ApiResponse<PageResponse<ContributionSaveResponse>>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<PageResponse<ContributionSaveResponse>>(
    `${API_URL}/api/v1/contributions/get_contribution_save?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};