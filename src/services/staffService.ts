import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import {
  StaffSearchRequest,
  StaffSearchResponse,
  StaffDetailResponse,
  StaffUpdateRequest,
} from "../types/staff";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export const searchStaffForAdmin = async (
  params: StaffSearchRequest
): Promise<ApiResponse<PageResponse<StaffSearchResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword?.trim()) {
    query.append("keyword", params.keyword.trim());
  }
  if (params.status !== undefined && params.status !== null) {
    query.append("status", params.status.toString());
  }
  if (params.staffRole !== undefined && params.staffRole !== null) {
    query.append("staffRole", params.staffRole.toString());
  }
  if (params.sortBy) {
    query.append("sortBy", params.sortBy);
  }
  if (params.page !== undefined) {
    query.append("page", params.page.toString());
  }
  if (params.pageSize !== undefined) {
    query.append("pageSize", params.pageSize.toString());
  }
  const url = `${API_URL}/api/v1/staffs/search_staff?${query.toString()}`;

  return await fetchInterceptor<PageResponse<StaffSearchResponse>>(url, {
    method: "GET",
  });
};

export const getStaffDetailForAdmin = async (
  staffId: number
): Promise<ApiResponse<StaffDetailResponse>> => {
  return await fetchInterceptor<StaffDetailResponse>(
    `${API_URL}/api/v1/staffs/staff_detail?id=${staffId}`,
    {
      method: "GET",
    }
  );
};

export const updateStaffForAdmin = async (
  staffId: number,
  data: StaffUpdateRequest
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/staffs/${staffId}/update`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
};