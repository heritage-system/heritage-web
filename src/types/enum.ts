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

export enum PremiumType {
  FREE = 0,
  SUBSCRIPTIONONLY = 1
}

export enum QuizCategory {
  RITUAL = 0,
  GAME = 1,
  UNKNOWN = 2
}

export enum QuizLevel {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2
}
  
export enum UserStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  DELETED = 2,
  BANNED = 3,
  PENDING_VERIFICATION = 4,
}

export enum StaffRole {
  CONTENT_REVIEWER = 0,  
  EVENT_MANAGER = 1,     
  SUPPORT_STAFF = 2,      
  COORDINATOR = 3,       
  MODERATOR = 4,         
  ADMIN_ASSISTANT = 5, 
}

export enum StaffStatus {
  ACTIVE = 0,      
  INACTIVE = 1,      
  SUSPENDED = 2,    
  RETIRED = 3,      
  PENDING = 4,      
}
