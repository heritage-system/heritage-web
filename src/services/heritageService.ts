import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { HeritageSearchRequest, HeritageSearchResponse, HeritageAdmin, HeritageDetail, HeritageName,PredictResponse} from "../types/heritage";
import { AI_API_URL,API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export const predictHeritage = async (
  file: File,
  params?: { top_k?: number; results?: number; threshold?: number }
): Promise<ApiResponse<PredictResponse>> => {
  const formData = new FormData();
  formData.append("file", file);

  const query = new URLSearchParams();
  if (params?.top_k) query.append("top_k", params.top_k.toString());
  if (params?.results) query.append("results", params.results.toString());
  if (params?.threshold) query.append("threshold", params.threshold.toString());

  return await fetchInterceptor<PredictResponse>(
    `${AI_API_URL}/predict?${query.toString()}`,
    {
      method: "POST",
      body: formData,
      // skipAuth: true, // 👉 Nếu predict API của bạn KHÔNG yêu cầu login thì bật dòng này
    }
  );
};

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


export const searchHeritageNames = async (
  keyword: string
): Promise<ApiResponse<HeritageName[]>> => {
  const query = new URLSearchParams();

  if (keyword) query.append("keyword", keyword);

  return await fetchInterceptor<HeritageName[]>(
    `${API_URL}/api/Heritage/get_list_heritage_name?${query.toString()}`,
    { method: "GET" }
  );
};






