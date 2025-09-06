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
