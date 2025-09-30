import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import DiscoveryAIUploader from "../../components/Discovery/DiscoveryAIUploader";
import { PredictResponse } from "../../types/AIpredict";
import AnimeGirlMascot, { GirlStatus } from "../../components/Mascot/AnimeGirlMascot";

const AIpredictPage: React.FC = () => {
  const navigate = useNavigate();

  // AI results state
  const [aiResults, setAiResults] = useState<PredictResponse | null>(null);
const [mascotStatus, setMascotStatus] = useState<"idle" | "loading" | "nodata" | "data">("idle");


  // Camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);


  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Không thể mở camera:", err);
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền.");
    }
  };

  // Capture image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setCapturedImage(dataUrl);
    }
  };

  // Render AI results
  const renderAiResults = () => {
    if (!aiResults) return null;
    return (
      <div className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">Kết quả AI</h2>
        {aiResults.matches.map((m) => (
          <div
            key={m.heritage_id}
            className="cursor-pointer border rounded-lg p-3 bg-white shadow hover:bg-gray-50 transition"
            onClick={() => navigate(`/heritage/${m.heritage_id}`)}
          >
            <h3 className="font-bold text-gray-800">{m.name ?? "Không rõ tên"}</h3>
            <p className="text-sm text-gray-600">
              {m.description ?? "Không có mô tả"}
            </p>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tìm kiếm bằng{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="text-gray-600">
            Tải ảnh hoặc chụp trực tiếp từ camera để AI nhận diện di sản
          </p>
        </div>

        {/* 👶 Chibi mascot */}
        <div className="flex justify-center mb-6">
        <AnimeGirlMascot status={mascotStatus as GirlStatus} />
        </div>

        {/* AI uploader */}
        <div className="mb-6">
     <DiscoveryAIUploader
  onResult={(res) => {
    setAiResults(res);
    setMascotStatus(res.matches.length ? "data" : "nodata");
  }}
  onStatusChange={(s) => {
    if (s === "searching") setMascotStatus("loading");
    // ĐỪNG đổi sang "data" ở đây nữa
    if (s === "idle") setMascotStatus("idle");
    // nếu s === "done" → bỏ qua
  }}
/>


        </div>

        {/* Camera capture */}
        <div className="mb-6 text-center">
          {!isCameraOn ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Mở Camera
            </button>
          ) : (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="mx-auto rounded-lg shadow border max-w-full"
              />
              <button
                onClick={captureImage}
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              >
                Chụp ảnh
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {capturedImage && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ảnh đã chụp:</h3>
              <img
                src={capturedImage}
                alt="Captured"
                className="mx-auto rounded-lg shadow border max-w-xs"
              />
            </div>
          )}
        </div>

        {/* Show AI results */}
        {renderAiResults()}
      </main>
    </div>
  );
};

export default AIpredictPage;
