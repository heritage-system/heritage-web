import { ApiResponse } from "../types/apiResponse";
import { HeritageLocationResponse } from "../types/heritageLocation";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";

export const getHeritages = async (): Promise<ApiResponse<HeritageLocationResponse[]>> => {
  try {
    console.log('🚀 Calling API:', `${API_URL}/api/v1/heritageLocation/map`);
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetchInterceptor<HeritageLocationResponse[]>(`${API_URL}/api/v1/heritageLocation/map`, { 
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('✅ API Response:', response);
    return response;
  } catch (error) {
    console.error('❌ API Error:', error);
    
    throw error;
  }
};
