import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { Report, ReportSearchRequest, ReportReply } from "../types/report";


export async function fetchReports(params: ReportSearchRequest): Promise<ApiResponse<PageResponse<Report>>> {
  const query = new URLSearchParams();
  if (params.page != null) query.append("page", String(params.page));
  if (params.pageSize != null) query.append("pageSize", String(params.pageSize));
  if (params.keyword) query.append("keyword", params.keyword);

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

export async function deleteReport(id: number): Promise<ApiResponse<void>> {
  const res = await fetchInterceptor<void>(
    `${API_URL}/api/Report/delete?id=${id}`,
    { method: "DELETE" }
  );

  return res;
}

export async function createReport(data: { userId: number; heritageId: number; reason: string }): Promise<ApiResponse<Report>> {
  return await fetchInterceptor<Report>(
    `${API_URL}/api/Report/create`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function answerReport(payload: { reportId: number; answer: string }): Promise<ApiResponse<void>> {
  return await fetchInterceptor<void>(
    `${API_URL}/api/Report/answer`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json", Accept: "text/plain" },
    }
  );
}

export async function updateReport(
  id: number,
  data: Partial<{ userId: number; heritageId: number; reason: string }>
): Promise<ApiResponse<Report>> {
  return await fetchInterceptor<Report>(
    `${API_URL}/api/Report/update?id=${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function fetchRepliesByReportId(reportId: number): Promise<ApiResponse<ReportReply[]>> {
  return await fetchInterceptor<ReportReply[]>(
    `${API_URL}/api/ReportReply/by-reportId?reportId=${reportId}`,
    { method: "GET" }
  );
}



