// src/utils/fetchInterceptor.ts
import { API_URL } from './baseUrl';
import { tokenStorage } from './tokenStorage';
import { ApiResponse } from "../types/apiResponse";

const PUBLIC_ONLY_ENDPOINTS: string[] = [
  '/api/v1/auth/sign-in',
  '/api/v1/auth/outbound',
  '/api/v1/users',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/verify-email',  
  '/api/v1/Category',
  '/api/v1/Tags',
  '/api/v1/Reviews',
  '/api/v1/contributions/top_contribution_heritage_tag',
  '/api/v1/contributions/top_contributor',
  '/api/v1/contributions/contribution_related',
  '/api/Heritage/heritage_related',
  '/api/v1/panorama_tours/search_panorama_tour',
  '/api/v1/auth/confirm-email',
  '/api/Heritage/heritage_related',
  '/api/v1/PremiumPackage/byActive'
];
const OPTIONAL_AUTH_ENDPOINTS: string[] = [
  '/api/v1/contributions/get_contribution_detail',
  '/api/v1/contribution_reviews/get_contribution_reviews',
  '/api/v1/contributions/search_contribution',
  '/api/Heritage/search_heritage',
  '/api/Heritage/heritage_detail',
  '/api/v1/reviews/reviewByheritage',
  '/api/v1/quiz/search_quiz',
  '/api/v1/quiz/get_quiz_detail',
  '/api/v1/panorama_tours/get_panorama_tour_detail',
  '/api/v1/contributions/register_access_log'
]

// Helpers nhận diện body
const isFormData = (b: any): b is FormData => typeof FormData !== 'undefined' && b instanceof FormData;
const isBlobLike = (b: any) =>
  (typeof Blob !== 'undefined' && b instanceof Blob) ||
  (typeof ArrayBuffer !== 'undefined' && b instanceof ArrayBuffer) ||
  (typeof ReadableStream !== 'undefined' && b instanceof ReadableStream);
const isPlainObject = (b: any) =>
  b && typeof b === 'object' && !Array.isArray(b) && !isFormData(b) && !isBlobLike(b);

function getEndpointCategory(url: string): "public" | "optional" | "protected" {
  let path: string;
  try { path = new URL(url).pathname; } catch { path = url; }

  if (PUBLIC_ONLY_ENDPOINTS.includes(path)) return "public";
  if (OPTIONAL_AUTH_ENDPOINTS.includes(path)) return "optional";
  return "protected"; 
}

let refreshingPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return false; 

    const res = await fetch(`${API_URL}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken), // BE nhận string từ body
    });
    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json(); 
    // Chuẩn response: { code, message, result: { accessToken, refreshToken, ... } }
    const access = data?.result?.accessToken ?? data?.data?.accessToken;
    const refresh = data?.result?.refreshToken ?? data?.data?.refreshToken;

    if (typeof access !== "string" || typeof refresh !== "string") {
      console.warn("Refresh response không đúng định dạng:", data);
      return false;
    }

    tokenStorage.setAccessToken(access);
    tokenStorage.setRefreshToken(refresh);
    return true;
  } catch (e) {
    console.error("Refresh error:", e);
    return false;
  } finally {
    refreshingPromise = null;
  }
}


interface FetchInterceptorOptions extends RequestInit {
  skipAuth?: boolean;
}

export const fetchInterceptor = async <T = any>(
  url: string,
  options: FetchInterceptorOptions = {}
): Promise<ApiResponse<T>> => {

  const category = getEndpointCategory(url);

  // ====== Build headers đúng theo loại body ======
  const headers = new Headers(options.headers || {});
  const body = options.body as any;

  // Với FormData / Blob / Stream: KHÔNG set Content-Type -> browser tự thêm (kèm boundary)
  if (isFormData(body) || isBlobLike(body)) {
    headers.delete('Content-Type');
  } else if (isPlainObject(body)) {
    // Với JSON thuần: stringify + set Content-Type
    options.body = JSON.stringify(body);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  } else {
    // body null/undefined/string: giữ nguyên; không ép Content-Type
    if (typeof body === 'string') {
      // nếu muốn có JSON tự set ở nơi gọi; interceptor không đoán bừa
      // (giữ nguyên)
    } else {
      headers.delete('Content-Type');
    }
  }

  const token = tokenStorage.getAccessToken();
  if (category === "protected") {
    if (!token) {
      return { code: 401, message: "Unauthorized" };
    }
    headers.set("Authorization", `Bearer ${token}`);
  } else if (category === "optional") {
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const requestOptions: RequestInit = {
    ...options,
    headers, // dùng Headers đã xử lý bên trên
  };

  try {
    let response = await fetch(url, requestOptions);

    // refresh token nếu 401
    if (response.status === 401 && !options.skipAuth) {
      if (!refreshingPromise) {
        refreshingPromise = refreshAccessToken();
      }
      try {
        await refreshingPromise;
        const newToken = tokenStorage.getAccessToken();
        if (newToken) headers.set('Authorization', `Bearer ${newToken}`);
        console.log("Lan 2:" + newToken)
        response = await fetch(url, { ...requestOptions, headers });

      } catch (error) {
        console.error('Token refresh failed:', error);
        
        window.location.href = '/login';
        return { code: 401, message: 'Unauthorized' };
      }
    }

    // Không phải response nào cũng có body (204 No Content)
    const text = await response.text().catch(() => '');
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return {
        code: data?.code ?? response.status,
        message: data?.message ?? data?.Message ?? response.statusText,
      };
    }

    return {
      code: data?.code ?? response.status,
      message: data?.message ?? response.statusText,
      result: data?.result ?? data?.Result ?? data,
    };

  } catch {
    return {
      code: -1,
      message: 'Network error occurred',
    };
  }
};
