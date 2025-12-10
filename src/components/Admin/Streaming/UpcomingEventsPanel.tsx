// src/components/Community/UpcomingEventsPanel.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getEvents,
  registerForEvent,
  unregisterFromEvent,
} from "../../../services/eventService";
import { EventResponse, EventStatus } from "../../../types/event";
import { useStreaming } from "../../Admin/Streaming/StreamingContext";

const UpcomingEventsPanel: React.FC = () => {
  const [eventsAll, setEventsAll] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] =
    useState<"UPCOMING" | "LIVE">("UPCOMING"); // 👈 filter
  const navigate = useNavigate();
  const { setRoomName, fetchTokens } = useStreaming();

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // Gọi API KHÔNG truyền status, KHÔNG truyền from => backend trả tất cả event
      const res = await getEvents({});

      if (res.code === 200 && res.result) {
        setEventsAll(res.result);
      } else {
        setErr(res.message || "Không tải được danh sách sự kiện.");
      }
    } catch (e) {
      console.error(e);
      setErr("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // tải lần đầu
  useEffect(() => {
    void load();
  }, []);

  // danh sách theo filter (UPCOMING / LIVE)
  const events = eventsAll
    .filter((ev) =>
      filterStatus === "UPCOMING"
        ? ev.status === EventStatus.UPCOMING
        : ev.status === EventStatus.LIVE
    )
    .slice()
    .sort(
      (a, b) =>
        new Date(a.startAt as any).getTime() -
        new Date(b.startAt as any).getTime()
    );

  const handleRegister = async (ev: EventResponse) => {
    try {
      const res = await registerForEvent(ev.id);
      if (res.code === 200 && res.result?.registered) {
        toast.success("Đã đăng ký tham gia sự kiện");
        setEventsAll((prev) =>
          prev.map((e) =>
            e.id === ev.id
              ? {
                  ...e,
                  registeredByMe: true,
                  registeredCount: e.registeredCount + 1,
                }
              : e
          )
        );
      } else {
        toast.error(res.message || "Đăng ký thất bại");
      }
    } catch {
      toast.error("Không thể kết nối máy chủ");
    }
  };

  const handleUnregister = async (ev: EventResponse) => {
    try {
      const res = await unregisterFromEvent(ev.id);
      if (res.code === 200 && !res.result?.registered) {
        toast.success("Đã huỷ đăng ký sự kiện");
        setEventsAll((prev) =>
          prev.map((e) =>
            e.id === ev.id
              ? {
                  ...e,
                  registeredByMe: false,
                  registeredCount: Math.max(0, e.registeredCount - 1),
                }
              : e
          )
        );
      } else {
        toast.error(res.message || "Huỷ đăng ký thất bại");
      }
    } catch {
      toast.error("Không thể kết nối máy chủ");
    }
  };

  const handleJoinEvent = async (ev: EventResponse) => {
    if (!ev.streamingRooms || ev.streamingRooms.length === 0) {
      toast.error("Sự kiện chưa có phòng livestream nào.");
      return;
    }

    // chọn 1 room để join: ưu tiên room đang active, không thì lấy room đầu tiên
    const room =
      ev.streamingRooms.find((r) => r.isActive) ?? ev.streamingRooms[0];

    if (!room.roomName) {
      toast.error("Phòng không có roomName hợp lệ.");
      return;
    }

    setRoomName(room.roomName);

    // có thể fetchTokens trước để check quyền
    const grant = await fetchTokens(room.roomName);
    if (!grant) return;

    navigate(`/live/${encodeURIComponent(room.roomName)}`);
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sự kiện</h3>
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => setFilterStatus("UPCOMING")}
              className={`px-3 py-1 rounded-full text-xs border ${
                filterStatus === "UPCOMING"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              Sắp diễn ra
            </button>
            <button
              onClick={() => setFilterStatus("LIVE")}
              className={`px-3 py-1 rounded-full text-xs border ${
                filterStatus === "LIVE"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              Đang live
            </button>
          </div>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {err && <p className="mb-2 text-sm text-rose-600">{err}</p>}

      {events.length === 0 && !loading && !err && (
        <p className="py-4 text-sm text-gray-500">
          Hiện chưa có sự kiện nào phù hợp bộ lọc.
        </p>
      )}

      <ul className="divide-y">
        {events.map((ev) => (
          <li
            key={ev.id}
            className="py-3 flex gap-3 items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {ev.thumbnailUrl && (
                <img
                  src={ev.thumbnailUrl}
                  alt={ev.title}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              )}
              <div>
                <div className="font-medium line-clamp-1">{ev.title}</div>
                <div className="text-xs text-gray-500">
                  Bắt đầu:{" "}
                  {new Date(ev.startAt).toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })}
                  {" · "}
                  Đã đăng ký: {ev.registeredCount}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
             <button
  onClick={() => navigate(`/events/${ev.id}`)}
  className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200"
>
  Chi tiết
</button>

              {ev.registeredByMe ? (
                <button
                  onClick={() => handleUnregister(ev)}
                  className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 border border-red-200 hover:bg-red-100"
                >
                  Huỷ đăng ký
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(ev)}
                  className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
                >
                  Đăng ký
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingEventsPanel;
