export interface SignInRequest {
    phoneOrEmail: string;
    password: string;
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