import { SortBy, PremiumType, QuizCategory, QuizLevel} from "./enum";

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct?: number;
  difficulty?: string;
}
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

export interface QuizListRequest {
    keyword?: string;     
    sortBy?: SortBy;             
    page?: number;
    pageSize?: number;
}

export interface QuizListResponse {
  id: number,
  title: string,
  bannerUrl: string,
  totalQuestions: number,
  numberOfClear: number,
  isPremium: boolean
}

export interface QuizDetailResponse {
  id: number,
  title: string,
  numberOfClear: number,
  questions: QuizQuestionResponse[]
}

export interface QuizQuestionResponse {
    id: number,
    quizId: number,
    question: string,
    optionA: string,
    optionB: string,
    optionC: string,
    optionD: string,
    correctOption: string,
    quizCategory: string,
    quizLevel: string
}

export interface SaveQuizResultRequest {
  quizId: number,
  numberOfClear: number,
}

export interface QuizCreationRequest {
  title: string;
  bannerUrl: string;
  premiumType: PremiumType; 
  questions: QuizQuestionCreationRequest[];
}

export interface QuizUpdateRequest {
  id: number;
  title: string;
  bannerUrl: string;
  premiumType: PremiumType; 
  questions: QuizQuestionCreationRequest[];
}

export interface QuizQuestionCreationRequest {
  quizId?: number | null;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  quizCategory?: QuizCategory | null;
  quizLevel?: QuizLevel | null;
}

export interface QuizQuestionUpdateRequest {
  id: number;
  quizId?: number | null;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  quizCategory?: QuizCategory | null;
  quizLevel?: QuizLevel | null;
}

export interface QuizResultInfo {
  userId: number;
  numberOfClear: number;
}

export interface QuizDetailAdminResponse {
  id: number;
  title: string;
  bannerUrl: string;
  premiumType: number;   
  numberOfClear: number;

  totalQuestions: number;
  totalAttempts: number;
  totalClearCount: number;

  results: QuizResultInfo[];

  questions: QuizQuestionResponse[];

  createdAt: string;
  updatedAt: string;
}

