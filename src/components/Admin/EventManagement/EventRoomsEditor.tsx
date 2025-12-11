// src/components/Admin/Event/EventRoomsEditor.tsx
import { useEvent } from "./EventContext";
import React, { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import {
  StreamingRoomType,
  RoomRole,
  ParticipantStatus,
} from "../../../types/enum";
import {
  deleteRoomAdmin,
  getRoomDetailAdmin,
  updateRoomAdmin,
} from "../../../services/streamingService";
import {
  StreamingRoomDetailResponse,
  StreamingRoomResponse,
  StreamingRoomUpdateRequest,
} from "../../../types/streaming";
import { EventResponse } from "../../../types/event";
import { isoToLocalInput, toLocalDisplay } from "../../../utils/datetime";


export interface TempRoom {
  tempId: string;
  id?: number;
  roomName?: string;
  title: string;
  startAt: string;
  type: StreamingRoomType;
}

interface Props {
  eventId?: number;
  rooms: TempRoom[];
  onChange: (rooms: TempRoom[]) => void;
  readOnly?: boolean;
  onRoomSaved?: () => void;
}

interface ExistingRoomPanelProps {
  eventId?: number;
  room: TempRoom;
  onClose: () => void;
  onUpdated: (patch: { startAt?: string; type?: StreamingRoomType }) => void;
  readOnly?: boolean;
  onRoomSaved?: () => void; // 🆕 thêm
}



const roomTypeOptions: { label: string; value: StreamingRoomType }[] = [
  { label: "Sắp diễn ra", value: StreamingRoomType.UPCOMING },
  { label: "Đang diễn ra", value: StreamingRoomType.LIVE },
  { label: "Đã đóng", value: StreamingRoomType.CLOSED },
];

const ROOM_TYPE_LABEL: Record<StreamingRoomType, string> = {
  [StreamingRoomType.UPCOMING]: "Sắp diễn ra",
  [StreamingRoomType.LIVE]: "Đang live",
  [StreamingRoomType.CLOSED]: "Đã đóng",
};
// ✅ Label cho role trong phòng
const ROOM_ROLE_LABEL: Record<RoomRole, string> = {
  [RoomRole.HOST]: "Chủ phòng",
  [RoomRole.COHOST]: "Đồng chủ trì",
  [RoomRole.SPEAKER]: "Diễn giả",
  [RoomRole.AUDIENCE]: "Khán giả",
};

// ✅ Label cho status participant
const PARTICIPANT_STATUS_LABEL: Record<ParticipantStatus, string> = {
  [ParticipantStatus.WAITING]: "Chờ vào ",
  [ParticipantStatus.ADMITTED]: "Đã vào phòng",
  [ParticipantStatus.KICKED]: "Bị kick",
  [ParticipantStatus.BANNED]: "Bị cấm",
  [ParticipantStatus.LEFT]: "Đã rời phòng",
};
// Label type phòng




// ===== Panel cho room ĐÃ TỒN TẠI (giống bên EventDetail) =====
function ExistingRoomPanel({
  eventId,
  room,
  onClose,
  onUpdated,
  readOnly,
  onRoomSaved, // 🆕
}: ExistingRoomPanelProps) {
  const { loadEvent } = useEvent();

  const isReadOnly = !!readOnly;

  const [detail, setDetail] = useState<StreamingRoomDetailResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  const [type, setType] = useState<StreamingRoomType>(
    typeof room.type === "number" ? room.type : StreamingRoomType.UPCOMING
  );
 const [startAtLocal, setStartAtLocal] = useState(
  isoToLocalInput(room.startAt || undefined)
);
  const [saving, setSaving] = useState(false);

  // Load chi tiết phòng (participants, startAt, type, ...)
  useEffect(() => {
    if (!room.roomName) return;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await getRoomDetailAdmin(room.roomName!);
        if (res.code === 200 && res.result) {
          setDetail(res.result);

          if (typeof res.result.type === "number") {
            setType(res.result.type);
          }
       if (res.result.startAt) {
  setStartAtLocal(isoToLocalInput(res.result.startAt));
}
        } else {
          toast.error(res.message || "Không lấy được chi tiết phòng.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi lấy chi tiết phòng.");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [room.roomName]);

 const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!room.roomName) return;

  const update: StreamingRoomUpdateRequest = { type };

  if (startAtLocal) {
    const d = new Date(startAtLocal);
    if (!Number.isNaN(d.getTime())) {
      update.startAt = d.toISOString();
    }
  }

  try {
    setSaving(true);
    const res = await updateRoomAdmin(room.roomName, update);
    if (res.code === 200 && res.result) {
      const srv = res.result as StreamingRoomResponse;

      // cập nhật detail local
      setDetail((prev) => (prev ? { ...prev, ...srv } : (srv as any)));

      // sync lại form event (dùng startAt dạng datetime-local)
      const newPatch: { startAt?: string; type?: StreamingRoomType } = {};

    if (srv.startAt) {
  const local = isoToLocalInput(srv.startAt);
  setStartAtLocal(local);
  newPatch.startAt = local;
}


      if (typeof srv.type === "number") {
        const t = srv.type as StreamingRoomType;
        setType(t);
        newPatch.type = t;
      } else {
        newPatch.type = type;
      }

      onUpdated(newPatch);

      // reload event trong context để selectedEvent & list được sync
      if (eventId) {
        await loadEvent(eventId);
      }

      // báo cho parent biết đã save xong → quay về list
      if (onRoomSaved) {
        onRoomSaved();
      }

      toast.success("Đã cập nhật phòng livestream");
    } else {
      toast.error(res.message || "Cập nhật phòng thất bại");
    }
  } catch (err) {
    console.error(err);
    toast.error("Lỗi khi cập nhật phòng");
  } finally {
    setSaving(false);
  }
};


  const current = detail;

  if (loading && !current) {
    return (
      <div className="py-4 text-sm text-slate-500">
        Đang tải chi tiết phòng...
      </div>
    );
  }

  if (!current) {
    return (
      <div className="py-4 text-sm text-red-500">
        Không có dữ liệu chi tiết phòng.
      </div>
    );
  }

  const typeLabel =
    typeof current.type === "number"
      ? ROOM_TYPE_LABEL[current.type]
      : current.isActive
      ? "Đang live"
      : "—";

return (
  <div className="space-y-4 text-sm text-slate-800">
      {/* Thông tin chi tiết y chang ViewRoomModal/EventDetail */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">RoomName</div>
          <div className="font-mono text-sm">{current.roomName}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Trạng thái</div>
          <div className="text-sm">{typeLabel}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Bắt đầu</div>
         <div className="text-sm">{toLocalDisplay(current.startAt)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Tạo lúc</div>
       <div className="text-sm">{toLocalDisplay(current.createdAt)}</div>
        </div>
        {current.closedAt && (
          <div>
            <div className="text-sm text-gray-500">Đóng lúc</div>
       <div className="text-sm">{toLocalDisplay(current.closedAt)}</div>
          </div>
        )}
        <div>
          <div className="text-sm text-gray-500">Người tạo (ID)</div>
          <div className="text-sm">{current.createdByUserId}</div>
        </div>
      </div>

      {/* Bảng người tham gia */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Người tham gia ({current.participants.length})
        </h4>
        {current.participants.length === 0 ? (
          <div className="text-sm text-gray-500">
            Chưa có người tham gia.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead>
  <tr className="bg-gray-50">
    <th className="px-3 py-2 text-left font-medium text-gray-500">
      Người dùng
    </th>
    <th className="px-3 py-2 text-left font-medium text-gray-500">
      RTC UID
    </th>
    <th className="px-3 py-2 text-left font-medium text-gray-500">
      Role
    </th>
    <th className="px-3 py-2 text-left font-medium text-gray-500">
      Trạng thái
    </th>
    <th className="px-3 py-2 text-left font-medium text-gray-500">
      Tham gia lúc
    </th>
  </tr>
</thead>
<tbody>
  {current.participants.map((p) => (
    <tr key={p.id} className="border-t">
      <td className="px-3 py-2">
        {p.userName || p.userId}
      </td>
      <td className="px-3 py-2 font-mono">{p.rtcUid}</td>
      <td className="px-3 py-2">
        {ROOM_ROLE_LABEL[p.role] ?? p.role}
      </td>
      <td className="px-3 py-2">
        {PARTICIPANT_STATUS_LABEL[p.status] ?? p.status}
      </td>
      <td className="px-3 py-2">
      {toLocalDisplay(p.createdAt)}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        )}
      </div>

      {/* Khu CHỈNH SỬA: startAt + type */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Chỉnh sửa thời gian & trạng thái
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Thời gian bắt đầu
            </label>
        <input
  type="datetime-local"
  value={startAtLocal}
  onChange={(e) => setStartAtLocal(e.target.value)}
  disabled={isReadOnly}
  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm 
             focus:outline-none focus:ring-2 focus:ring-indigo-500 
             disabled:bg-slate-50 disabled:text-slate-500"
/>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Trạng thái phòng
            </label>
         <select
  value={type}
  onChange={(e) =>
    setType(Number(e.target.value) as StreamingRoomType)
  }
  disabled={isReadOnly}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={StreamingRoomType.UPCOMING}>Sắp diễn ra</option>
              <option value={StreamingRoomType.LIVE}>Đang live</option>
              <option value={StreamingRoomType.CLOSED}>Đã đóng</option>
            </select>
          </div>
        </div>
      </div>
 {/* Buttons */}
    <div className="flex justify-end gap-2 pt-3">
      <button
        type="button"
        onClick={onClose}
        className="px-3 py-1.5 text-xs rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
      >
        Đóng panel
      </button>

      {!isReadOnly && (
        <button
          type="button"          // ⬅️ quan trọng: KHÔNG phải submit nữa
          disabled={saving}
          onClick={handleSubmit} // ⬅️ gọi trực tiếp handleSubmit
          className={`px-4 py-1.5 text-xs rounded-full text-white font-medium ${
            saving
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      )}
    </div>
  </div>
);

}

// ======================= MAIN EDITOR =======================
const EventRoomsEditor: React.FC<Props> = ({
  eventId,
  rooms,
  onChange,
  readOnly = false,
  onRoomSaved, // 🆕 nhận thêm
}) => {

  // id (tempId) của phòng đang mở dropdown
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addRoom = () => {
  if (readOnly) return;
    const newRoom: TempRoom = {
      tempId: crypto.randomUUID(),
      title: "",
      startAt: "",
      type: StreamingRoomType.UPCOMING,
    };
    onChange([...rooms, newRoom]);
    setExpandedId(newRoom.tempId);
  };

  const updateRoom = (

    tempId: string,
    field: keyof Omit<TempRoom, "tempId">,
    value: any
  ) => {
    
  if (readOnly) return;

    onChange(
      rooms.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

const removeRoom = async (tempId: string) => {
  if (readOnly) return;
    const room = rooms.find((r) => r.tempId === tempId);
    if (!room) return;

    // 🟢 Room mới tạo trong form (chưa lưu DB) -> chỉ cần xoá local
    if (!room.id) {
      onChange(rooms.filter((r) => r.tempId !== tempId));
      if (expandedId === tempId) setExpandedId(null);
      return;
    }

    // 🟡 Có id nhưng không có roomName (fallback): xoá local, nhắc user bấm Lưu
    if (!room.roomName) {
      onChange(rooms.filter((r) => r.tempId !== tempId));
      if (expandedId === tempId) setExpandedId(null);
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
        if (expandedId === tempId) setExpandedId(null);
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
    {!readOnly && (
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
)}
      </div>

      {rooms.length === 0 ? (
        <p className="text-xs text-slate-500">
          Chưa có phòng nào. Nhấn <b>Thêm phòng</b> để tạo.
        </p>
      ) : (
        <div className="space-y-3">
          {rooms.map((room, idx) => {
            const isExpanded = expandedId === room.tempId;
            const headerTitle =
              room.title?.trim() ||
              (room.roomName ? room.roomName : "Chưa đặt tiêu đề");

            const isExisting = !!room.id && !!room.roomName;

            return (
              <div
                key={room.tempId}
                className="border border-slate-200 rounded-xl bg-slate-50/60"
              >
                {/* HEADER: Phòng X + Title + chevron + nút xoá */}
                <div className="flex items-center justify-between px-3 py-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : room.tempId)
                    }
                    className="flex-1 flex items-center justify-between gap-3 text-left hover:bg-slate-100 rounded-lg px-1 py-1"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Phòng {idx + 1}
                        {room.id && (
                          <span className="ml-1 text-[10px] text-slate-400">
                            (ID: {room.id})
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-medium text-slate-800 line-clamp-1">
                        {headerTitle}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                 {!readOnly && (
  <button
    type="button"
    onClick={() => removeRoom(room.tempId)}
    className="ml-2 text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"
  >
    <Trash2 className="w-4 h-4" />
  </button>
)}
                </div>

                {/* BODY: 
                    - Room mới: form đơn giản (title + startAt + type)
                    - Room đã tồn tại: panel như trong EventDetail (gọi API chi tiết) 
                 */}
                {isExpanded && (
                  <div className="border-t border-slate-200 px-3 py-3 bg-white rounded-b-xl">
                   {isExisting ? (
  <ExistingRoomPanel
    eventId={eventId}
    room={room}
    onClose={() => setExpandedId(null)}
    onUpdated={(patch) => {
      if (patch.startAt !== undefined) {
        updateRoom(room.tempId, "startAt", patch.startAt);
      }
      if (patch.type !== undefined) {
        updateRoom(room.tempId, "type", patch.type);
      }
    }}
    readOnly={readOnly}
    onRoomSaved={onRoomSaved} // 🆕 pass callback
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 mb-1">
                            Tiêu đề phòng
                          </label>
                          <input
                            type="text"
                            value={room.title}
                            onChange={(e) =>
                              updateRoom(
                                room.tempId,
                                "title",
                                e.target.value
                              )
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
                              updateRoom(
                                room.tempId,
                                "startAt",
                                e.target.value
                              )
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
                                Number(
                                  e.target.value
                                ) as StreamingRoomType
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {roomTypeOptions.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventRoomsEditor;
