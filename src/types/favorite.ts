export interface FavoriteHeritage {
  heritageId: number;
  heritageName: string;
  heritageDescription: string;
  categoryName: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface AddFavoriteRequest {
  heritageId: number;
}

export interface RemoveFavoriteRequest {
  heritageId: number;
}

export interface FavoriteListResponse {
  currentPages: number;
  pageSizes: number;
  totalPages: number;
  totalElements: number;
  items: FavoriteHeritage[];
}

// Alternative: if the API returns a list directly
export type FavoriteHeritageList = FavoriteHeritage[];