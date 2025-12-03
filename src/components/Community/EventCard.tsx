import React from "react";
import {
  Users,
  Calendar,
  Clock,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  EventResponse,
  EventCategory,
  EventTag,
  EventStatus,
} from "../../types/event";

type EventCardProps = {
  event: EventResponse;
  onToggleRegister: (ev: EventResponse) => void;
};

const CATEGORY_LABEL: Record<EventCategory, string> = {
  GENERAL: "Chung",
  HERITAGE_TALK: "Toạ đàm",
  FESTIVAL: "Lễ hội",
  WORKSHOP: "Workshop",
  ONLINE_TOUR: "Tour online",
};

const EventCard: React.FC<EventCardProps> = ({ event, onToggleRegister }) => {
  const navigate = useNavigate();

  const isLive = event.status === EventStatus.LIVE;
  const isUpcoming = event.status === EventStatus.UPCOMING;

  const startStr = event.startAt
    ? new Date(event.startAt as any).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : "";

  const endStr = event.closeAt
    ? new Date(event.closeAt as any).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : "";

  const handleDetail = () => {
    navigate(`/events/${event.id}`);
  };

  const handleRegisterClick = () => {
    onToggleRegister(event);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Thumbnail */}
      {event.thumbnailUrl && (
        <div className="relative">
          <img
            src={event.thumbnailUrl}
            alt={event.title}
            className="w-full h-40 object-cover"
          />

          {isLive && (
            <span className="absolute top-3 left-3 bg-red-700 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
              LIVE
            </span>
          )}
          {isUpcoming && !isLive && (
            <span className="absolute top-3 left-3 bg-amber-800 text-white px-2 py-1 rounded-full text-xs font-medium">
              Sắp diễn ra
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category + participants */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-amber-900 font-medium bg-amber-100 px-2 py-1 rounded">
            {CATEGORY_LABEL[event.category]}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            {event.registeredCount} người đăng ký
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-semibold text-gray-900 mb-2 hover:text-amber-800 transition-colors cursor-pointer line-clamp-1"
          onClick={handleDetail}
        >
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Time */}
        <div className="flex items-start justify-between mb-3 text-xs text-gray-500 gap-3">
          <div className="flex-1 flex items-start gap-1">
            <Calendar className="w-4 h-4 mt-[2px]" />
            <div>
              <div>Bắt đầu:</div>
              <div className="font-medium text-gray-700">{startStr}</div>
            </div>
          </div>
          {endStr && (
            <div className="flex-1 flex items-start gap-1">
              <Clock className="w-4 h-4 mt-[2px]" />
              <div>
                <div>Kết thúc:</div>
                <div className="font-medium text-gray-700">{endStr}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tags (optional, nếu bạn dùng bitmask) */}
        <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
          <Tag className="w-3 h-3" />
          <span>{event.tags}</span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={handleDetail}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-amber-50 transition-colors"
          >
            Chi tiết
          </button>
          <button
            onClick={handleRegisterClick}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors ${
              event.registeredByMe
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:opacity-90"
            }`}
          >
            {event.registeredByMe ? "Huỷ đăng ký" : "Đăng ký"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
