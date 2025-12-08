// src/utils/storage.ts
import L from "leaflet";
import {HeritageName} from "../types/heritage"
// --- Token Storage ---
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
  setRefreshToken: (token: string) => localStorage.setItem("refreshToken", token),
  clearAccessToken: () => localStorage.removeItem("accessToken"),
  getUserName: () => localStorage.getItem("userName"),
  getAvatarUrl: () => localStorage.getItem("avatarUrl"),
  setUserName: (username: string) => localStorage.setItem("userName", username),
  setAvatarUrl: (avatar: string) => localStorage.setItem("avatarUrl", avatar),
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

// ---------------- HERITAGE NAME LIST STORAGE ----------------

const HERITAGE_LIST_KEY = "heritage-name-list";

export const heritageNameStorage = {
  save: (list: HeritageName[]) => {
    localStorage.setItem(HERITAGE_LIST_KEY, JSON.stringify(list));
  },

  load: (): HeritageName[] | null => {
    try {
      const raw = localStorage.getItem(HERITAGE_LIST_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      // Validate structure
      if (Array.isArray(parsed)) {
        return parsed.filter((x: any) =>
          typeof x.id === "number" &&
          typeof x.name === "string" &&
          typeof x.nameUnsigned === "string"
        ) as HeritageName[];
      }

      return null;
    } catch {
      return null;
    }
  },

  clear: () => localStorage.removeItem(HERITAGE_LIST_KEY),
};

export function getOrCreateClientUuid(): string {
  const KEY = "client_uuid";

  let uuid = localStorage.getItem(KEY);
  if (uuid) return uuid;

  uuid = crypto.randomUUID();
  localStorage.setItem(KEY, uuid);

  return uuid;
}
