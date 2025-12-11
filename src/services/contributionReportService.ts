import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { ContributionReport, ContributionReportSearchRequest, ContributionReportReply} from "../types/contributionReport";


export async function fetchContributionReports(params: ContributionReportSearchRequest): Promise<ApiResponse<PageResponse<ContributionReport>>> {
  const query = new URLSearchParams();

  if (params.page != null) query.append("page", String(params.page));
  if (params.pageSize != null) query.append("pageSize", String(params.pageSize));
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.startDate) query.append("startDate", params.startDate); 
  if (params.endDate) query.append("endDate", params.endDate); 
  if (params.status) query.append("status", params.status); 
  return await fetchInterceptor<PageResponse<ContributionReport>>(
    `${API_URL}/api/ContributionReport/all?${query.toString()}`,
    { method: "GET" }
  );
}

export async function getContributionReportById(id: number): Promise<ApiResponse<ContributionReport>> {
  return await fetchInterceptor<ContributionReport>(
    `${API_URL}/api/ContributionReport/id?id=${id}`,
    { method: "GET" }
  );
}


export async function answerContributionReport(data: { reportId: number; answer: string }): Promise<ApiResponse<void>> {
  return await fetchInterceptor<void>(
    `${API_URL}/api/ContributionReport/answer`,
    {
      method: "POST",
      body: data as any,
    }
  );
}

export async function fetchRepliesByContributionReportId(reportId: number): Promise<ApiResponse<ContributionReportReply[]>> {
  return await fetchInterceptor<ContributionReportReply[]>(
    `${API_URL}/api/ContributionReportReply/by-reportId?reportId=${reportId}`,
    { method: "GET" }
  );
}



