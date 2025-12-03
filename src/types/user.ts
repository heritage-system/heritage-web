import { UserStatus, SortBy, StaffRole } from './enum';

export interface UserCreationRequest {
    email: string;
    username: string;
    password: string;
    fullName: string;   
   
}

export interface UserCreationResponse {
    email: string;
    username: string;   
    fullName: string; 
    userType: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
}

export enum Gender {
    Male = 0,
    Female = 1,
    Other = 2,
}

export interface PatientDetailResponse {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    dob: string;
    gender?: Gender;
    address?: string;
    enable2FA?: boolean;
}


export interface PatientDetailRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    dob: string; // ISO date string (DateOnly from backend)
    gender?: Gender;
    address?: string;
}

export interface PatientDTOResponse {
  id: number;
  firstName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  recentAppointments: AppointmentSummary[];
}

export interface AppointmentSummary {
  appointmentId: number;
  patient: {
    patientId: number;
    fullName: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
  };
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reasonForVisit: string;
  consultationFee: number;
  totalFee: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  userName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  userName: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  isPremium?: boolean;
  isContributor: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserSearchResponse {
  id: number;
  userName: string;
  email: string;
  userStatus: UserStatus;
  roleId: number;
  roleName?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;                
  updatedAt: string;                
}

export interface UserSearchRequest {
  keyword?: string;
  status?: UserStatus;
  role?: string;                   
  sortBy?: SortBy;
  page?: number;
  pageSize?: number;
}

export interface UserCreationResponse {
  username: string;
  email: string;
  fullName: string;
  userType: string;                
}

export interface UserCreationByAdminRequest {
  username: string;
  email: string;
  fullName: string;
  address?: string,
  phone?: string,
  dateOfBirth?:string,
  roleName?: string;   
  // Dành cho Staff
  staffRole?: StaffRole;
  canManageEvents?: boolean;
  canReplyReports?: boolean;
  canAssignTasks?: boolean;
  // Dành cho Contributor
  bio?: string;
  expertise?: string;
  isPremiumEligible?: boolean;
}

export interface UserDetailResponse {
  id: number;
  userName: string;
  email: string;
  phone?: string;
  address?: string;
  fullName: string;
  dateOfBirth?: string;             
  avatarUrl?: string;
  userStatus: UserStatus;
  roleId: number;
  roleName?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;

  // Thống kê hoạt động
  numberOfFavorites: number;
  numberOfHeritageReviews: number;
  numberOfReports: number;
  numberOfSubscriptions: number;
  numberOfContributionSaves: number;
  numberOfContributionReviews: number;
  numberOfContributionReports: number;
}

