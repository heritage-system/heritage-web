// components/DiscoveryAIUploader.tsx
import React, { useRef, useState } from "react";
import { PredictResponse } from "@/types/AIpredict";
import { predictHeritage } from "../../services/AIpredictService";
interface DiscoveryAIUploaderProps {
  onResult?: (res: PredictResponse) => void;
  onStatusChange?: (status: "idle" | "searching" | "done") => void;
}

const DiscoveryAIUploader: React.FC<DiscoveryAIUploaderProps> = ({ onResult, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runPredict = async (file: File) => {
    setLoading(true);
    onStatusChange?.("searching");
    try {
      const res = await predictHeritage(file, { top_k: 20, results: 5, threshold: 0.65 });
      if (res.result) {
        onResult?.(res.result);
        onStatusChange?.("done");
      } else {
        onStatusChange?.("idle");
        alert("Không thể nhận diện ảnh");
      }
    } catch (e) {
      console.error(e);
      onStatusChange?.("idle");
      alert("Không thể nhận diện ảnh");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      await runPredict(f); // 👈 auto gọi predict ngay sau khi chụp/chọn
      e.target.value = ""; // reset để có thể chụp lại cùng tên file
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-4">
      <h3 className="font-semibold text-lg">Nhận diện di sản từ ảnh</h3>

      {/* Input mở camera (mobile) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        // 👇 HACK quan trọng cho mobile: mở camera sau nếu có thể
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Input chọn ảnh từ thư viện/PC */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
        >
          {loading ? "Đang phân tích..." : "Chụp ảnh (mở camera)"}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg"
        >
          {loading ? "Đang phân tích..." : "Chọn ảnh từ máy"}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Mẹo: Trên iOS/Android, nút “Chụp ảnh” sẽ mở camera; trên desktop sẽ mở chọn file như bình thường.
      </p>
    </div>
  );
};

export default DiscoveryAIUploader;
