import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { HeritageSearchRequest, HeritageSearchResponse, HeritageAdmin, HeritageDetailResponse,
  HeritageDetail, HeritageName, HeritageCreateRequest, HeritageCreateResponse, HeritageRelatedResponse, HeritageRelatedRequest, HeritageResponse, HeritageOverviewSearchRequest, HeritageUpdateRequest} from "../types/heritage";
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
    `${API_URL}/api/Heritage/search_heritage?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};

export const getHeritageDetail = async (id: number): Promise<ApiResponse<HeritageDetailResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });

  return await fetchInterceptor<HeritageDetailResponse>(
    `${API_URL}/api/Heritage/heritage_detail?${queryString}`,
    {
      method: "GET",
    }
  );
};


export async function fetchHeritages(params: {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: number;
  tagIds?: number[];
}): Promise<ApiResponse<PageResponse<HeritageAdmin>>> {
  const query = new URLSearchParams();

  query.append("page", params.page.toString());
  query.append("pageSize", params.pageSize.toString());

  if (params.keyword) {
    query.append("keyword", params.keyword);
  }

  if (params.categoryId !== undefined && params.categoryId !== null) {
    query.append("categoryId", params.categoryId.toString());
  }

  if (params.tagIds && params.tagIds.length > 0) {
    params.tagIds.forEach(id => query.append("tagIds", id.toString()));
  }

  const response = await fetchInterceptor<PageResponse<HeritageAdmin>>(
    `${API_URL}/api/Heritage/all?${query.toString()}`,
    {
      method: "GET",
    }
  );

  return response;
}

export const fetchHeritageDetail = async (
  id: number
): Promise<ApiResponse<HeritageDetail>> => {
  const response = await fetchInterceptor<HeritageDetail>(
    `${API_URL}/api/Heritage/id?id=${id}`,
    { method: "GET" }
  );

  return response;
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
  keyword?: string
): Promise<ApiResponse<HeritageName[]>> => {
  const query = new URLSearchParams();

  if (keyword) query.append("keyword", keyword);

  return await fetchInterceptor<HeritageName[]>(
    `${API_URL}/api/Heritage/get_list_heritage_name?${query.toString()}`,
    { method: "GET" }
  );
};

export const createHeritage = async (
  data: HeritageCreateRequest
): Promise<ApiResponse<HeritageCreateResponse>> => {
  return await fetchInterceptor<HeritageCreateResponse>(
    `${API_URL}/api/Heritage/create`,
    {
      method: "POST",
      body: data as any,
    }
  );
};

export const getHeritageRelated = async (
  params: HeritageRelatedRequest
): Promise<ApiResponse<HeritageRelatedResponse[]>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<HeritageRelatedResponse[]>(
    `${API_URL}/api/Heritage/heritage_related?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};

export const updateHeritage = async (
  data: HeritageUpdateRequest
): Promise<ApiResponse<HeritageResponse>> => {
  return await fetchInterceptor<HeritageResponse>(
    `${API_URL}/api/Heritage/update`,
    {
      method: "PUT",
      body: data as any,
    }
  );
};

export const getHeritageById = async (
  id: number
): Promise<ApiResponse<HeritageResponse>> => {
  const response = await fetchInterceptor<HeritageResponse>(
    `${API_URL}/api/Heritage/id?id=${id}`,
    {
      method: "GET",
    }
  );

  return response;
};


export const getAllHeritages = async (
  params: HeritageOverviewSearchRequest
): Promise<ApiResponse<PageResponse<HeritageResponse>>> => {
  const query = new URLSearchParams();

  // Required parameters
  query.append("Page", params.page.toString());
  query.append("PageSize", params.pageSize.toString());

  // Optional parameters
  if (params.keyword) {
    query.append("Keyword", params.keyword);
  }

  if (params.categoryId !== undefined && params.categoryId !== null) {
    query.append("CategoryId", params.categoryId.toString());
  }

  if (params.tagIds && params.tagIds.length > 0) {
    params.tagIds.forEach(id => query.append("TagIds", id.toString()));
  }

  if (params.sortBy !== undefined && params.sortBy !== null) {
    query.append("SortBy", params.sortBy.toString());
  }

  return await fetchInterceptor<PageResponse<HeritageResponse>>(
    `${API_URL}/api/Heritage/all?${query.toString()}`,
    { method: "GET" }
  );
};

const getAuthToken = (): string | null => {
  // Thử tất cả các nơi có thể lưu token
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    null
  );
};

export const exportHeritages = async (
  params: HeritageOverviewSearchRequest
): Promise<void> => {
  const query = new URLSearchParams();

  // Required parameters
  query.append("Page", params.page.toString());
  query.append("PageSize", params.pageSize.toString());

  // Optional parameters
  if (params.keyword) {
    query.append("Keyword", params.keyword);
  }

  if (params.categoryId !== undefined && params.categoryId !== null) {
    query.append("CategoryId", params.categoryId.toString());
  }

  if (params.tagIds && params.tagIds.length > 0) {
    params.tagIds.forEach(id => query.append("TagIds", id.toString()));
  }

  if (params.sortBy !== undefined && params.sortBy !== null) {
    query.append("SortBy", params.sortBy.toString());
  }

  // Get token
  const token = getAuthToken();
  
  console.log("Export Debug:");
  console.log("- Token exists:", !!token);
  console.log("- Token preview:", token ? `${token.substring(0, 20)}...` : 'null');
  console.log("- All localStorage keys:", Object.keys(localStorage));
  console.log("- API URL:", `${API_URL}/api/Heritage/export?${query.toString()}`);
  
  if (!token) {
    throw new Error("Vui lòng đăng nhập lại. Token không tồn tại.");
  }

  try {
    const response = await fetch(
      `${API_URL}/api/Heritage/export?${query.toString()}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Export Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Log thêm để debug
        console.error("401 Error - Token used:", token?.substring(0, 30));
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
      }
      
      // Try to parse error message from backend
      try {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.message || `Xuất dữ liệu thất bại: ${response.status}`);
      } catch (parseError) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`Xuất dữ liệu thất bại: ${response.status} ${response.statusText}`);
      }
    }

    const blob = await response.blob();
    console.log("Blob received:", blob.size, "bytes");
    
    const filename = `Heritages_Export_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Download file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log("File downloaded successfully:", filename);
  } catch (error: any) {
    console.error("Export error details:", error);
    throw error;
  }
};