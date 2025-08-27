import { ApiResponse } from "../types/apiResponse";
import { Tag } from "../types/tag";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export const fetchTags = async (): Promise<ApiResponse<Tag[]>> => {
   
    const response = await fetchInterceptor<Tag[]>(
    `${API_URL}/api/v1/Tags`,
    { method: "GET" }
    );

  return response;
};
