// src/types/tag.ts

export interface Tag {
  id: number;
  name: string;
  nameUnsigned: string;
  createdBy: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TagSearchRequest {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface TagSearchResponse {
  id: number;
  name: string;
  nameUnsigned: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  count: number; // number of linked heritages
}
