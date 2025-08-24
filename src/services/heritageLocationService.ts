import { ApiResponse } from "../types/apiResonse";
import { HeritageLocationResponse } from "../types/heritageLocation";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export const getHeritages = async (): Promise<ApiResponse<HeritageLocationResponse[]>> => {
  const response = await fetchInterceptor(`${API_URL}/api/v1/heritageLocation/map`, {
    method: "GET"
  });
  const result: ApiResponse<HeritageLocationResponse[]> = await response.json();
  return result;
};
