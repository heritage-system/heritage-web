import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { Report, ReportSearchRequest, ReportReply, CreateReportRequest, ReportResponse } from "../types/report";


export async function fetchReports(params: ReportSearchRequest): Promise<ApiResponse<PageResponse<Report>>> {
  const query = new URLSearchParams();

  if (params.page != null) query.append("page", String(params.page));
  if (params.pageSize != null) query.append("pageSize", String(params.pageSize));
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.startDate) query.append("startDate", params.startDate); 
  if (params.endDate) query.append("endDate", params.endDate); 
  if (params.status) query.append("status", params.status); 
  return await fetchInterceptor<PageResponse<Report>>(
    `${API_URL}/api/Report/all?${query.toString()}`,
    { method: "GET" }
  );
}

export async function getReportById(id: number): Promise<ApiResponse<Report>> {
  return await fetchInterceptor<Report>(
    `${API_URL}/api/Report/id?id=${id}`,
    { method: "GET" }
  );
}

export async function createReport(data: { heritageId: number, reason: string }): Promise<ApiResponse<Report>> {
  return await fetchInterceptor<Report>(`${API_URL}/api/Report/create`, {
    method: "POST",
    body: data as any,
  });
}


export async function answerReport(data: { reportId: number; answer: string }): Promise<ApiResponse<void>> {
  return await fetchInterceptor<void>(
    `${API_URL}/api/Report/answer`,
    {
      method: "POST",
      body: data as any,
    }
  );
}

export async function fetchRepliesByReportId(reportId: number): Promise<ApiResponse<ReportReply[]>> {
  return await fetchInterceptor<ReportReply[]>(
    `${API_URL}/api/ReportReply/by-reportId?reportId=${reportId}`,
    { method: "GET" }
  );
}



