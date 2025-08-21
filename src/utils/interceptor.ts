// src/utils/fetchInterceptor.ts
import { API_URL } from './baseUrl';
import { tokenStorage } from './tokenStorage';

const PUBLIC_ENDPOINTS: string[] = [
  '/api/v1/auth/sign-in',
  '/api/v1/auth/outbound',
  '/api/v1/users',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/verify-email',
  '/api/v1/specialty',
  '/api/v1/doctors',
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

export const fetchInterceptor = async (
  url: string,
  options: FetchInterceptorOptions = {}
): Promise<Response> => {
  const requestOptions: RequestInit = {
    ...options,
  };

  requestOptions.headers = {
    'Content-Type': 'application/json',
    ...requestOptions.headers,
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

    if (response.status === 401 && !options.skipAuth) { // ✅ sửa ở đây
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
        console.log('Token refresh failed:', error);
        window.location.href = '/login'; // 🚀 thay cho next/navigation
      }
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        (responseData && responseData.message) ||
          `HTTP error! status: ${response.status}`
      );
    }

    return new Response(JSON.stringify(responseData), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};
