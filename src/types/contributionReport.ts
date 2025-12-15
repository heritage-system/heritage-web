import { SortBy, ContributionStatus} from "./enum";


export interface ContributionReportCreationRequest {
  contributionId: number,
  reason: string
}
export interface ContributionReport {
  id: number;
  userId: number;
  contributionId: number;
  reason: string;
  createdAt: string;
  contributionName?: string; 
  userName?: string;
  startDate?: string; 
  endDate?: string;
  status?: string;
}

export interface ContributionReportSearchRequest {
  keyword?: string; 
  page?: number;
  pageSize?: number;
  startDate?: string; 
  endDate?: string;
  status?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onView?: (item: T) => void;
  onAnswer?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
}

export interface ContributionReportReply {
  id: number;
  contributionReportId: number;
  message: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}


export interface ContributionReportResponse {
  id: number;
  contributionId: number;
  userId: number;
  reason: string
}
