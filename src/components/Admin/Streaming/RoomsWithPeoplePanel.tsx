import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomsWithPeople } from "../../../services/streamingService";
import { StreamingRoomWithCountResponse } from "../../../types/streaming";
import { useStreaming } from "./StreamingContext";

const RoomsWithPeoplePanel: React.FC = () => {
  const navigate = useNavigate();
  const { setRoomName } = useStreaming();
  const [rooms, setRooms] = useState<StreamingRoomWithCountResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getRoomsWithPeople(1, "Admitted");
      if (res.code === 200 && res.result) {
        setRooms(res.result);
      } else {
        setErr(res.message || "Không tải được danh sách phòng.");
      }
    } catch (e: any) {
      setErr("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Phòng đang có người</h3>
        <button
          onClick={load}
          className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {err && <p className="mb-2 text-sm text-rose-600">{err}</p>}

      <ul className="divide-y">
        {rooms.map((r) => (
          <li key={r.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.title || r.roomName}</div>
              <div className="text-xs text-gray-500">
                {r.roomName} · {r.participantCount} người · {r.isActive ? "Đang hoạt động" : "Đóng"}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setRoomName(r.roomName); navigate("/stream/join"); }}
                className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
              >
                Điền & Xin vào
              </button>
              <button
                onClick={() => navigate(`/live/${encodeURIComponent(r.roomName)}`)}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                Vào xem
              </button>
            </div>
          </li>
        ))}
        {rooms.length === 0 && !loading && !err && (
          <li className="py-6 text-sm text-gray-500">Hiện chưa có phòng nào.</li>
        )}
      </ul>
    </div>
  );
};

export default RoomsWithPeoplePanel;
