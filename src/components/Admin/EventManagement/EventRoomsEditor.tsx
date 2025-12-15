// src/components/Admin/Event/EventRoomsEditor.tsx
import { useEvent } from "./EventContext";
import React, { useState, useEffect, FormEvent } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
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
  onRoomSaved?: () => void;
}

// Constants
const ROOM_TYPE_LABEL: Record<StreamingRoomType, string> = {
  [StreamingRoomType.UPCOMING]: "Sắp diễn ra",
  [StreamingRoomType.LIVE]: "Đang live",
  [StreamingRoomType.CLOSED]: "Đã đóng",
};

const ROOM_TYPE_COLOR: Record<StreamingRoomType, string> = {
  [StreamingRoomType.UPCOMING]: "bg-blue-100 text-blue-700 border-blue-200",
  [StreamingRoomType.LIVE]: "bg-green-100 text-green-700 border-green-200",
  [StreamingRoomType.CLOSED]: "bg-gray-100 text-gray-700 border-gray-200",
};

const ROOM_ROLE_LABEL: Record<RoomRole, string> = {
  [RoomRole.HOST]: "Chủ phòng",
  [RoomRole.COHOST]: "Đồng chủ trì",
  [RoomRole.SPEAKER]: "Diễn giả",
  [RoomRole.AUDIENCE]: "Khán giả",
};

const PARTICIPANT_STATUS_LABEL: Record<ParticipantStatus, string> = {
  [ParticipantStatus.WAITING]: "Chờ vào",
  [ParticipantStatus.ADMITTED]: "Đã vào phòng",
  [ParticipantStatus.KICKED]: "Bị kick",
  [ParticipantStatus.BANNED]: "Bị cấm",
  [ParticipantStatus.LEFT]: "Đã rời phòng",
};

const PARTICIPANT_STATUS_COLOR: Record<ParticipantStatus, string> = {
  [ParticipantStatus.WAITING]: "bg-yellow-50 text-yellow-700",
  [ParticipantStatus.ADMITTED]: "bg-green-50 text-green-700",
  [ParticipantStatus.KICKED]: "bg-red-50 text-red-700",
  [ParticipantStatus.BANNED]: "bg-red-100 text-red-800",
  [ParticipantStatus.LEFT]: "bg-gray-50 text-gray-600",
};

// ===== ExistingRoomPanel (chỉ đổi UI, giữ nguyên logic) =====
function ExistingRoomPanel({
  eventId,
  room,
  onClose,
  onUpdated,
  readOnly,
  onRoomSaved,
}: ExistingRoomPanelProps) {
  const { loadEvent } = useEvent();
  const isReadOnly = !!readOnly;

  const [detail, setDetail] = useState<StreamingRoomDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [type, setType] = useState<StreamingRoomType>(StreamingRoomType.UPCOMING);
  const [startAtLocal, setStartAtLocal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!room.roomName) return;

    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await getRoomDetailAdmin(room.roomName!);
        if (res.code === 200 && res.result) {
          setDetail(res.result);
          if (typeof res.result.type === "number") setType(res.result.type);
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
      if (!isNaN(d.getTime())) {
        update.startAt = d.toISOString();
      }
    }

    try {
      setSaving(true);
      const res = await updateRoomAdmin(room.roomName, update);
      if (res.code === 200 && res.result) {
        const srv = res.result as StreamingRoomResponse;

        setDetail((prev) => (prev ? { ...prev, ...srv } : (srv as any)));

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
        if (eventId) await loadEvent(eventId);
        if (onRoomSaved) onRoomSaved();

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
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">Đang tải chi tiết phòng...</div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-red-500">Không có dữ liệu chi tiết phòng.</div>
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
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="bg-gradient-to-br to-white rounded-xl p-5 border border-indigo-100">
        <h4 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full"></div>
          Thông tin cơ bản
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-medium">Room Name</div>
            <div className="font-mono text-sm text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200">
              {current.roomName}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-medium">Trạng thái</div>
            <div
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${
                ROOM_TYPE_COLOR[current.type as StreamingRoomType] || "bg-gray-100 text-gray-700"
              }`}
            >
              {typeLabel}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Bắt đầu
            </div>
            <div className="text-sm text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200">
              {toLocalDisplay(current.startAt)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Tạo lúc
            </div>
            <div className="text-sm text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200">
              {toLocalDisplay(current.createdAt)}
            </div>
          </div>
          {current.closedAt && (
            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-medium">Đóng lúc</div>
              <div className="text-sm text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200">
                {toLocalDisplay(current.closedAt)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bảng người tham gia */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            Người tham gia
            <span className="ml-auto text-xs font-normal text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
              {current.participants.length} người
            </span>
          </h4>
        </div>
        <div className="p-5">
          {current.participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="text-sm text-slate-500">Chưa có người tham gia</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      RTC UID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tham gia lúc
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {current.participants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-800">
                          {p.userName || p.userId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {p.rtcUid}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">
                          {ROOM_ROLE_LABEL[p.role] ?? p.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            PARTICIPANT_STATUS_COLOR[p.status] || "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {PARTICIPANT_STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {toLocalDisplay(p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form chỉnh sửa */}
      <div className="bg-gradient-to-br to-white rounded-xl p-5 border border-indigo-100">
        <h4 className="text-sm font-semibold text-amber-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full"></div>
          Chỉnh sửa thông tin
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Thời gian bắt đầu
            </label>
            <input
              type="datetime-local"
              value={startAtLocal}
              onChange={(e) => setStartAtLocal(e.target.value)}
              disabled={isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
                         transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Trạng thái phòng
            </label>
            <select
              value={type}
              onChange={(e) => setType(Number(e.target.value) as StreamingRoomType)}
              disabled={isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         disabled:bg-slate-100 disabled:cursor-not-allowed
                         transition-all"
            >
              <option value={StreamingRoomType.UPCOMING}>Sắp diễn ra</option>
              <option value={StreamingRoomType.LIVE}>Đang live</option>
              <option value={StreamingRoomType.CLOSED}>Đã đóng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-medium rounded-lg
                     border border-slate-300 text-slate-700 bg-white
                     hover:bg-slate-50 transition-colors"
        >
          Đóng
        </button>
        {!isReadOnly && (
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg text-white
                       transition-all transform hover:scale-105 active:scale-95
                       ${
                         saving
                           ? "bg-slate-400 cursor-not-allowed"
                           : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
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
  onRoomSaved,
}) => {
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

    // Phòng mới → xóa local
    if (!room.id) {
      onChange(rooms.filter((r) => r.tempId !== tempId));
      if (expandedId === tempId) setExpandedId(null);
      return;
    }

    // Có id nhưng chưa có roomName → xóa local + nhắc lưu
    if (!room.roomName) {
      onChange(rooms.filter((r) => r.tempId !== tempId));
      if (expandedId === tempId) setExpandedId(null);
      toast("Đã xoá phòng khỏi form, bấm 'Lưu' để cập nhật sự kiện.", { duration: 3000 });
      return;
    }

    // Phòng đã tồn tại thật sự → confirm xóa server
    const ok = window.confirm(
      `Xoá luôn phòng livestream trên server?\n(${room.title || room.roomName})`
    );
    if (!ok) return;

    try {
      const res = await deleteRoomAdmin(room.roomName); // sửa lỗi typo roomNameBlur → roomName
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
    <div className="mt-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            Phòng livestream của sự kiện
          </h3>
          <p className="text-xs text-slate-600 mt-1 ml-4">
            Quản lý các phòng livestream trong sự kiện này
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addRoom}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                       bg-indigo-600 text-white text-sm font-semibold
                       hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95
                       shadow-lg shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            Thêm phòng
          </button>
        )}
      </div>

      {/* Empty state */}
      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 font-medium">Chưa có phòng nào</p>
          <p className="text-xs text-slate-500 mt-1">
            Nhấn <span className="font-semibold text-indigo-600">Thêm phòng</span> để tạo phòng livestream mới
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room, idx) => {
            const isExpanded = expandedId === room.tempId;
            const headerTitle =
              room.title?.trim() || (room.roomName ? room.roomName : "Chưa đặt tiêu đề");
            const isExisting = !!room.id && !!room.roomName;

            return (
              <div
                key={room.tempId}
                className={`border-2 rounded-xl transition-all ${
                  isExpanded
                    ? "border-indigo-300 shadow-lg shadow-indigo-500/10 bg-white"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                }`}
              >
                {/* HEADER */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : room.tempId)}
                    className="flex-1 flex items-center gap-4 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                          isExpanded
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {headerTitle}
                        </div>
                        {room.id && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            ID: {room.id} • {isExisting ? "Đã lưu" : "Mới tạo"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-auto">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </button>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeRoom(room.tempId)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* BODY */}
                {isExpanded && (
                  <div className="border-t-2 border-slate-100 px-5 py-5 bg-white">
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
                        onRoomSaved={onRoomSaved}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                          Thông tin phòng mới
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">
                              Tiêu đề phòng
                            </label>
                            <input
                              type="text"
                              value={room.title}
                              onChange={(e) =>
                                updateRoom(room.tempId, "title", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                         transition-all"
                              placeholder="VD: Phiên sáng, Q&A, Phòng phụ trợ..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">
                              Bắt đầu lúc
                            </label>
                            <input
                              type="datetime-local"
                              value={room.startAt}
                              onChange={(e) =>
                                updateRoom(room.tempId, "startAt", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                         transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">
                              Trạng thái phòng
                            </label>
                            <select
                              value={room.type}
                              onChange={(e) =>
                                updateRoom(
                                  room.tempId,
                                  "type",
                                  Number(e.target.value) as StreamingRoomType
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                         transition-all"
                            >
                              <option value={StreamingRoomType.UPCOMING}>Sắp diễn ra</option>
                              <option value={StreamingRoomType.LIVE}>Đang live</option>
                              <option value={StreamingRoomType.CLOSED}>Đã đóng</option>
                            </select>
                          </div>
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