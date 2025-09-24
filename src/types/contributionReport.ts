import { SortBy, ContributionStatus} from "./enum";


export interface ContributionReportCreationRequest {
  contributionId: number,
  reason: string
}
