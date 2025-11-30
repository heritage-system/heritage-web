import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  PanoramaTourSearchForAdminResponse,
  PanoramaTourSearchRequest,
  PanoramaTourDetailForAdminResponse,
  PanoramaTourCreationRequest,
  PanoramaSceneCreationRequest,
  PanoramaTourSearchResponse,
  PanoramaTourDetailResponse,
  PanoramaSceneResponse
} from "../types/panoramaTour";

export const searchPanoramaTour = async (
  params: PanoramaTourSearchRequest
): Promise<ApiResponse<PageResponse<PanoramaTourSearchResponse>>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<PageResponse<PanoramaTourSearchResponse>>(
    `${API_URL}/api/v1/panorama_tours/search_panorama_tour?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};

export const getPanoramaTourDetail = async (id: number): Promise<ApiResponse<PanoramaTourDetailResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<PanoramaTourDetailResponse>(
    `${API_URL}/api/v1/panorama_tours/get_panorama_tour_detail?${queryString}`,
    {
      method: "GET",
    }
  );
};

export const searchPanoramaTourForAdmin = async (
  params: PanoramaTourSearchRequest
): Promise<ApiResponse<PageResponse<PanoramaTourSearchForAdminResponse>>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<PageResponse<PanoramaTourSearchForAdminResponse>>(
    `${API_URL}/api/v1/panorama_tours/get_panorama_tour?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};


export const getPanoramaTourDetailForAdmin = async (id: number): Promise<ApiResponse<PanoramaTourDetailForAdminResponse>> => {
  const queryString = new URLSearchParams({ id: id.toString() });
  return await fetchInterceptor<PanoramaTourDetailForAdminResponse>(
    `${API_URL}/api/v1/panorama_tours/get_panorama_tour_detail_for_admin?${queryString}`,
    {
      method: "GET",
    }
  );
};


export const createPanoramaTour = async (
  data: PanoramaTourCreationRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/panorama_tours/create`,
    { method: "POST", body: data as any }
  );
};

export const updatePanoramaTour = async ( 
  id: number,
  data: PanoramaTourCreationRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/panorama_tours/${id}/update`,
    { method: "PUT", body: data as any }
  );
};

export const deletePanoramaTour = async (id: number): Promise<ApiResponse<number | null>> => {
  return await fetchInterceptor<number | null>(
    `${API_URL}/api/v1/panorama_tours/${id}/delete`,
    { method: "DELETE" }
  );
};

export const createPanoramaScene = async (
  data: PanoramaSceneCreationRequest
): Promise<ApiResponse<number>> => {
  return await fetchInterceptor<number>(
    `${API_URL}/api/v1/panorama_tours/create_scene`,
    { method: "POST", body: data as any }
  );
};

export const updatePanoramaScene = async ( 
  id: number,
  data: PanoramaSceneCreationRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/panorama_tours/${id}/update_scene`,
    { method: "PUT", body: data as any }
  );
};

export const deletePanoramaScene = async (id: number): Promise<ApiResponse<number | null>> => {
  return await fetchInterceptor<number | null>(
    `${API_URL}/api/v1/panorama_tours/${id}/delete_scene`,
    { method: "DELETE" }
  );
};

export const unlockPanoramaScene = async (id: number): Promise<ApiResponse<PanoramaSceneResponse>> => {
  return await fetchInterceptor<PanoramaSceneResponse>(
    `${API_URL}/api/v1/panorama_tours/${id}/unlock_scene`,
    {
      method: "POST",
    }
  );
};