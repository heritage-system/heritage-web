import React, { useEffect, useState } from "react";
import { useStreaming } from "./StreamingContext";
import { getParticipants } from "../../../services/streamingService";
import type { StreamingParticipantResponse } from "../../../types/streaming";

const ParticipantsListPanel: React.FC = () => {
  const { roomName } = useStreaming();
  const [items, setItems] = useState<StreamingParticipantResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(false);

  const load = async () => {
    if (!roomName) return;
    setLoading(true);
    const res = await getParticipants(roomName, "ADMITTED");
    if (res.code === 200 && res.result) setItems(res.result);
    setLoading(false);
  };

  useEffect(() => { load(); }, [roomName]);

  useEffect(() => {
    if (!auto || !roomName) return;
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [auto, roomName]);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Người đang trong phòng {items.length ? `(${items.length})` : ""}
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
          <div className="text-sm text-gray-500">Chưa có ai trong phòng.</div>
        ) : (
          items.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded border p-2"
            >
              <div className="text-sm">
                <div>
                  <span className="font-medium">UserId:</span> {u.userId}
                </div>
                <div>
                  <span className="font-medium">RTC UID:</span> {u.rtcUid}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {u.role}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {u.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantsListPanel;
