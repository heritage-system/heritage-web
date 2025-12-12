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

export interface HeritageTopViewed {
  heritageId: number;
  name: string;
  favorites: number;
}

export interface ContributionTopViewed {
  contributionId: number;
  title: string;
  views: number;
}

export interface HeritageProvinceDistribution {
  province: string;
  count: number;
}

export interface ContributionTrendPoint {
  period: string; // YYYY-MM
  contributions: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface EngagementByCategory {
  category: string;
  views: number;
  saves: number;
  comments: number;
}

export interface YearlyGrowthPoint {
  year: number;
  heritage: number;
  users: number;
  contributions: number;
}

export async function fetchTopHeritageViewed(top = 5): Promise<ApiResponse<HeritageTopViewed[]>> {
  return await fetchInterceptor<HeritageTopViewed[]>(`${API_URL}/api/v1/dashboard/heritage/top-viewed?top=${top}`, {
    method: "GET",
  });
}

export async function fetchTopContributionsViewed(top = 5): Promise<ApiResponse<ContributionTopViewed[]>> {
  return await fetchInterceptor<ContributionTopViewed[]>(`${API_URL}/api/v1/dashboard/contributions/top-viewed?top=${top}`, {
    method: "GET",
  });
}

export async function fetchHeritageByProvince(): Promise<ApiResponse<HeritageProvinceDistribution[]>> {
  return await fetchInterceptor<HeritageProvinceDistribution[]>(`${API_URL}/api/v1/dashboard/heritage/by-province`, {
    method: "GET",
  });
}

export async function fetchContributionTrend(months = 6): Promise<ApiResponse<ContributionTrendPoint[]>> {
  return await fetchInterceptor<ContributionTrendPoint[]>(`${API_URL}/api/v1/dashboard/contributions/trend?months=${months}`, {
    method: "GET",
  });
}

export async function fetchEngagementByCategory(top = 6): Promise<ApiResponse<EngagementByCategory[]>> {
  return await fetchInterceptor<EngagementByCategory[]>(`${API_URL}/api/v1/dashboard/engagement/by-category?top=${top}`, {
    method: "GET",
  });
}

export async function fetchYearlyGrowth(years = 6): Promise<ApiResponse<YearlyGrowthPoint[]>> {
  return await fetchInterceptor<YearlyGrowthPoint[]>(`${API_URL}/api/v1/dashboard/growth/yearly?years=${years}`, {
    method: "GET",
  });
}

