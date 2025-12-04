// src/components/Admin/Streaming/WaitingQueuePanel.tsx
import React, { useEffect, useState } from "react";
import { useStreaming } from "./StreamingContext";

const WaitingQueuePanel: React.FC = () => {
  const { isHost, waiting, refreshWaiting, admit, reject } = useStreaming();
  const [auto, setAuto] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isHost) return;
    refreshWaiting();
  }, [isHost, refreshWaiting]);

  useEffect(() => {
    if (!isHost || !auto) return;
    const id = setInterval(() => refreshWaiting(), 2000);
    return () => clearInterval(id);
  }, [isHost, auto, refreshWaiting]);

  if (!isHost) return null;

  const onReload = async () => {
    setLoading(true);
    await refreshWaiting();
    setLoading(false);
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">Hàng chờ vào phòng</div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            Tự làm mới (2s)
          </label>
          <button
            onClick={onReload}
            className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      <ul className="text-sm leading-7">
        {waiting.map((w) => (
          <li key={w.id} className="flex items-center justify-between">
            <div>
              <span className="font-medium">User #{w.userId}</span>{" "}
              <span className="text-gray-500">(rtcUid: {w.rtcUid})</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => admit(w.userId)}
                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
              >
                Admit
              </button>
              <button
                onClick={() => reject(w.userId)}
                className="rounded bg-rose-600 px-3 py-1 text-white hover:bg-rose-700"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
        {waiting.length === 0 && <li className="text-gray-500">Không có ai đang đợi</li>}
      </ul>
    </div>
  );
};

export default WaitingQueuePanel;
