import { SignInRequest, SignInResponse } from "@/types/auth";
import { API_URL } from "@/utils/baseUrl";
import { fetchInterceptor } from "@/utils/interceptor";

export const loginUser = async (request: SignInRequest): Promise<SignInResponse> => {
    const response = await fetchInterceptor(
        `${API_URL}/api/v1/auth/sign-in`,
        {
            method: 'POST',
            body: JSON.stringify(request),
        },
    );

    const data = await response.json();
    const signInResponse = data.result as SignInResponse;
    return signInResponse;
};

export const SignInWithGoogle = async (code: string) => {
    const response = await fetchInterceptor(`${API_URL}/api/v1/auth/outbound?code=${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return data;
};

export const SignInWithFacebook = async (code: string) => {
    const response = await fetch(`${API_URL}/api/v1/auth/facebook?code=${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return data;
};