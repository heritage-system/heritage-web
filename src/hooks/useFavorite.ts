import { addFavorite, removeFavorite } from "../services/favoriteService";
import { authToast } from "../utils/authToast";

export const addToFavorites = async (heritageId: number): Promise<boolean> => {
  try {
    const response = await addFavorite({ heritageId });
    const success = (typeof response.result === "boolean" ? response.result : false) || (response.code >= 200 && response.code < 300);
    if (success) {
      authToast.success("Đã thêm vào danh sách yêu thích");
      return true;
    } else {
      authToast.error("Không thể thêm vào danh sách yêu thích");
      return false;
    }
  } catch (error) {
    authToast.error("Có lỗi xảy ra khi thêm vào danh sách yêu thích");
    return false;
  }
};

export const removeFromFavorites = async (heritageId: number): Promise<boolean> => {
  try {
    const response = await removeFavorite(heritageId);
    const success = (typeof response.result === "boolean" ? response.result : false) || (response.code >= 200 && response.code < 300);
    if (success) {
      authToast.success("Đã xóa khỏi danh sách yêu thích");
      return true;
    } else {
      authToast.error("Không thể xóa khỏi danh sách yêu thích");
      return false;
    }
  } catch (error) {
    authToast.error("Có lỗi xảy ra khi xóa khỏi danh sách yêu thích");
    return false;
  }
};