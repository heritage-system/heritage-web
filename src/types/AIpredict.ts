import { HeritageLocation, HeritageMedia, HeritageOccurrence } from "./heritage";

export interface PredictResponse {
  // NEW: mô tả ảnh input (tạo bởi backend)
  inputDescription: string;
  matches: Array<{
    id: number;
    name: string;
    description: string;
    categoryName: string | null;
    heritageOccurrences: HeritageOccurrence[];
    media: HeritageMedia | null;
    heritageTags: string[];
    heritageTagIds: number[];
    heritageLocations: HeritageLocation[];
    score: number;          // best score theo heritage_id
  }>;

  warning?: {
    code: string;
    label?: string;
    confidence?: number;
    probs?: Record<string, number>;
  };
  error?: {
    code: string;
    message: string;
    [k: string]: unknown;
  };
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
