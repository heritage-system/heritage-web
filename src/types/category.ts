export interface Category {
  id: number;
  name: string;
  description: string;
  nameUnsigned: string;
  descriptionUnsigned: string;
  createdBy: string;
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date if you parse it
  count: number; // linked heritage count
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
    createdAt: string;
    updatedAt: string;
    count: number;
  }
