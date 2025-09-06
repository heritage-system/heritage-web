// src/services/categoryService.ts
import { ApiResponse } from "../types/apiResponse";
import { Category, CategorySearchRequest, CategorySearchResponse } from "../types/category";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { PageResponse } from "@/types/pageResponse";
/**
 * Fetch all categories (no filters)
 */
export const fetchCategories = async (): Promise<ApiResponse<Category[]>> => {
  return await fetchInterceptor<Category[]>(
    `${API_URL}/api/v1/Category`,
    { method: "GET" }
  );
};

/**
 * Fetch categories with search, paging, and sorting
 */
export const searchCategories = async (
  params: CategorySearchRequest
): Promise<ApiResponse<PageResponse<CategorySearchResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.append("Keyword", params.keyword);
  if (params.sortBy) query.append("SortBy", params.sortBy);
  if (params.page) query.append("Page", params.page.toString());
  if (params.pageSize) query.append("PageSize", params.pageSize.toString());


  return await fetchInterceptor<PageResponse<CategorySearchResponse>>(
    `${API_URL}/api/v1/Category/search_categories?${query.toString()}`,
    { method: "GET" }
  );
};

/**
 * Create a category
 */
export const createCategory = async (data: { name: string; description: string }) => {
  return await fetchInterceptor<ApiResponse<Category>>(
    `${API_URL}/api/v1/Category`,
    {
      method: "POST",
      body: data as any,
      headers: { "Content-Type": "application/json" },
    }
  );
};

/**
 * Update a category
 */
export const updateCategory = async (data: { id: number; name: string; description: string }) => {
  return await fetchInterceptor<ApiResponse<Category>>(
    `${API_URL}/api/v1/Category`,
    {
      method: "PUT",
      body: data as any,
      headers: { "Content-Type": "application/json" },
    }
  );
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: number) => {
  return await fetchInterceptor<ApiResponse<Category>>(
    `${API_URL}/api/v1/Category`,
    {
      method: "DELETE",
      body: {id} as any,
      headers: { "Content-Type": "application/json" },
    }
  );
};
