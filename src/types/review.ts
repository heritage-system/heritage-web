export interface Review {
  id: number;                
  username: string;    
  userImageUrl: string;         
  heritageId: number;         
  comment: string;            
  parentReviewId?: number;    
  likes?: number;
  createdAt: string;         
  updatedAt: string;
  replies?: Review[];
  reviewMedias?: ReviewMedia[];
}

export interface ReviewMedia {
  id: number;
  reviewId: number;
  mediaType: string;      
  url: string;
}

