import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Users, Clock, Tag as TagIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  EventCategory,
  EventResponse,
  EventStatus,
  EventTag,
} from "../../types/event";
import {
  getEventDetail,
  registerForEvent,
  unregisterFromEvent,
} from "../../services/eventService";
import { useStreaming } from "../Admin/Streaming/StreamingContext";

type Props = {
  eventId: number;
};

const tagOptions: { label: string; value: EventTag }[] = [
  { label: "Featured", value: EventTag.FEATURED },
  { label: "Free", value: EventTag.FREE },
  { label: "Premium", value: EventTag.PREMIUM },
  { label: "Recorded", value: EventTag.RECORDED },
  { label: "Q&A", value: EventTag.QNA },
];

const categoryLabel: Record<EventCategory, string> = {
  [EventCategory.GENERAL]: "General",
  [EventCategory.HERITAGE_TALK]: "Heritage Talk",
  [EventCategory.FESTIVAL]: "Festival",
  [EventCategory.WORKSHOP]: "Workshop",
  [EventCategory.ONLINE_TOUR]: "Online Tour",
};

const formatLocal = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};

const EventDetailView: React.FC<Props> = ({ eventId }) => {
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setRoomName, fetchTokens } = useStreaming();

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getEventDetail(eventId);
      if (res.code === 200 && res.result) {
        setEvent(res.result);
      } else {
        setErr(res.message || "Không tải được thông tin sự kiện.");
      }
    } catch {
      setErr("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const handleRegister = async () => {
    if (!event) return;
    try {
      const res = await registerForEvent(event.id);
      if (res.code === 200 && res.result?.registered) {
        toast.success("Đã đăng ký tham gia sự kiện");
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                registeredByMe: true,
                registeredCount: prev.registeredCount + 1,
              }
            : prev
        );
      } else {
        toast.error(res.message || "Đăng ký thất bại");
      }
    } catch {
      toast.error("Không thể kết nối máy chủ");
    }
  };

  const handleUnregister = async () => {
    if (!event) return;
    try {
      const res = await unregisterFromEvent(event.id);
      if (res.code === 200 && !res.result?.registered) {
        toast.success("Đã huỷ đăng ký sự kiện");
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                registeredByMe: false,
                registeredCount: Math.max(0, prev.registeredCount - 1),
              }
            : prev
        );
      } else {
        toast.error(res.message || "Huỷ đăng ký thất bại");
      }
    } catch {
      toast.error("Không thể kết nối máy chủ");
    }
  };

  const handleJoinRoom = async (roomName: string) => {
    if (!roomName) return;
    setRoomName(roomName);
    const grant = await fetchTokens(roomName);
    if (!grant) return;
    navigate(`/live/${encodeURIComponent(roomName)}`);
  };

  // tags từ bitmask
  const activeTags = useMemo(() => {
    if (!event) return [] as string[];
    const t = event.tags;
    return tagOptions
      .filter((opt) => (t & opt.value) === opt.value)
      .map((opt) => opt.label);
  }, [event]);

  const joinableRooms = useMemo(() => {
    if (!event) return [];
    return (event.streamingRooms || []).filter((r) => {
      const type = (r as any).type as string | undefined;
      const isActive = (r as any).isActive as boolean | undefined;
      return (
        type === "UPCOMING" ||
        type === "LIVE" ||
        isActive === true
      );
    });
  }, [event]);

  if (loading && !event) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        Đang tải...
      </div>
    );
  }

  if (err && !event) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm text-sm text-rose-600">
        {err}
      </div>
    );
  }

  if (!event) return null;

  const isClosed = event.status === EventStatus.CLOSED;

  return (
    <div className="space-y-6">
      {/* Card tổng quan event */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {event.thumbnailUrl && (
            <div className="md:w-1/3 h-52 md:h-auto">
              <img
                src={event.thumbnailUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-6 h-6 text-red-500" />
                {event.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.status === EventStatus.LIVE
                    ? "bg-red-100 text-red-700"
                    : event.status === EventStatus.UPCOMING
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {event.status}
              </span>
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-line">
              {event.description || "Không có mô tả."}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <div>
                    <span className="font-semibold">Bắt đầu: </span>
                    {formatLocal(event.startAt as any)}
                  </div>
                  <div>
                    <span className="font-semibold">Kết thúc: </span>
                    {event.closeAt
                      ? formatLocal(event.closeAt as any)
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Category: </span>
                  {categoryLabel[event.category]}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <TagIcon className="w-3 h-3" />
                    Tags:
                  </span>
                  {activeTags.length === 0 ? (
                    <span className="text-xs text-gray-400">
                      (none)
                    </span>
                  ) : (
                    activeTags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium"
                      >
                        {t}
                      </span>
                    ))
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  Đã đăng ký:{" "}
                  <span className="font-semibold">
                    {event.registeredCount}
                  </span>
                </div>
              </div>
            </div>

            {/* nút đăng ký / huỷ đăng ký */}
            <div className="flex items-center gap-3 pt-2">
              {event.registeredByMe ? (
                <button
                  onClick={handleUnregister}
                  disabled={loading || isClosed}
                  className="rounded-full bg-red-50 px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                >
                  Huỷ đăng ký
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={loading || isClosed}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Đăng ký tham gia
                </button>
              )}

              {isClosed && (
                <span className="text-xs text-gray-500">
                  Sự kiện đã đóng.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách room thuộc event */}
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Phòng livestream của sự kiện
          </h2>
          <button
            onClick={load}
            disabled={loading}
            className="rounded bg-gray-100 px-3 py-1 text-xs sm:text-sm hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {joinableRooms.length === 0 ? (
          <p className="text-sm text-gray-500">
            Hiện chưa có phòng livestream sắp diễn ra hoặc đang mở cho
            sự kiện này.
          </p>
        ) : (
          <ul className="divide-y">
            {joinableRooms.map((r: any) => (
              <li
                key={r.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-sm">
                    {r.title || r.roomName}
                  </div>
                  <div className="text-xs text-gray-500">
                    Bắt đầu: {formatLocal(r.startAt)} · Room: {r.roomName} ·{" "}
                    {r.type === "LIVE" || r.isActive
                      ? "Đang live"
                      : r.type === "UPCOMING"
                      ? "Sắp diễn ra"
                      : r.type || "Khác"}
                  </div>
                </div>
                <div className="flex gap-2 sm:justify-end">
                  <button
                    onClick={() =>
                      navigate(
                        `/live/${encodeURIComponent(r.roomName)}`
                      )
                    }
                    className="rounded bg-gray-100 px-3 py-1 text-xs sm:text-sm text-gray-800 hover:bg-gray-200"
                  >
                    Xem nhanh
                  </button>
                  <button
                    onClick={() => handleJoinRoom(r.roomName)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs sm:text-sm text-white hover:bg-blue-700"
                  >
                    Vào phòng
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventDetailView;
