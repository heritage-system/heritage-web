import { BenefitType, SortBy, BenefitName, PaymentStatus, SubscriptionStatus } from "./enum";

export interface SubscriptionDto {
    userId: number,
    packageId: number,
    total: number,
    used: number,
    isUnlimited: boolean
}

// Subscription Entity
export interface Subscription {
  id: number;
  userId: number;
  packageId: number;
  startAt: string;
  endAt: string;
  status: SubscriptionStatus;
  package?: PremiumPackage;
  usageRecords?: SubscriptionUsage[];
  payments?: SubscriptionPayment[];
  createdAt: string;
  updatedAt?: string;
}

// Subscription Payment Entity
export interface SubscriptionPayment {
  id: number;
  subscriptionId: number;
  orderCode: number;
  paymentLinkId?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  transactionCode?: string;
  checkoutUrl?: string;
  qrCode?: string;
  paymentMethod?: string;
  paidAt?: string;
  canceledAt?: string;
  cancelReason?: string;
  webhookReceivedAt?: string;
  paymentDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSubscriptionData {
  subscriptionId: number;
  orderCode: number;
  checkoutUrl: string;
  qrCode: string;
  amount: number;
}

// Subscription Usage Entity
export interface SubscriptionUsage {
  id: number;
  subscriptionId: number;
  benefitName?: BenefitName;
  total?: number;
  used: number;
  createdAt: string;
  updatedAt?: string;
}

// Premium Package (từ file bạn đã có)
export interface PremiumPackage {
  id: number;
  name: string;
  price: number;
  currency?: string;
  durationDays: number | null;
  description?: string;
  marketingMessage?: string;
  isActive: boolean;
  benefits?: PackageBenefit[];
}

export interface PackageBenefit {
  benefitId: number;
  benefitName: string;
  value: number | null;
  benefitType?: 'Limited' | 'Unlimited';
}

// API Request/Response Types
export interface CreateSubscriptionRequest {
  packageId: number;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  message?: string;
  data?: {
    subscriptionId: number;
    orderCode: number;
    checkoutUrl: string;
    qrCode: string;
    amount: number;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  data?: {
    orderCode: number;
    status: string;
    amount: number;
    paidAt?: string;
    transactionCode?: string;
  };
}

export interface ActiveSubscriptionResponse {
  success: boolean;
  data?: Subscription;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
}

// PayOS Webhook Data
export interface PayOSWebhookData {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
  virtualAccountName?: string;
  virtualAccountNumber?: string;
}

export interface PaymentStatusData {
  orderCode: number;
  status: string; // PAID | PENDING | FAILED | PROCESSING ...
  amount: number;
  paidAt?: string;
  transactionCode?: string;
}

export interface ActiveSubscriptionData {
  id: number;
  packageId: number;
  startAt: string;
  endAt: string;
  status: string;
  package: {
    id: number;
    name: string;
    price: number;
    durationDays: number;
  };
  usageRecords: Array<{
    benefitName: string;
    total: number | null;
    used: number;
  }>;
}