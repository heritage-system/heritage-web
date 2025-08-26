import React, { useState, useEffect } from "react";
import { FavoriteHeritage } from "../../types/favorite";
import { getFavorites } from "../../services/favoriteService";
import { authToast } from "../../utils/authToast";
import FavoriteButton from "../Heritage/FavoriteButton";

interface FavoriteHeritageListProps {
  onRefresh?: () => void;
}

const FavoriteHeritageList: React.FC<FavoriteHeritageListProps> = ({
  onRefresh,
}) => {
  const [favorites, setFavorites] = useState<FavoriteHeritage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      if (response.code === 200 && response.result) {
        setFavorites(response.result.items);
      } else {
        authToast.error("Không thể tải danh sách yêu thích");
      }
    } catch (error) {
      authToast.error("Có lỗi xảy ra khi tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (heritageId: number, isFavorite: boolean) => {
    if (!isFavorite) {
      // Item was removed from favorites, update the local state
      setFavorites((prev) =>
        prev.filter((fav) => fav.heritageId !== heritageId)
      );
      onRefresh?.();
    }
  };

  const handleRefresh = () => {
    fetchFavorites();
    authToast.info("Đang tải lại danh sách yêu thích...");
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">💔</div>
        <div className="text-gray-500">Chưa có di sản yêu thích nào</div>
        <div className="text-sm text-gray-400 mt-1 mb-4">
          Hãy khám phá và thêm di sản vào danh sách yêu thích của bạn
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🔄 Tải lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Tổng cộng: {favorites.length} di sản yêu thích
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          title="Tải lại danh sách"
        >
          🔄 Tải lại
        </button>
      </div>

      {/* Favorites list */}
      <div className="space-y-4">
        {favorites.map((favorite) => (
          <div
            key={favorite.heritageId}
            className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {favorite.heritageName}
                  </h3>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    {favorite.categoryName}
                  </span>
                  {favorite.isFeatured && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                      ⭐ Nổi bật
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {favorite.heritageDescription}
                </p>
                <div className="text-xs text-gray-400">
                  Đã thêm vào{" "}
                  {new Date(favorite.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
              <FavoriteButton
                heritageId={favorite.heritageId}
                isFavorite={true}
                onToggle={(isFavorite) =>
                  handleFavoriteToggle(favorite.heritageId, isFavorite)
                }
                size="md"
                className="ml-4"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteHeritageList;
