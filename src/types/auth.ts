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
}

export interface TwoFASetupResponse {
    code: number,
    result: string
}