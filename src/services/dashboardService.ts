import { ApiResponse } from "../types/apiResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export interface ExecutiveDashboardStats {
  users: {
    total: number;
    employees: number;
    contributors: number;
  };
  heritage: {
    totalHeritage: number;
    categories: number;
    quizzes: number;
  };
  contributions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export async function fetchExecutiveDashboard(): Promise<ApiResponse<ExecutiveDashboardStats>> {
  return await fetchInterceptor<ExecutiveDashboardStats>(`${API_URL}/api/v1/dashboard/executive`, {
    method: "GET",
  });
}

