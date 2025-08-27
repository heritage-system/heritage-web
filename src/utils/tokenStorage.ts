// src/utils/storage.ts
import L from "leaflet";

// --- Token Storage ---
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
  clearAccessToken: () => localStorage.removeItem("accessToken"),
};


const LOCAL_STORAGE_KEY = "discovery-map-view";

export const mapViewStorage = {
  save: (map: L.Map) => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ center, zoom })
    );
  },

  load: (): { center: L.LatLngTuple; zoom: number } | null => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    // Kiểm tra dữ liệu trước khi trả về
    if (
      typeof data?.center?.lat === "number" &&
      typeof data?.center?.lng === "number" &&
      typeof data?.zoom === "number"
    ) {
      return {
        center: [data.center.lat, data.center.lng] as L.LatLngTuple,
        zoom: data.zoom,
      };
    }

    return null; // fallback nếu dữ liệu hỏng
  } catch {
    return null;
  }
},
};
