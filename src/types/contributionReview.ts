export interface ContributionReviewResponse {
  id: number;   
  userid: number;             
  username: string;           // User name
  userImageUrl: string;       // Profile image URL
  contributionId: number;         
  comment: string;            
  parentReviewId?: number;    
  likes?: number;             // Optional: API may return 0 if missing
  likedByMe?: boolean;        // Track if current user liked this review
  createdByMe? : boolean;
  createdAt: string;         
  updatedAt: string;
  replies?: ContributionReviewResponse[];         
}

export interface ContributionReviewCreateRequest {
  contributionId: number;
  comment: string;
  parentReviewId?: number;
}

export interface ContributionReviewUpdateRequest {
  id: number;                
  comment: string;          
  
}
export interface ContributionReviewUpdateResponse {
  id: number;
  comment: string;
  updatedAt: string;
}
