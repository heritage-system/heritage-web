import { PremiumBenefitCreateRequest,PremiumBenefitResponse, PremiumPackageResponse,  PremiumPackageSearchRequest, PremiumPackageCreateRequest, PremiumPackageUpdateRequest } from "@/types/premiumPackage";
import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import { BenefitType } from "../types/enum"
export const getPremiumPackages = async (): Promise<ApiResponse<PremiumPackageResponse[]>> => {
  return await fetchInterceptor<PremiumPackageResponse[]>(
    `${API_URL}/api/v1/PremiumPackage`,
    { method: "GET" }
  );
};

export const getPremiumPackageById = async (id: number): Promise<ApiResponse<PremiumPackageResponse>> => {
  return await fetchInterceptor<PremiumPackageResponse>(
    `${API_URL}/api/v1/PremiumPackage/byId?id=${id}`,
    { method: "GET" }
  );
}

export const searchPremiumPackagesAsync = async (
  params: PremiumPackageSearchRequest
): Promise<ApiResponse<PageResponse<PremiumPackageResponse>>> => {

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
    } else {
        queryString.append(key, String(value));
    }
    });

    const response = await fetchInterceptor<PageResponse<PremiumPackageResponse>>(
    `${API_URL}/api/v1/PremiumPackage/search?${queryString.toString()}`,
    { method: "GET" }
    );

  return response;
};

export async function createPremiumPackage(
  req: PremiumPackageCreateRequest
): Promise<ApiResponse<PremiumPackageResponse>> {
  const formData = new FormData();

  formData.append("Name", req.Name);
  formData.append("Price", req.Price.toString());
  formData.append("DurationDays", req.DurationDays.toString());
  formData.append("MarketingMessage", req.MarketingMessage);

  // Ensure BenefitIds is an array and append each id
  if (Array.isArray(req.BenefitIds) && req.BenefitIds.length > 0) {
    req.BenefitIds.forEach((id) => {
      if (id != null && id !== undefined) {
        formData.append("BenefitIds", id.toString());
      }
    });
  }

  return fetchInterceptor<PremiumPackageResponse>(`${API_URL}/api/v1/PremiumPackage`, {
    method: "POST",
    body: formData,            
  });
}

export const updatePremiumPackage = async (
  payload: PremiumPackageUpdateRequest
): Promise<ApiResponse<PremiumPackageResponse>> => {
  const formData = new FormData();

  if (payload.Name != null) formData.append("Name", payload.Name);
  if (payload.Price != null) formData.append("Price", payload.Price.toString());
  if (payload.DurationDays != null) formData.append("DurationDays", payload.DurationDays.toString());
  if (payload.MarketingMessage != null) formData.append("MarketingMessage", payload.MarketingMessage);
  if (payload.IsActive != null) formData.append("IsActive", payload.IsActive.toString());

  // Always send BenefitIds array, even if empty (to clear all benefits)
  if (Array.isArray(payload.BenefitIds)) {
    payload.BenefitIds.forEach((id) => {
      if (id != null && id !== undefined) {
        formData.append("BenefitIds", id.toString());
      }
    });
  }

  return fetchInterceptor<PremiumPackageResponse>(
    `${API_URL}/api/v1/PremiumPackage?id=${payload.id}`,
    {
      method: "PUT",
      body: formData,
    }
  );
};


export const deletePremiumPackage = async (
  reviewId: number
): Promise<ApiResponse<boolean>> => {
  return await fetchInterceptor<boolean>(
    `${API_URL}/api/v1/PremiumPackage?id=${reviewId}`,
    { method: "DELETE" }
  );
};

export const getPremiumBenefits = async (): Promise<ApiResponse<any[]>> => {
  return await fetchInterceptor<any[]>(
    `${API_URL}/api/v1/PremiumBenefit`,
    { method: "GET" }
  );
}

export async function createPremiumBenefit(
  req: PremiumBenefitCreateRequest
): Promise<ApiResponse<PremiumBenefitResponse>> {
  const formData = new FormData();
  
  // Backend expects BenefitName enum (number: 0, 1, or 2)
  formData.append("BenefitName", req.BenefitName.toString());
  formData.append("BenefitType", req.BenefitType.toString());

  if (req.BenefitType === BenefitType.LIMITINCREASE) {
    formData.append("Value", req.Value?.toString() || "0"); 
  }

  return fetchInterceptor<PremiumBenefitResponse>(`${API_URL}/api/v1/PremiumBenefit`, {
    method: "POST",
    body: formData,
  });
}

export const getAllActivePackage = async (): Promise<ApiResponse<PremiumPackageResponse[]>> => {
  return await fetchInterceptor<PremiumPackageResponse[]>(
    `${API_URL}/api/v1/PremiumPackage/byActive`,
    { method: "GET" }
  );
};


