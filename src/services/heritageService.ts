import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { HeritageSearchRequest, HeritageSearchResponse, SelectOption, HeritageDetail } from "../types/heritage";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { HeritageApiResponse } from "../types/heritage";

export const searchHeritage = async (
  params: HeritageSearchRequest
): Promise<ApiResponse<PageResponse<HeritageSearchResponse>>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<PageResponse<HeritageSearchResponse>>(
    `${API_URL}/api/v1/users/search_heritage?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};
export const getHeritageDetail = async (id: number): Promise<ApiResponse<HeritageSearchResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });

  return await fetchInterceptor<HeritageSearchResponse>(
    `${API_URL}/api/v1/users/heritageDetail?${queryString}`,
    {
      method: "GET",
    }
  );
};


export async function fetchHeritages(params: {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: string;
  tagId?: string;
}): Promise<HeritageApiResponse> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    keyword: params.keyword || "",
    categoryId: params.categoryId || "",
    tagId: params.tagId || "",
  });

  const response = await fetch(`${API_URL}/api/Heritage/heritage?${query}`);
  if (!response.ok) {
    throw new Error("Failed to fetch heritages");
  }

  return response.json();
}

export async function fetchTotalHeritageCount(): Promise<number> {
  const response = await fetch(`${API_URL}/api/Heritage/heritage?page=1&pageSize=1`);
  const result: HeritageApiResponse = await response.json();
  return result.totalElements;
}

export const fetchHeritageDetail = async (id: number): Promise<HeritageDetail> => {
  const response = await fetch(`${API_URL}/api/Heritage/heritage/id?id=${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch heritage detail (status: ${response.status})`);
  }
  return response.json();
};

export const deleteHeritage = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/Heritage/heritage/delete?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Xoá di sản thất bại");
  }
};


