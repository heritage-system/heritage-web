export interface Tour {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  duration: string;
  rating: number;
  participants: string;
  isHot?: boolean;   
  isVR?: boolean;    
}
