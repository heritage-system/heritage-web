import { StaffRole, StaffStatus, SortBy } from './enum';

export interface StaffSearchRequest {
  keyword?: string;
  status?: StaffStatus;
  staffRole?: StaffRole;
  sortBy?: SortBy;
  page?: number;
  pageSize?: number;
}

export interface StaffUpdateRequest {
  phone?: string;
  address?: string;
  fullName?: string;
  dateOfBirth?: string;
  staffStatus?: StaffStatus;
  staffRole?: StaffRole;
  canManageEvents?: boolean;
  canReplyReports?: boolean;
  canAssignTasks?: boolean;
}

export interface StaffSearchResponse {
  id: number;
  userName: string;
  email: string;
  staffStatus: StaffStatus;
  staffRole: StaffRole;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string; 
}

export interface StaffDetailResponse {
  id: number;
  userName: string;
  email: string;
  phone?: string;
  address?: string;
  fullName: string;
  dateOfBirth?: string; 
  avatarUrl?: string;
  staffStatus: StaffStatus;
  staffRole: StaffRole;
  startDate: string; 
  canManageEvents: boolean;
  canReplyReports: boolean;
  canAssignTasks: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;

  // Thống kê
  numberOfContributionAcceptances: number;
  numberOfReportReplies: number;
}