// src/components/Admin/Streaming/JoinRequestPanel.tsx
import React from "react";
import { useStreaming } from "../Streaming/StreamingContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const JoinRequestPanel: React.FC = () => {
  const { roomName, fetchTokens } = useStreaming();
  const navigate = useNavigate();

  const onGoLive = async () => {
    if (!roomName) {
      toast.error("Hãy nhập Mã Phòng");
      return;
    }
    const grant = await fetchTokens();
    if (grant) {
      navigate(`/live/${encodeURIComponent(roomName)}`);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Vào phòng</h3>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={onGoLive}
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Lấy token & Vào live
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Hệ thống cho phép vào/ra tự do. Chỉ bị chặn nếu bạn bị host kick.
      </p>
    </div>
  );
};

export default JoinRequestPanel;
