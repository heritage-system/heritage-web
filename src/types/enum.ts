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
  DISABLE = "DISABLE"
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
  PENDING_APPROVE = 5,
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

export enum PanoramaStatus {
  ACTIVE = 0,
  INACTIVE = 1
}

export enum BenefitType {
    FEATUREUNLOCK = 0,
    LIMITINCREASE = 1
}
export enum BenefitName {
  QUIZ = 0,
  TOUR = 1,
  CONTRIBUTION = 2
}

export enum PaymentStatus {
  PENDING = 0, 
  PAID = 1, 
  FAILED = 2, 
  CANCELLED = 3
}

export enum SubscriptionStatus {
  ACTIVE = 0, 
  EXPIRED = 1,
  CANCELLED = 2,
  PENDING = 3,
  UPGRADED = 4
}
// ⚡ Khớp với backend C#
export enum RoomRole {
  HOST = 0,
  COHOST = 1,
  SPEAKER = 2,
  AUDIENCE = 3,
}

export enum ParticipantStatus {
  WAITING = 0,
  ADMITTED = 1,
  KICKED = 2,
  BANNED = 3,
  LEFT = 4,
}

export enum StreamingRoomType {
  UPCOMING = 0,
  LIVE = 1,
  CLOSED = 2,
}
export enum EventStatus {
  DRAFT = 0,
  UPCOMING = 1,
  LIVE = 2,
  CLOSED = 3,
  ARCHIVED = 4,
}

export enum EventCategory {
  GENERAL = 0,
  HERITAGE_TALK = 1,
  FESTIVAL = 2,
  WORKSHOP = 3,
  ONLINE_TOUR = 4,
}

// bit flags — giữ nguyên nhưng ghi rõ cho chắc
export enum EventTag {
  NONE = 0,
  FEATURED = 1 << 0, // 1
  FREE = 1 << 1,     // 2
  PREMIUM = 1 << 2,  // 4
  RECORDED = 1 << 3, // 8
  QNA = 1 << 4,      // 16
}

export enum PointHistoriesReason
{
    PVP_WIN = 0,  
    CONTRIBUTION_VIEW = 1,      
    UNLOCK_CONTRIBUTION = 2,
    UNLOCK_SCENE = 3,
    UNLOCK_QUIZ = 4,
    DAILY_BONUS = 5,          
}

export enum RoomType
{
    RANDOM = 0, 
    PLAY_WITH_FRIEND = 1, 
    BOT = 2,    
}

export enum Winner
{
     PLAYER_1 = 0
     ,PLAYER_2 = 1,
     DRAW = 2   
}