import { ContributorStatus, SortBy } from "./enum";

// Create
export interface ContributorCreateRequest {
  userEmail?: string;
  bio?: string;
  expertise?: string;
  documentsUrl?: string;
}

// Update
export interface ContributorUpdateRequest {
  bio?: string;
  expertise?: string;
  documentsUrl?: string;
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
  documentsUrl?: string;
  rating?: number;
  verified: boolean;
  status: ContributorStatus;
  updatedAt?: string;

  userId: number;
  userFullName?: string;
  userEmail?: string;

  count: number;
}

// Contributor detail
export interface ContributorResponse {
  id: number;
  bio?: string;
  expertise?: string;
  documentsUrl?: string;
  rating?: number;
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
}
