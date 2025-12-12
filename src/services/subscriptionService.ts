// services/subscriptionService.ts
import { ApiResponse } from "../types/apiResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  CreateSubscriptionRequest,
  CreateSubscriptionData,
  PaymentStatusData,
  ActiveSubscriptionData,
  SubscriptionResponse
} from "../types/subscription";

export const createSubscription = async (
  req: CreateSubscriptionRequest
): Promise<ApiResponse<CreateSubscriptionData>> => {
  // Backend C# expect PascalCase, map từ camelCase sang PascalCase
  const requestBody = {
    PackageId: req.packageId,
  };

  console.log('📦 Creating subscription with request:', requestBody);

  const response = await fetchInterceptor<CreateSubscriptionData>(
    `${API_URL}/api/v1/subscriptions/create`,
    {
      method: "POST",
      body: requestBody as any,
    }
  );

  if (response.code !== 200) {
    console.error('❌ Create subscription failed:', {
      code: response.code,
      message: response.message,
      requestBody,
    });
  }

  return response;
};

export const checkPaymentStatus = async (
  orderCode: number
): Promise<ApiResponse<PaymentStatusData>> => {
  console.log("Checking payment status (POST) for orderCode:", orderCode);

  return await fetchInterceptor<PaymentStatusData>(
    `${API_URL}/api/v1/subscriptions/payment/${orderCode}/check`,
    {
      method: "POST",
    }
  );
};

/**
 * Lấy thông tin subscription đang active của user
 * GET /api/v1/subscription/active
 */
export const getActiveSubscription = async (): Promise<
  ApiResponse<ActiveSubscriptionData>
> => {
  return await fetchInterceptor<ActiveSubscriptionData>(
    `${API_URL}/api/v1/subscriptions/active`,
    {
      method: "GET",
    }
  );
};

/**
 * Kiểm tra trạng thái payment theo orderCode
 * GET /api/v1/subscription/payment/{orderCode}
 */
export const getPaymentStatus = async (
  orderCode: number
): Promise<ApiResponse<PaymentStatusData>> => {
  console.log('Getting payment status for orderCode:', orderCode);
  
  return await fetchInterceptor<PaymentStatusData>(
    `${API_URL}/api/v1/subscriptions/payment/${orderCode}`, 
    {
      method: "GET",
    }
  );
};

/**
 * Hủy subscription
 * POST /api/v1/subscription/{subscriptionId}/cancel
 */
export const cancelSubscription = async (
  subscriptionId: number
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
    }
  );
};

export const getSubscriptionByUser = async (): Promise<
  ApiResponse<SubscriptionResponse[]>  
> => {
  console.log("🔎 Fetching subscription for current user...");

  return await fetchInterceptor<SubscriptionResponse[]>( 
    `${API_URL}/api/v1/subscriptions/SubscriptionByUserId`,
    { 
      method: "GET",
    }
  );
};

export const GetSubscriptions = async (): Promise<ApiResponse<SubscriptionResponse[]>> => {
  return await fetchInterceptor<SubscriptionResponse[]>(
    `${API_URL}/api/v1/subscriptions`,
    { method: "GET" }
  );
};

