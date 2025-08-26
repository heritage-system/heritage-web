import { useState, useEffect, useCallback } from "react";
import { HeritageSearchResponse, HeritageSearchRequest } from "../types/heritage";
import { searchHeritage } from "../services/heritageService";

interface UseDiscoveryFiltersResult {
  heritages: HeritageSearchResponse[];
  loading: boolean;
  error: string | null;
  filters: HeritageSearchRequest;
  totalPages: number;
  totalElements: number;
  onFiltersChange: (changes: Partial<HeritageSearchRequest>, resetPage?: boolean) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const useDiscoveryFilters = (
  initialFilters: HeritageSearchRequest = {},
  debounceMs: number = 500
): UseDiscoveryFiltersResult => {
  const [heritages, setHeritages] = useState<HeritageSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<HeritageSearchRequest>({
    page: 1,
    pageSize: 12,
    ...initialFilters,
  });

  const [debouncedFilters, setDebouncedFilters] = useState<HeritageSearchRequest>(filters);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ✅ Debounce filter thay đổi
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [filters, debounceMs]);

  
  const fetchHeritages = useCallback(async (params: HeritageSearchRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchHeritage(params);
      if (response.code === 200 && response.result) {
        setHeritages(response.result.items);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      } else {
        setError(response.message || "Failed to fetch heritages");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeritages(debouncedFilters);
  }, [debouncedFilters, fetchHeritages]);


  const onFiltersChange = useCallback(
    (changes: Partial<HeritageSearchRequest>, resetPage: boolean = false) => {
      setFilters((prev) => ({
        ...prev,
        ...(resetPage ? { page: 1 } : {}),
        ...changes,
      }));
    },
    []
  );

  const onPageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const onPageSizeChange = useCallback((size: number) => {
    setFilters((prev) => ({ ...prev, page: 1, pageSize: size }));
  }, []);

  return {
    heritages,
    loading,
    error,
    filters,
    totalPages,
    totalElements,
    onFiltersChange,
    onPageChange,
    onPageSizeChange,
  };
};
