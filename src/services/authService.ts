import { SignInRequest, SignInResponse,ForgotPasswordRequest,ForgotPasswordResponse,ResetPasswordRequest } from "../types/auth";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { ApiResponse } from "../types/apiResponse";

export const loginUser = async (request: SignInRequest): Promise<ApiResponse<SignInResponse>> => {
  const data = await fetchInterceptor<SignInResponse>(
    `${API_URL}/api/v1/auth/sign-in`,
    {
      method: "POST",
      body: request as any,
    }
  );

  return data; 
};

// Login Google
export const SignInWithGoogle = async (code: string): Promise<any> => {
  const data = await fetchInterceptor<any>(
    `${API_URL}/api/v1/auth/outbound?code=${encodeURIComponent(code)}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );
  return data;
};

// Login Facebook
export const SignInWithFacebook = async (code: string): Promise<any> => {
  const data = await fetchInterceptor<any>(
    `${API_URL}/api/v1/auth/facebook?code=${encodeURIComponent(code)}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );
  return data;
};

export const forgotPassword = async (
  request: ForgotPasswordRequest
): Promise<ApiResponse<ForgotPasswordResponse>> => {
  const raw = await fetchInterceptor<ForgotPasswordResponse>(
    `${API_URL}/api/v1/auth/forgot-password`,
    {
      method: "POST",
      body: request as any,
    }
  );

  
  return raw;
};

export const resetPassword = async (
  request: ResetPasswordRequest
): Promise<ApiResponse<boolean>> => {
  const raw = await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/auth/reset-password`,
    {
      method: "POST",
      body: request as any,
    }
  );

  
  return raw;
};