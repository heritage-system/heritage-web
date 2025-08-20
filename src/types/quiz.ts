export interface Quiz {
  id: number;
  title: string;
  description: string;
  image: string;
  difficulty: string;
  difficultyColor: string;
  questions: number;
  time: string;
  players: string;
  rating: number;
  category: string;
  badge: string;
  isHot: boolean;
  reward: string;
  completedBy: number;
}
