import { ContributionStatus} from "./enum";

export interface ContributionCreateRequest {
  title: string,
  content: string,
  mediaUrl: string,
}
export interface ContributionCreateResponse {
    contributionId: number,
    contributorId: number,
    title: string,
    content: string,
    price: number,
    status: ContributionStatus,
}

export interface Contribution {
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

export interface SearchRequest {
  keyword: string;
  categoryIds: number[];
  tagIds: number[];
  sortBy: string;
  page: number;
  pageSize: number;
}