import { ContributorStatus, SortBy } from "./enum";

// Create
export interface ContributorCreateRequest {
  userId?: number;      
  bio?: string;
  expertise?: string;
}

// Update
export interface ContributorUpdateRequest {
  bio?: string;
  expertise?: string;
  verified: boolean;
  status: ContributorStatus;
}

// Search
export interface ContributorSearchRequest {
  keyword?: string;
  verified?: boolean;
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
  verified: boolean;
  status: ContributorStatus;
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
  verified: boolean;
  status: ContributorStatus;

  userId: number;
  userFullName?: string;
  userEmail?: string;

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