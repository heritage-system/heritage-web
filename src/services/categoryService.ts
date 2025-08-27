import { ApiResponse } from "../types/apiResponse";
import { Category } from "../types/category";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export const fetchCategories = async (): Promise<ApiResponse<Category[]>> => {
   
    const response = await fetchInterceptor<Category[]>(
    `${API_URL}/api/v1/Category`,
    { method: "GET" }
    );

  return response;
};
