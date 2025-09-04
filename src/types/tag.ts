// src/types/tag.ts

export interface Tag {
  id: number;
  name: string;
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
  createByName?: string;
  createByEmail?: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedByEmail?: string;
  createdAt: string;
  updatedAt: string;
  count: number; // number of linked heritages
}