export interface PredictResponse {
  matches: {
    heritage_id: number;
    score: number;
    name: string | null;
    description: string | null;
    avatar_url: string | null;
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

/** Lỗi dạng object (NON_PHOTOGRAPHIC, IMAGE_TOO_SMALL) */
export type PredictErrorObject = {
  error: {
    code: "NON_PHOTOGRAPHIC" | "IMAGE_TOO_SMALL";
    message: string;
    label?: string;
    confidence?: number;
    probs?: Record<string, number>;
    size?: [number, number];
  };
  // có thể kèm matches: []
  matches?: { }[];
};

/** Lỗi dạng chuỗi (BLUR_EARLY_DROP, BLUR_AFTER_ENHANCE, INVALID_IMAGE, ...) */
export type PredictErrorString = {
  error: "INVALID_IMAGE" | "BLUR_EARLY_DROP" | "BLUR_AFTER_ENHANCE";
  message?: string;
  score_before?: number;
  early_drop_threshold?: number;
  size_based_t0?: number;
  score_after?: number;
  threshold_after?: number;
  backend?: string;
  matches?: { }[];
};

export type PredictApiPayload = PredictResponse | PredictErrorObject | PredictErrorString;
