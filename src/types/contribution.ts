import { ContributionPremiumTypes, ContributionStatus} from "./enum";
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

export interface ContributionSearchResponse {
  id: number;
  contributorId: number;
  contributorName: string;
  avatarUrl: string;
  firstText: string;
  title: string;
  mediaUrl?: string;
  price: number;
  contributorNameUnsigned: string;
  titleUnsigned: string;
  postedAt: Date;
  readTime: string;
  tags: string[];
  claps: number;
  comments: number;
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