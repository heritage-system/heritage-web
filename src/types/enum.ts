export enum CalendarType {
  SOLAR = "SOLAR",
  LUNAR = "LUNAR",
  BOTH = "BOTH"
}

export enum SortBy {
  NameAsc = "NAMEASC",
  NameDesc = "NAMEDESC",
  DateAsc = "DATEASC",
  DateDesc = "DATEDESC",
    IdAsc = "IDASC",
  IdDesc = "IDDESC"
}

export type MediaType = "image" | "video" | "audio" | "other"; 

// ---- Contributor ----
export enum ContributorStatus {
  APPLIED = "APPLIED",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum ContributionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}