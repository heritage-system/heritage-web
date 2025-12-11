import React from "react";
import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventResponse } from "../../types/event";

type Props = {
  events: EventResponse[];
  onToggleRegister: (ev: EventResponse) => void;
};

const UpcomingEventsSidebar: React.FC<Props> = ({
  events,
  onToggleRegister,
}) => {
  const navigate = useNavigate();

  const handleDetail = (id: number) => {
    navigate(`/events/${id}`);
  };

  return (
    <div className="bg-white rounded-xl border p-4 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center text-gray-900">
          <Calendar className="w-4 h-4 mr-2 text-yellow-600" />
          Sự kiện sắp tới
        </h3>
        {/* Sau này bạn có thể link sang /events */}
        {/* <button className="text-amber-800 text-sm hover:underline">
          Xem tất cả
        </button> */}
      </div>

      {events.length === 0 && (
        <p className="text-sm text-gray-500">Hiện chưa có sự kiện sắp tới.</p>
      )}

      <div className="space-y-3">
        {events.map((ev) => {
          const startStr = new Date(ev.startAt as any).toLocaleString(
            "vi-VN",
            { timeZone: "Asia/Ho_Chi_Minh" }
          );

          return (
            <div
              key={ev.id}
              className="p-3 rounded-lg hover:bg-amber-50 cursor-pointer border border-amber-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4
                  className="font-medium text-gray-900 text-sm line-clamp-1 hover:text-amber-900"
                  onClick={() => handleDetail(ev.id)}
                >
                  {ev.title}
                </h4>
              </div>
              {ev.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {ev.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {startStr}
                </span>
                <span>{ev.registeredCount} đăng ký</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDetail(ev.id);
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white py-1 px-3 rounded text-xs hover:opacity-90 transition-colors"
                >
                  Chi tiết
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRegister(ev);
                  }}
                  className={`px-3 py-1 rounded text-xs border ${
                    ev.registeredByMe
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-white text-amber-900 border-amber-300"
                  }`}
                >
                  {ev.registeredByMe ? "Huỷ" : "Đăng ký"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingEventsSidebar;
