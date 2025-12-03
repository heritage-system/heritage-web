// src/services/fileService.ts
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import type { ApiResponse } from "../types/apiResponse";

export async function uploadImage(
  file: File
): Promise<ApiResponse<string>> {
  const form = new FormData();
  form.append("file", file);

  return await fetchInterceptor<string>(`${API_URL}/api/v1/file/upload/image`, {
    method: "POST",
    body: form as any, // KHÔNG set Content-Type, để browser tự set boundary
  });
}

export async function uploadDocument(
  file: File
): Promise<ApiResponse<string>> {
  const form = new FormData();
  form.append("file", file);

  return await fetchInterceptor<string>(
    `${API_URL}/api/v1/file/upload/document`,
    {
      method: "POST",
      body: form as any,
    }
  );
}

export async function uploadVideo(
  file: File
): Promise<ApiResponse<string>> {
  const form = new FormData();
  form.append("file", file);

  return await fetchInterceptor<string>(
    `${API_URL}/api/v1/file/upload/video`,
    {
      method: "POST",
      body: form as any,
    }
  );
}
