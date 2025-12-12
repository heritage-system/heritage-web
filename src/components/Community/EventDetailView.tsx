import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Users, Clock, Tag as TagIcon, Calendar, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { EventResponse } from "../../types/event";
import { getEventDetail, registerForEvent, unregisterFromEvent } from "../../services/eventService";
import { useStreaming } from "../Admin/Streaming/StreamingContext";
import { EventCategory, EventStatus, EventTag } from "../../types/enum";

type Props = { eventId: number };

const tagOptions = [
  { label: "Nổi bật", value: EventTag.FEATURED },
  { label: "Miễn phí", value: EventTag.FREE },
  { label: "Gói Premium", value: EventTag.PREMIUM },
  { label: "Có ghi hình", value: EventTag.RECORDED },
  { label: "Hỏi đáp (Q&A)", value: EventTag.QNA },
];

const categoryLabel: Record<EventCategory, string> = {
  [EventCategory.GENERAL]: "Chung",
  [EventCategory.HERITAGE_TALK]: "Toạ đàm di sản",
  [EventCategory.FESTIVAL]: "Lễ hội",
  [EventCategory.WORKSHOP]: "Workshop",
  [EventCategory.ONLINE_TOUR]: "Tour trực tuyến",
};

const formatLocal = (iso?: string | null) => {
  if (!iso) return "—";
  let normalized = iso;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(iso)) normalized = iso + "Z";
  const d = new Date(normalized);
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
      } else toast.error(res.message || "Đăng ký thất bại");
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
      } else toast.error(res.message || "Huỷ đăng ký thất bại");
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

  const activeTags = useMemo(() => {
    if (!event) return [];
    const t = event.tags;
    return tagOptions.filter((opt) => (t & opt.value) === opt.value).map((opt) => opt.label);
  }, [event]);

  const joinableRooms = useMemo(() => {
    if (!event) return [];
    return (event.streamingRooms || []).filter((r) => {
      const type = (r as any).type;
      const isActive = (r as any).isActive;
      return type === "UPCOMING" || type === "LIVE" || isActive === true;
    });
  }, [event]);

  if (loading && !event) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center max-w-6xl mx-auto my-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Đang tải thông tin sự kiện...</p>
      </div>
    );
  }

  if (err && !event) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-6xl mx-auto my-8">
        <p className="text-red-800 font-medium">{err}</p>
      </div>
    );
  }

  if (!event) return null;

  const isClosed = event.status === EventStatus.CLOSED;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="relative">
        {/* Thumbnail */}
        {event.thumbnailUrl && (
          <div className="relative w-full h-64 md:h-96">
            {/* Hình ảnh gốc – bo tròn toàn bộ 4 góc */}
            <img
              src={event.thumbnailUrl}
              alt={event.title}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />

            {/* Overlay gradient nhẹ từ dưới lên (chỉ che phần dưới để chữ trắng dễ đọc) */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Badge trạng thái */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm ${
                  event.status === EventStatus.LIVE
                    ? "bg-red-600 text-white"
                    : event.status === EventStatus.UPCOMING
                    ? "bg-green-600 text-white"
                    : "bg-gray-800/90 text-white"
                }`}
              >
                {event.status === EventStatus.LIVE && "Đang diễn ra"}
                {event.status === EventStatus.UPCOMING && "Sắp diễn ra"}
                {event.status === EventStatus.CLOSED && "Đã kết thúc"}
              </span>
            </div>
          </div>
        )}

        {/* Nội dung chính */}
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="-mt-20 md:-mt-28 z-10">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-5 md:p-8">
              {/* Tiêu đề - nhỏ hơn */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {event.title}
              </h1>

              {/* Mô tả - nhỏ hơn */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line mb-6">
                {event.description || "Không có mô tả."}
              </p>

              {/* Info Grid - siêu gọn */}
              <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Bắt đầu</div>
                      <div className="font-medium text-gray-900 text-sm">{formatLocal(event.startAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Kết thúc</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {event.closeAt ? formatLocal(event.closeAt) : "Chưa xác định"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Video className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Danh mục</div>
                      <div className="font-medium text-gray-900 text-sm">{categoryLabel[event.category]}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Đã đăng ký</div>
                      <div className="font-medium text-gray-900 text-sm">{event.registeredCount} người</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags - nhỏ xinh */}
              {activeTags.length > 0 && (
                <div className="mb-6">
  <div className="flex items-center gap-2 mb-2">
    <TagIcon className="w-3.5 h-3.5 text-gray-500" />
    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
      Thẻ sự kiện
    </span>
  </div>

  <div className="flex flex-wrap gap-3">
    {activeTags.map((tag) => (
      <span
        key={tag}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
                   bg-amber-50/90 text-amber-800 border border-amber-200/60
                   shadow-sm hover:shadow transition-shadow"
      >
        <TagIcon className="w-3.5 h-3.5 text-gray-500" />
        {tag}
      </span>
    ))}
  </div>
</div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {event.registeredByMe ? (
                  <button
                    onClick={handleUnregister}
                    disabled={loading || isClosed}
                    className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white hover:bg-red-50 transition text-sm shadow-sm"
                  >
                    Huỷ đăng ký
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={loading || isClosed}
                    className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white hover:bg-blue-700 transition text-sm shadow-sm"
                  >
                    Đăng ký tham gia
                  </button>
                )}
                {isClosed && (
                  <span className="text-xs text-gray-500 font-medium">Sự kiện đã đóng đăng ký</span>
                )}
              </div>
            </div>
          </div>

          {/* Streaming Rooms */}
          <div className="my-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" />
                  Phòng livestream
                </h2>
                <button
                  onClick={load}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white rounded-md border hover:bg-gray-50 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  Làm mới
                </button>
              </div>

              <div className="p-5">
                {joinableRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Chưa có phòng livestream</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinableRooms.map((r: any) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">
                              {r.title || r.roomName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatLocal(r.startAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="w-3.5 h-3.5" />
                                {r.roomName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  r.type === "LIVE" || r.isActive
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {r.type === "LIVE" || r.isActive ? "Đang live" : "Sắp diễn ra"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleJoinRoom(r.roomName)}
                            className="px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white hover:bg-blue-700 transition text-xs shadow-sm"
                          >
                            Vào phòng
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailView;