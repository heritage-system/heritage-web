export enum CalendarType {
  SOLAR = 0,
  LUNAR = 1 ,
  BOTH = 2
}

export enum SortBy {
  NameAsc = "NAMEASC",
  NameDesc = "NAMEDESC",
  DateAsc = "DATEASC",
  DateDesc = "DATEDESC",
    IdAsc = "IDASC",
  IdDesc = "IDDESC"
}


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

export enum ContributionPremiumTypes {
  FREE = "FREE",
  SUBSCRIPTIONONLY = "SUBSCRIPTIONONLY"
}

export enum MediaType {
  IMAGE = 0,
  VIDEO = 1,
}

export enum OccurrenceType {
  EXACTDATE= 0,
  RANGE = 1,
  RECURRINGRULE = 2,
  APPROXIMATE = 3,
  UNKNOWN = 4
}

export enum FestivalFrequency {
   ONETIME = 0, 
   ANNUAL = 1, 
   SEASONAL = 2, 
   MONTHLY = 3
}