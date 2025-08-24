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
  '/api/v1/specialty',
  '/api/v1/heritageLocation/map',
  
];

function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some(
    (endpoint) => url.includes(endpoint) || url.endsWith(endpoint)
  );
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

    const data = await response.json();
    tokenStorage.setAccessToken(data.data.accessToken);
    return true;
  } catch (error) {
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
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  const isPublic = options.skipAuth || isPublicEndpoint(url);

  if (!isPublic) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    let response = await fetch(url, requestOptions);

    // Nếu access token hết hạn -> refresh rồi retry
    if (response.status === 401 && !options.skipAuth) {
      if (!refreshingPromise) {
        refreshingPromise = refreshAccessToken();
      }
      try {
        await refreshingPromise;
        requestOptions.headers = {
          ...requestOptions.headers,
          Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
        };
        response = await fetch(url, requestOptions);
      } catch (error) {
        console.error('Token refresh failed:', error);
        window.location.href = '/login';
        throw { Code: 401, Message: 'Unauthorized' };
      }
    }

    const data  = await response.json().catch(() => null);

      if (!response.ok) {
      // Luôn trả về ApiResponse<T>, không throw
      return {
        code: response.status,
        message: data?.Message || response.statusText,
      };
    }

    return {
      code: 200,
      message: data?.Message,
      result: data?.Result ?? data, // fallback
    };
  } catch (err) {
    return {
      code: -1,
      message: 'Network error occurred',
    };
  }
};