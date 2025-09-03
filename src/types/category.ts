export interface Category {
  id: number;
  name: string;
  description: string;
}

export type SortBy = "NAMEASC" | "NAMEDESC";

export interface CategorySearchRequest {
  keyword?: string;
  sortBy?: SortBy;
  page?: number;
  pageSize?: number;
}

export interface CategorySearchResponse {
  id: number;
  name: string;
  description: string;
  nameUnsigned: string;
  descriptionUnsigned: string;
  createdBy: string;
  createByName?: string;
  createByEmail?: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedByEmail?: string;
  createdAt: string;
  updatedAt: string;
  count: number;
}