import { addFavorite, removeFavorite } from "../services/favoriteService";
import toast from "react-hot-toast";

export const addToFavorites = async (heritageId: number): Promise<boolean> => {
  try {
    const response = await addFavorite({ heritageId });
    const success = (typeof response.result === "boolean" ? response.result : false) || (response.code >= 200 && response.code < 300);
    if (success) {
      toast.success("Đã thêm vào danh sách yêu thích");
      return true;
    } else {
      toast.error("Không thể thêm vào danh sách yêu thích");
      return false;
    }
  } catch (error) {
    toast.error("Có lỗi xảy ra khi thêm vào danh sách yêu thích");
    return false;
  }
};

export const removeFromFavorites = async (heritageId: number): Promise<boolean> => {
  try {
    const response = await removeFavorite(heritageId);
    const success = (typeof response.result === "boolean" ? response.result : false) || (response.code >= 200 && response.code < 300);
    if (success) {
      toast.success("Đã xóa khỏi danh sách yêu thích");
      return true;
    } else {
      toast.error("Không thể xóa khỏi danh sách yêu thích");
      return false;
    }
  } catch (error) {
    toast.error("Có lỗi xảy ra khi xóa khỏi danh sách yêu thích");
    return false;
  }
};