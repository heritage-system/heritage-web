import { PredictApiPayload, PredictResponse} from "../types/AIpredict";
import { HeritageSearchResponse } from "../types/heritage";
import { ApiResponse } from "../types/apiResponse";
import { PageResponse } from "../types/pageResponse";

import { AI_API_URL,API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
export const predictHeritage = async (
  file: File,
  params?: { top_k?: number; results?: number; threshold?: number }
): Promise<ApiResponse<PredictApiPayload>> => {
  const formData = new FormData();
  formData.append("file", file);

  const query = new URLSearchParams();
  if (params?.top_k) query.append("top_k", params.top_k.toString());
  if (params?.results) query.append("results", params.results.toString());
  if (params?.threshold) query.append("threshold", params.threshold.toString());

  return await fetchInterceptor<PredictApiPayload>(
    `${AI_API_URL}/predict?${query.toString()}`,
    { method: "POST", body: formData }
  );
};

export class PredictJsonService {
  /**
   * Đọc file JSON từ đường dẫn và parse thành PredictApiPayload
   * @param path đường dẫn file JSON (tương đối hoặc tuyệt đối)
   */
  static async loadFromFile(path: string): Promise<PredictApiPayload> {
    try {
      // đọc file (Node.js)
      const jsonText = await import(path, {
        with: { type: "json" }
      });

      // jsonText.default chính là nội dung JSON
      const data = jsonText.default;

      return data as PredictApiPayload;
    } catch (err) {
      console.error("❌ Lỗi đọc JSON:", err);
      throw new Error(`Không thể đọc file JSON tại: ${path}`);
    }
  }
   static async loadFromUrlRandomPost(
    url: string,
    limit: number,
    body?: BodyInit
  ): Promise<PredictApiPayload> {
    try {
      const res = await fetch(url, {
        method: "POST",
        body, // có thể là FormData, JSON string, v.v.
        // headers: KHÔNG set Content-Type nếu dùng FormData
        // headers: { "Content-Type": "application/json" } nếu gửi JSON
      });

      if (!res.ok) throw new Error("HTTP error " + res.status);

      const data = (await res.json()) as PredictApiPayload;

      // Chỉ lấy matches ngẫu nhiên nếu có
      if ("matches" in data && Array.isArray(data.matches) && data.matches.length > limit) {
        const shuffled = [...data.matches].sort(() => Math.random() - 0.5);
        data.matches = shuffled.slice(0, limit);
      }

      return data;
    } catch (err) {
      console.error("❌ Lỗi fetch JSON:", err);
      throw err;
    }
  }
  /**
   * Đọc JSON từ URL / API → hữu ích khi bạn load json tĩnh trong frontend.
   */
  static async loadFromUrlRandom(url: string, limit: number): Promise<PredictApiPayload> {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP error " + res.status);

      const data = (await res.json()) as PredictApiPayload;

      // Chỉ lấy matches ngẫu nhiên nếu có
      if ("matches" in data && Array.isArray(data.matches) && data.matches.length > limit) {
        const shuffled = [...data.matches].sort(() => Math.random() - 0.5);
        data.matches = shuffled.slice(0, limit);
      }

      return data;
    } catch (err) {
      console.error("❌ Lỗi fetch JSON:", err);
      throw err;
    }
  }
}


export const mapPredictToHeritage = (
  payload: PredictApiPayload
): HeritageSearchResponse[] => {
  // Nếu là lỗi thì trả về mảng rỗng
  if (!payload || "error" in payload) return [];

  const predict = payload as PredictResponse;

  if (!predict.matches || !Array.isArray(predict.matches)) return [];

  return predict.matches.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    content: m.description, // hoặc map theo ý anh
    categoryName: m.categoryName ?? "",
    isSave: false, // mặc định
    isFeatured: false, // mặc định
    heritageOccurrences: m.heritageOccurrences ?? [],
    media: m.media ?? { url: "", mediaTypeName: "IMAGE",id: 1, description:""  }, // fallback
    heritageTags: m.heritageTags ?? [],
    heritageTagIds: m.heritageTagIds ?? [],
    heritageLocations: m.heritageLocations ?? [],
    score: m.score,
  }));
};
