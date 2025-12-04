import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { deleteRoomAdmin } from "../../../services/streamingService";
import toast from "react-hot-toast";

export type RoomType = "UPCOMING" | "LIVE" | "CLOSED";

export interface TempRoom {
  tempId: string;
  id?: number; // có khi edit event
  roomName?: string; // 🆕 thêm: để xoá bằng API
  title: string;
  startAt: string; // value của <input type="datetime-local">
  type: RoomType;
}

interface Props {
  rooms: TempRoom[];
  onChange: (rooms: TempRoom[]) => void;
}

const roomTypeOptions: { label: string; value: RoomType }[] = [
  { label: "Sắp diễn ra", value: "UPCOMING" },
  { label: "Đang diễn ra", value: "LIVE" },
  { label: "Đã đóng", value: "CLOSED" },
];

const EventRoomsEditor: React.FC<Props> = ({ rooms, onChange }) => {
  const addRoom = () => {
    onChange([
      ...rooms,
      {
        tempId: crypto.randomUUID(),
        title: "",
        startAt: "",
        type: "UPCOMING",
      },
    ]);
  };

  const updateRoom = (
    tempId: string,
    field: keyof Omit<TempRoom, "tempId">,
    value: any
  ) => {
    onChange(
      rooms.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  const removeRoom = async (tempId: string) => {
    const room = rooms.find((r) => r.tempId === tempId);
    if (!room) return;

    // 🟢 Room mới tạo trong form (chưa lưu DB) -> chỉ cần xoá local
    if (!room.id) {
      onChange(rooms.filter((r) => r.tempId !== tempId));
      return;
    }

    // 🟡 Có id nhưng không có roomName (fallback): xoá local, nhắc user bấm Lưu
    if (!room.roomName) {
      onChange(rooms.filter((r) => r.tempId !== tempId));
      toast("Đã xoá phòng khỏi form, bấm 'Lưu' để cập nhật sự kiện.", {
        duration: 2000,
      });
      return;
    }

    const ok = window.confirm(
      `Xoá luôn phòng livestream trên server?\n(${room.title || room.roomName})`
    );
    if (!ok) return;

    try {
      const res = await deleteRoomAdmin(room.roomName);
      if (res.code === 200) {
        toast.success("Đã xoá phòng livestream.");
        onChange(rooms.filter((r) => r.tempId !== tempId));
      } else {
        toast.error(res.message || "Xoá phòng thất bại.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi gọi API xoá phòng.");
    }
  };

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Phòng livestream của sự kiện
        </h3>
        <button
          type="button"
          onClick={addRoom}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full 
                     bg-emerald-50 text-emerald-700 text-xs font-semibold 
                     border border-emerald-200 hover:bg-emerald-100"
        >
          <Plus className="w-3 h-3" />
          Thêm phòng
        </button>
      </div>

      {rooms.length === 0 ? (
        <p className="text-xs text-slate-500">
          Chưa có phòng nào. Nhấn <b>Thêm phòng</b> để tạo.
        </p>
      ) : (
        <div className="space-y-3">
          {rooms.map((room, idx) => (
            <div
              key={room.tempId}
              className="border border-slate-200 rounded-xl px-3 py-3 bg-slate-50/60 flex flex-col gap-3 md:flex-row md:items-end"
            >
              <div className="md:w-16 text-[11px] font-semibold text-slate-500">
                Phòng {idx + 1}
                {room.id && (
                  <span className="block text-[10px] text-slate-400">
                    (ID: {room.id})
                  </span>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={room.title}
                    onChange={(e) =>
                      updateRoom(room.tempId, "title", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: Phiên sáng, Q&A, Phòng phụ trợ..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Bắt đầu lúc
                  </label>
                  <input
                    type="datetime-local"
                    value={room.startAt}
                    onChange={(e) =>
                      updateRoom(room.tempId, "startAt", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Trạng thái phòng
                  </label>
                  <select
                    value={room.type}
                    onChange={(e) =>
                      updateRoom(
                        room.tempId,
                        "type",
                        e.target.value as RoomType
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {roomTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeRoom(room.tempId)}
                className="self-end text-red-500 hover:text-red-600 md:ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventRoomsEditor;
