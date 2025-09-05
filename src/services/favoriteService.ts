import { FavoriteHeritage, AddFavoriteRequest, RemoveFavoriteRequest, FavoriteListResponse, FavoriteHeritageList } from "../types/favorite";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { ApiResponse } from "../types/apiResponse";
import {PageResponse}from "../types/pageResponse";

export const getFavorites = async (
  page?: number,
  pageSize?: number,
  searchName?: string
): Promise<ApiResponse<PageResponse<FavoriteHeritage>>> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (pageSize) params.set("pageSize", String(pageSize));
  if (searchName) params.set("searchName", searchName);
  const url = `${API_URL}/api/v1/favorites${params.toString() ? `?${params.toString()}` : ""}`;
  const data = await fetchInterceptor<PageResponse<FavoriteHeritage>>(
    url,
    {
      method: "GET",
    }
  );

  return data;
};



export const addFavorite = async (request: AddFavoriteRequest): Promise<ApiResponse<boolean>> => {
  const data = await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/favorites`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );

  return data;
};

export const removeFavorite = async (heritageId: number): Promise<ApiResponse<boolean>> => {
  const data = await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/favorites`,
    {
      method: "DELETE",
      body: JSON.stringify({ heritageId }),
    }
  );

  return data;
};