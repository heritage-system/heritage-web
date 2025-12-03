import { BenefitType, SortBy, BenefitName } from "./enum";

export interface PremiumPackage {
    id: number;
    name: string;
    marketingMessage: string;
    price: number;
    currency: string;
    durationDays: number;
    IsActive: boolean;
    PackageBenefits: PackageBenefits[];
    CreatedBy: string;
    CreatedAt: string;
    UpdatedBy?: string;
    UpdatedAt?: string;
}

export interface PremiumPackageResponse {
    id: number;
    name: string;
    price: number;
    currency: string;
    durationDays: number;
    marketingMessage: string;
    isActive: boolean; 
    benefits: PremiumPackageBenefitResponse[];
}

export interface PackageBenefits {
    PackageId: number;
    BenefitId: number;
    Package: PremiumPackage;
    Benefit: PremiumBenefit
}
export interface PremiumBenefit {
    id: number;
    name: string;
    Value: number;
    BenefitType: BenefitType;
}

export interface PremiumPackageSearchRequest {
    name?: string;
    sortBy?: SortBy;             
    page?: number;
    pageSize?: number;
}

export interface PremiumPackageCreateRequest {
    Name: string;
    Price: number;
    DurationDays: number;
    MarketingMessage: string;
    BenefitIds: number[];
}

export interface PremiumPackageUpdateRequest {
    id: number,
    Name: string;
    Price: number;
    DurationDays: number;
    MarketingMessage: string;
    IsActive: boolean;
    BenefitIds: number[];
}

export interface PremiumPackageBenefitResponse {
    benefitId: number;
    BenefitName: BenefitName;
    benefitType: number;
    value?: number;
}

export interface PremiumBenefitCreateRequest {
    BenefitName: BenefitName;
    Value?: number;
    BenefitType: BenefitType;
}

export interface PremiumBenefitResponse {
    id: number;
    BenefitName: BenefitName;
    Value: number;
    BenefitType: BenefitType;
}




