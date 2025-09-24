import { ApiResponse } from "../types/apiResponse";
import {
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
  UserCreationRequest,
  UserCreationResponse,
  ChangePasswordRequest
} from "../types/user";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export const registration = async (data: UserCreationRequest): Promise<ApiResponse<UserCreationResponse>> => {
    const response = await fetchInterceptor(`${API_URL}/api/v1/users`, {
        method: "POST",
        body: data as any,
    })

    //const result: ApiResponse<UserCreationResponse> = await response.json();
    return response;
} 

// Lấy thông tin profile
export const getProfile = async (): Promise<ApiResponse<UpdateProfileResponse>> => {
  return await fetchInterceptor<UpdateProfileResponse>(`${API_URL}/api/v1/users/profile`, {
    method: "GET",
  });
};


// Cập nhật profile
export const updateProfile = async (
  request: UpdateProfileRequest
): Promise<ApiResponse<UpdateProfileResponse>> => {
  return await fetchInterceptor<UpdateProfileResponse>(
    `${API_URL}/api/v1/users/profile`,
    {
      method: "PUT",
      body: request as any,
    }
  );
};

export const updatePassword = async (
  request: ChangePasswordRequest
): Promise<ApiResponse<any>> => {
  return await fetchInterceptor<any>(
    `${API_URL}/api/v1/users/change-password`,
    {
      method: "POST",
      body: request as any,
    }
  );
};