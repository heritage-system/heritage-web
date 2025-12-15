import { ContributorStatus, SortBy } from "./enum";

// Create
export interface ContributorCreateRequest {
  userId?: number;      
  bio?: string;
  expertise?: string;
  isPremiumEligible?: boolean
}



// Update
export interface ContributorUpdateRequest {
  phone?: string;
  address?: string;
  fullName?: string;
  dateOfBirth?: string;
  bio?: string;
  expertise?: string;
  status?: string;
  documentsUrl?: string;
  isPremiumEligible?: boolean
}

// Search
export interface ContributorSearchRequest {
  keyword?: string;
  status?: ContributorStatus;
  sortBy?: SortBy;
  page?: number;
  pageSize?: number;
}

// ------------------ Responses ------------------

// Contributor item (paged list)
export interface ContributorSearchResponse {
  id: number;
  bio?: string;
  expertise?: string;
  status: string; 
  updatedAt?: string;

  userId: number;
  userFullName?: string;
  userEmail?: string;

  count: number;  

  expertiseUnsigned?: string;
  fullNameUnsigned?: string;
}

// Contributor detail
export interface ContributorResponse {
  id: number;
  bio?: string;
  expertise?: string;
  documentsUrl?: string;
  status: string;
  isPremiumEligible: boolean;
  userId: number;
  userName: string;
  email: string;
  phone?: string;
  address?: string;
  fullName: string;
  dateOfBirth?: string; 

  createdAt: string;   
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  createdByName?: string;
  createdByEmail?: string;
  updatedByName?: string;
  updatedByEmail?: string;

  count: number;
  expertiseUnsigned?: string;
  fullNameUnsigned?: string;
}

export interface DropdownUserResponse {
  id: number;
  email?: string;
  fullName?: string;
}

// Request khi user apply
export interface ContributorApplyRequest {
  bio?: string;
  expertise?: string;
  documentsUrl?: string;
}

// Response sau khi apply
export interface ContributorApplyResponse {
  id: number;
  bio?: string;
  expertise?: string;
  documentsUrl?: string;
  status: ContributorStatus | string; // "APPLIED" | "APPROVED" | "ACTIVE" | "REJECTED" | "SUSPENDED"
  createdAt: string;
}

export interface TrendingContributor {
  contributorId: number,
  contributorName: string,
  avatarUrl: string,
  totalPosts: number,
  totalViews: number,
  totalComments: number,
  totalSaves: number,
  score: number
}