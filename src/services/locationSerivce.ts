
import {
Province
} from "../types/location";

export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    const response = await fetch("https://provinces.open-api.vn/api/v1/?depth=2");
    if (!response.ok) throw new Error("Lỗi khi fetch dữ liệu");
    const data: Province[] = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};