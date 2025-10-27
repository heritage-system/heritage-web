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

// Upload video
export const uploadVideo = async (file: File): Promise<ApiResponse<string>> => {
  const form = new FormData();
  form.append("file", file);

  const response = await fetchInterceptor(`${API_URL}/api/v1/file/upload/video`, {
    method: "POST",
    body: form,
  });
  return response;
};

// Upload tài liệu (document)
export const uploadDocument = async (file: File): Promise<ApiResponse<string>> => {
  const form = new FormData();
  form.append("file", file);

  const response = await fetchInterceptor(`${API_URL}/api/v1/file/upload/document`, {
    method: "POST",
    body: form,
  });
  return response;
};
