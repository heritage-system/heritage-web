import { ApiResponse } from "../types/apiResponse";
import {
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
  UserCreationRequest,
  UserCreationResponse,
  ChangePasswordRequest,
  UserSearchRequest,
  UserSearchResponse,
  UserDetailResponse,
  UserCreationByAdminRequest,
} from "../types/user";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { UserStatus } from "../types/enum";
import { PageResponse } from "../types/pageResponse";

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

export const searchMembersForAdmin = async (
  params: UserSearchRequest
): Promise<ApiResponse<PageResponse<UserSearchResponse>>> => {
  const searchParams = new URLSearchParams();

  if (params.keyword) searchParams.append("keyword", params.keyword);       
  if (params.status !== undefined) searchParams.append("status", params.status.toString());
  if (params.role) searchParams.append("role", params.role);
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString());

  const url = `${API_URL}/api/v1/users/search_member?${searchParams.toString()}`;
  
  return await fetchInterceptor<PageResponse<UserSearchResponse>>(url, {
    method: "GET",
  });
};

export const createUserByAdmin = async (
  data: UserCreationByAdminRequest
): Promise<ApiResponse<UserCreationResponse>> => {
  return await fetchInterceptor<UserCreationResponse>(
    `${API_URL}/api/v1/users/create_user`,
    {
      method: "POST",
      body: data as any,
    }
  );
};

export const getUserDetailForAdmin = async (
  userId: number
): Promise<ApiResponse<UserDetailResponse>> => {
  return await fetchInterceptor<UserDetailResponse>(
    `${API_URL}/api/v1/users/user_detail?id=${userId}`,
    {
      method: "GET",
    }
  );
};

export const changeUserStatusForAdmin = async (
  userId: number,
  status: UserStatus
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
  `${API_URL}/api/v1/users/${userId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", 
      },
      body: JSON.stringify(status),
    }
  );
};