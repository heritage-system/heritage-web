// src/components/Admin/Streaming/WaitingListPanel.tsx
import React, { useEffect, useState } from "react";
import { useStreaming } from "./StreamingContext";
import { getWaitingList } from "../../../services/streamingService";
import type { StreamingParticipantResponse } from "../../../types/streaming";

const WaitingListPanel: React.FC = () => {
  const OPEN_ADMISSION = "true";

if (OPEN_ADMISSION) return null; // ✅ ẩn toàn bộ panel
  const { roomName, admit, reject } = useStreaming();
  const [items, setItems] = useState<StreamingParticipantResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(false);             // NEW: auto refresh

  const load = async () => {
    if (!roomName) return;
    setLoading(true);
    const res = await getWaitingList(roomName);
    if (res.code === 200 && res.result) setItems(res.result);
    setLoading(false);
  };

  useEffect(() => { load(); }, [roomName]);

  // NEW: auto refresh mỗi 2 giây
  useEffect(() => {
    if (!auto || !roomName) return;
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [auto, roomName]);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Danh sách chờ duyệt {items.length ? `(${items.length})` : ""}
        </h3>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
            />
            Tự làm mới (2s)
          </label>
          <button
            onClick={load}
            className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">Chưa có ai chờ.</div>
        ) : items.map(u => (
          <div key={u.id} className="flex items-center justify-between rounded border p-2">
            <div className="text-sm">
              <div><span className="font-medium">UserId:</span> {u.userId}</div>
              <div><span className="font-medium">RTC UID:</span> {u.rtcUid}</div>
              <div><span className="font-medium">Trạng thái:</span> {u.status}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => admit(u.userId)}
                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
              >
                Duyệt
              </button>
              <button
                onClick={() => reject(u.userId)}
                className="rounded bg-rose-600 px-3 py-1 text-white hover:bg-rose-700"
              >
                Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaitingListPanel;
