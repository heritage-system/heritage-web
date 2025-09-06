export interface Report {
  id: number;
  userId: number;
  heritageId: number;
  reason: string;
  createdAt: string;
  heritageName?: string; 
  userName?: string;
  startDate?: string; 
  endDate?: string;
  status?: string;
}

export interface ReportSearchRequest {
  keyword?: string; 
  page?: number;
  pageSize?: number;
  startDate?: string; 
  endDate?: string;
  status?: string;
}

export interface ReportItem {
  id: number;
  userId: number;
  heritageId: number;
  heritageName?: string; 
  reason: string;
  createdAt: string;
  userName?: string;
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

export interface ReportReply {
  id: number;
  reportId: number;
  message: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

