import { FavoriteHeritage, AddFavoriteRequest, RemoveFavoriteRequest, FavoriteListResponse, FavoriteHeritageList } from "../types/favorite";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { ApiResponse } from "../types/apiResponse";

export const getFavorites = async (): Promise<ApiResponse<FavoriteListResponse>> => {
  const data = await fetchInterceptor<FavoriteListResponse>(
    `${API_URL}/api/v1/favorites`,
    {
      method: "GET",
    }
  );

  return data;
};

// Alternative: if the API returns a list directly
export const getFavoritesList = async (): Promise<ApiResponse<FavoriteHeritageList>> => {
  const data = await fetchInterceptor<FavoriteHeritageList>(
    `${API_URL}/api/v1/favorites`,
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