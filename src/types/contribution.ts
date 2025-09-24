import { SortBy, ContributionStatus} from "./enum";
import {HeritageName} from "./heritage"
import {SubscriptionDto} from "./subscription"

export interface ContributionCreateRequest {
  title: string,
  content: string,
  mediaUrl: string,
  tagHeritageIds?: number[],
  premiumType?: number,
}
export interface ContributionCreateResponse {
    id: number,
    contributorId: number,
    title: string,
    content: string,
    price: number,
    status: ContributionStatus   
}

export interface ContributionSearchRequest {
    keyword?: string;   
    contributorIds?: number[];
    tagHeritageIds?: number[];
    sortBy?: SortBy;             
    page?: number;
    pageSize?: number;
}

export interface ContributionRelatedRequest {
    keyword?: string;   
    contributionId?: number;
    contributorIds?: number[];
    tagHeritageIds?: number[];         
    quantity?: number;  
}

export interface ContributionSearchResponse {
  id: number;
  contributorId: number;
  contributorName: string;
  avatarUrl: string;
  content?: string;
  firstContent?: string;
  title: string;
  mediaUrl?: string;
  contributionHeritageTags:  HeritageName[]; 
  publishedAt: string; 
  view: number;  
  comments: number;
  isSave: boolean;
  isPremium: boolean
}

export interface ContributionResponse {
  id: number;
  contributorId: number;
  contributorName: string;
  avatarUrl: string;
  content?: string;
  previewContent?: string;
  title: string;
  mediaUrl?: string;
  contributionHeritageTags:  HeritageName[]; 
  publishedAt: string;
  status: string;
  view: number;
  subscription: SubscriptionDto;
  isSave: boolean
}

export interface SearchRequest {
  keyword: string;
  categoryIds: number[];
  tagIds: number[];
  sortBy: string;
  page: number;
  pageSize: number;
}