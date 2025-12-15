export interface SignInRequest {
    emailOrUsername: string;
    password: string;
    remember: boolean;
}

export interface SignInResponse {
    accessToken: string;
    refreshToken: string;
    userType: string;
    tokenType: string;
    twoFaStep: number
    userName: string;
    avatarUrl: string;
}

export interface TwoFASetupResponse {
    code: number,
    result: string
}

export interface ForgotPasswordRequest {
    email: string
}

export interface ForgotPasswordResponse {
    expiresAt: string,
    used: boolean,
    attempts: number,
    createdIp: string
}

export interface ResetPasswordRequest {
    email: string,
    otp: string,
    newPassword: string
}

