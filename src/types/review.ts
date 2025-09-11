export interface Review {
  id: number;   
  userid: number;             
  username: string;           // User name
  userImageUrl: string;       // Profile image URL
  heritageId: number;         
  comment: string;            
  parentReviewId?: number;    
  likes?: number;             // Optional: API may return 0 if missing
  likedByMe?: boolean;        // Track if current user liked this review
  createdByMe? : boolean;
  createdAt: string;         
  updatedAt?: string;
  replies?: Review[];         // Nested replies
  reviewMedias?: ReviewMedia[]; // Media attached to review
}

export interface ReviewMedia {
  id: number;
  reviewId: number;
  mediaType: string;      
  url: string;
}

export interface ReviewCreateRequest {
  heritageId: number;
  comment: string;
  parentReviewId?: number;
  media?: {
    file: File;       // ✅ actual file, not string
    type: string;     // "IMAGE" | "VIDEO" | "DOCUMENT"
  }[];
}
export interface LikeReviewRequest {
  reviewId: number;
  like: boolean;       // true = like, false = unlike
}
export interface LikeReviewResponse {
  reviewId: number;   // ID of the review that was liked/unliked
  likeCount: number;  // Updated total number of likes
  likedByMe: boolean; // Whether the current user currently likes this review
}
export interface ReviewUpdateRequest {
  id: number;                // Review ID to update
  comment: string;           // Updated comment
  media?: {
    file: File;              // New media files
    type: string;
  }[];
}
export interface ReviewUpdateResponse {
  id: number;
  comment: string;
  reviewMedias?: ReviewMedia[];
}
export interface ReviewDeleteRequest {
  id: number;
}

export interface ReviewDeleteResponse {
  id: number;
  success: boolean;
  message: string;
}