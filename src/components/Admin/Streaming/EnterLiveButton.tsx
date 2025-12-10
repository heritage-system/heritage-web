import React from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { useStreaming } from "./StreamingContext";

const EnterLiveButton: React.FC = () => {
  const navigate = useNavigate();
  const { room, roomName } = useStreaming();
  const effective = roomName || room?.roomName || "";

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Đi tới phòng live</h3>
        <button
          disabled={!effective}
          onClick={() => navigate(`/live/${encodeURIComponent(effective)}`)}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          title={effective ? `Mở ${effective}` : "Chưa có roomName"}
        >
          <Play size={18} /> Vào phòng
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Room hiện tại: <span className="font-medium">{effective || "—"}</span>
      </p>
    </div>
  );
};

export default EnterLiveButton;
