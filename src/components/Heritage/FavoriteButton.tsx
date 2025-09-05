import React, { useEffect, useState } from "react";
import { addToFavorites, removeFromFavorites } from "../../hooks/useFavorite";
import { getFavorites } from "../../services/favoriteService";

interface FavoriteButtonProps {
  heritageId: number;
  isFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  heritageId,
  isFavorite,
  onToggle,
  size = "md",
  className = "",
}) => {
  const [favorite, setFavorite] = useState<boolean>(!!isFavorite);
  const [loading, setLoading] = useState<boolean>(false);

  // Auto-load favorite state if not provided (uses paginated FavoriteListResponse)
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (typeof isFavorite === "boolean") return;
      try {
        let page = 1;
        const pageSize = 50;
        let found = false;
        // Loop pages until found or all pages checked
        while (!found) {
          const res = await getFavorites(page, pageSize);
          const paged = res?.result;
          const items: any[] = Array.isArray(paged?.items)
            ? (paged!.items as any[])
            : [];
          if (items.some((f: any) => f.heritageId === heritageId)) {
            found = true;
            break;
          }
          const totalPages = paged?.totalPages ?? page;
          if (page >= totalPages) break;
          page += 1;
        }
        if (isMounted) setFavorite(found);
      } catch {
        // silently ignore; keep default false
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [heritageId, isFavorite]);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      let success = false;
      if (favorite) {
        success = await removeFromFavorites(heritageId);
      } else {
        success = await addToFavorites(heritageId);
      }

      if (success) {
        setFavorite(!favorite);
        onToggle?.(!favorite);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full transition-all duration-200
        ${
          favorite
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        shadow-sm hover:shadow-md
        ${className}
      `}
      title={favorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      {loading ? (
        <div className="animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <svg
          className={`${
            size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"
          }`}
          fill={favorite ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
};

export default FavoriteButton;
