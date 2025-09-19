import React, { useState } from "react";
import { predictHeritage } from "../../services/heritageService";
import { PredictResponse } from "../../types/heritage";

interface DiscoveryAIUploaderProps {
  onResult?: (res: PredictResponse) => void; // 👈 add this
}

const DiscoveryAIUploader: React.FC<DiscoveryAIUploaderProps> = ({ onResult }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await predictHeritage(file, {
        top_k: 20,
        results: 5,
        threshold: 0.65,
      });
      if (res.result) {
        onResult?.(res.result); // 👈 call back to parent (DiscoveryPage)
      }
    } catch (err) {
      console.error(err);
      alert("Không thể nhận diện ảnh");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-4">
      <h3 className="font-semibold text-lg">Nhận diện di sản từ ảnh</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
      >
        {loading ? "Đang phân tích..." : "Nhận diện"}
      </button>
    </div>
  );
};

export default DiscoveryAIUploader;
