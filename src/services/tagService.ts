import { ApiResponse } from "../types/apiResponse";
import { Tag } from "../types/tag";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

import { TagSearchRequest, TagSearchResponse } from "../types/tag";
import { PageResponse } from "@/types/pageResponse";

// Create Tag
export const createTag = async (
  data: { name: string }
): Promise<ApiResponse<Tag>> => {
  return await fetchInterceptor<Tag>(`${API_URL}/api/v1/Tags`, {
    method: "POST",
    body: data as any,
  });
};

// Update Tag
export const updateTag = async (
  data: { id: number; name: string }
): Promise<ApiResponse<Tag>> => {
  return await fetchInterceptor<Tag>(`${API_URL}/api/v1/Tags`, {
    method: "PUT",
    body: data as any,
  });
};

// Delete Tag
export const deleteTag = async (
  data: { id: number }
): Promise<ApiResponse<null>> => {
  return await fetchInterceptor<null>(`${API_URL}/api/v1/Tags`, {
    method: "DELETE",
    body: data as any,
  });
};

// Get All Tags
export const fetchTags = async (): Promise<ApiResponse<Tag[]>> => {
  return await fetchInterceptor<Tag[]>(`${API_URL}/api/v1/Tags`, {
    method: "GET",
  });
};

export const searchTags = async (
  params: { keyword?: string; page?: number; pageSize?: number }
): Promise<ApiResponse<PageResponse<TagSearchResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.append("Keyword", params.keyword);
  if (params.page) query.append("Page", params.page.toString());
  if (params.pageSize) query.append("PageSize", params.pageSize.toString());

  return await fetchInterceptor<PageResponse<TagSearchResponse>>(
    `${API_URL}/api/v1/Tags/search_tag?${query.toString()}`,
    { method: "GET" }
  );
};
