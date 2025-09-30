export interface PredictResponse {
  matches: {
    heritage_id: number;
    score: number;
    name: string | null;
    description: string | null;
    evidence: {
      score: number;
      media_id: number;
      heritage_id: number;
      url: string;
      is_video: boolean;
      frame_idx: number | null;
      note: string | null;
      meta_index: number;
    }[];
  }[];
}