import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { HeritageSearchRequest, HeritageSearchResponse, HeritageAdmin, HeritageDetail} from "../types/heritage";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

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
}): Promise<ApiResponse<PageResponse<HeritageAdmin>>> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    keyword: params.keyword || "",
    categoryId: params.categoryId || "",
    tagId: params.tagId || "",
  });

  const response = await fetchInterceptor<PageResponse<HeritageAdmin>>(
    `${API_URL}/api/Heritage/all?${query}`,
    {
      method: "GET"
    }
  );

  return response;
}

export const fetchHeritageDetail = async (
  id: number
): Promise<ApiResponse<HeritageDetail>> => {
  const response = await fetchInterceptor<ApiResponse<HeritageDetail>>(
    `${API_URL}/api/Heritage/id?id=${id}`,
    {
      method: "GET"
    }
  );

  return response.result!;
};

export const deleteHeritage = async (id: number): Promise<ApiResponse<void>> => {
  const response = await fetchInterceptor<void>(
    `${API_URL}/api/Heritage/delete?id=${id}`,
    {
      method: "DELETE"
    }
  );

  if (response.code !== 200) {
    throw new Error(response.message || "Xoá di sản thất bại");
  }

  return response;
};








