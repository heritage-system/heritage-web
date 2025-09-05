import { ApiResponse } from "../types/apiResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export const uploadImage = async (file: File): Promise<ApiResponse<string>> => {
    const form = new FormData();
    form.append("file", file); 

  const response = await fetchInterceptor(`${API_URL}/api/v1/file/upload/image`, {
    method: "POST",
    body: form,
  });
    return response;
} 

