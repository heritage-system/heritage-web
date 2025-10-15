export interface BoardCell {
  index: number;
  type: "Start" | "Finish" | "Question" | "Reward" | "Penalty";
  description?: string;
  questionId?: string;
}

export interface Player {
  id: string;
  username: string;
  avatarUrl?: string; // thêm avatar
  position: number;
  score: number;
}

export interface GameSession {
  id: string;
  name: string;
  board: BoardCell[];
  players: Player[];
  currentTurnIndex: number;
}


export interface Question {
  id: string;
  content: string;
  options: string[];
  correctIndex: number;
  festivalReference: string;
}
