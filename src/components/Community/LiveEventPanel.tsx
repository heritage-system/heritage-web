import React from "react";
import { Video, Wifi, Users, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventResponse } from "../../types/event";
import { EventStatus } from "../../types/enum";

type LiveEventPanelProps = {
  event: EventResponse | null;
  onToggleRegister: (ev: EventResponse) => void;
};

const LiveEventPanel: React.FC<LiveEventPanelProps> = ({
  event,
  onToggleRegister,
}) => {
  const navigate = useNavigate();

  if (!event) {
    return (
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-lg">
        <div className="relative aspect-video flex items-center justify-center">
          <div className="text-center text-white px-4">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-60" />
            <h3 className="text-lg font-semibold mb-2">
              Hiện chưa có sự kiện đang live
            </h3>
            <p className="text-sm opacity-80">
              Hãy xem danh sách sự kiện bên dưới và đăng ký tham gia các sự
              kiện sắp diễn ra.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isLive = event.status === EventStatus.LIVE;

  const startStr = new Date(event.startAt as any).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const endStr = event.closeAt
    ? new Date(event.closeAt as any).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : null;

  const handleDetail = () => {
    navigate(`/events/${event.id}`);
  };

  const handleToggleRegister = () => {
    onToggleRegister(event);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-600 via-red-700 to-amber-900 rounded-xl overflow-hidden shadow-lg">
      <div className="relative aspect-video flex items-center justify-center">
        {/* Background thumbnail mờ */}
        {event.thumbnailUrl && (
          <img
            src={event.thumbnailUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />

        {/* Content */}
        <div className="relative z-10 text-white px-6 text-center max-w-2xl">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          {event.description && (
            <p className="text-sm opacity-90 mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{event.registeredCount} người đã đăng ký</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Bắt đầu: {startStr}</span>
            </div>
            {endStr && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Kết thúc: {endStr}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleDetail}
              className="px-4 py-2 rounded-lg bg-white/90 text-amber-900 text-sm font-medium hover:bg-white transition-colors"
            >
              Xem chi tiết sự kiện
            </button>
            <button
              onClick={handleToggleRegister}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                event.registeredByMe
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-black/40 hover:bg-black/60"
              }`}
            >
              <Wifi className="w-4 h-4" />
              {event.registeredByMe ? "Huỷ đăng ký" : "Đăng ký tham gia"}
            </button>
          </div>
        </div>

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-4 left-4 bg-red-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center z-10">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE - Sự kiện đang diễn ra
          </div>
        )}

        {/* Quality indicator (giữ lại cho đẹp) */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center z-10">
          <Wifi className="w-3 h-3 mr-1" />
          HD
        </div>
      </div>
    </div>
  );
};

export default LiveEventPanel;
