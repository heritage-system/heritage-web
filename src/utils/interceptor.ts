// src/utils/fetchInterceptor.ts
import { API_URL } from './baseUrl';
import { tokenStorage } from './tokenStorage';
import { ApiResponse } from "../types/apiResponse";

const PUBLIC_ENDPOINTS: string[] = [
  '/api/v1/auth/sign-in',
  '/api/v1/auth/outbound',
  '/api/v1/users',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/verify-email',
  '/api/v1/users/search_heritage',
  '/api/v1/Category',
  '/api/v1/Tags',
  '/api/v1/users/heritageDetail',
  '/api/v1/Reviews',
];

// Helpers nhận diện body
const isFormData = (b: any): b is FormData => typeof FormData !== 'undefined' && b instanceof FormData;
const isBlobLike = (b: any) =>
  (typeof Blob !== 'undefined' && b instanceof Blob) ||
  (typeof ArrayBuffer !== 'undefined' && b instanceof ArrayBuffer) ||
  (typeof ReadableStream !== 'undefined' && b instanceof ReadableStream);
const isPlainObject = (b: any) =>
  b && typeof b === 'object' && !Array.isArray(b) && !isFormData(b) && !isBlobLike(b);

function isPublicEndpoint(url: string): boolean {
  let path: string;
  try { path = new URL(url).pathname; } catch { path = url; }
  return PUBLIC_ENDPOINTS.some(endpoint => path === endpoint);
}

let refreshingPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const accessToken = tokenStorage.getAccessToken();
  if (!accessToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Refresh failed');

    const data = await response.json().catch(() => null);
    // tuỳ cấu trúc BE của anh, em giữ nguyên:
    tokenStorage.setAccessToken(data?.data?.accessToken ?? data?.result ?? data?.accessToken);
    return true;
  } catch {
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

  const isPublic = options.skipAuth || isPublicEndpoint(url);

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

  if (!isPublic) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
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
