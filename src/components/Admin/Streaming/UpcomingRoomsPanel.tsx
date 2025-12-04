  // src/components/Community/UpcomingRoomsPanel.tsx
  import React, { useEffect, useState } from "react";
  import {
    getUpcomingRooms,
    registerForRoom,
  } from "../../../services/streamingService";
  import { StreamingRoomResponse } from "../../../types/streaming";
  import { useNavigate } from "react-router-dom";
  import { toast } from "react-hot-toast";

  const UpcomingRoomsPanel: React.FC = () => {
    const [rooms, setRooms] = useState<StreamingRoomResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const navigate = useNavigate();

    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await getUpcomingRooms();
        if (res.code === 200 && res.result) {
          setRooms(res.result);
        } else {
          setErr(res.message || "Không tải được danh sách sự kiện sắp tới.");
        }
      } catch {
        setErr("Không thể kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      load();
    }, []);

    const handleRegister = async (roomName: string) => {
      try {
        const res = await registerForRoom(roomName);
        if (res.code === 200) {
          toast.success("Đã đăng ký tham gia sự kiện");
        } else {
          toast.error(res.message || "Đăng ký thất bại");
        }
      } catch {
        toast.error("Không thể kết nối máy chủ");
      }
    };

    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sự kiện sắp diễn ra</h3>
          <button
            onClick={load}
            disabled={loading}
            className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {err && <p className="mb-2 text-sm text-rose-600">{err}</p>}

        {rooms.length === 0 && !loading && !err && (
          <p className="py-4 text-sm text-gray-500">
            Hiện chưa có sự kiện nào sắp diễn ra.
          </p>
        )}

        <ul className="divide-y">
          {rooms.map((r) => (
            <li
              key={r.id}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-medium">{r.title || r.roomName}</div>
                <div className="text-xs text-gray-500">
                Bắt đầu:{" "}
  {new Date(r.startAt).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  })}{" "}
  · Room: {r.roomName}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRegister(r.roomName)}
                  className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                >
                  Đăng ký
                </button>
                <button
                  onClick={() =>
                    navigate(`/live/${encodeURIComponent(r.roomName)}`)
                  }
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Xem chi tiết
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  export default UpcomingRoomsPanel;
