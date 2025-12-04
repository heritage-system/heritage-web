// src/components/Admin/Streaming/LiveRoomManager.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  FormEvent,
} from "react";
import { Edit, Eye, Trash2, X, Play } from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "../../Layouts/Pagination";
import {
  StreamingRoomResponse,
  StreamingRoomDetailResponse,
  StreamingRoomType,
  StreamingRoomUpdateRequest,
} from "../../../types/streaming";
import {
  getAdminRooms,
  getRoomDetailAdmin,
  updateRoomAdmin,
  deleteRoomAdmin,
} from "../../../services/streamingService";
import { useNavigate } from "react-router-dom";

// map type -> label
const TYPE_LABEL: Record<StreamingRoomType, string> = {
  UPCOMING: "Sắp diễn ra",
  LIVE: "Đang live",
  CLOSED: "Đã đóng",
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
};


const toInputDateTimeLocal = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);  // hiểu là local
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

interface LiveRoomManagerProps {
  eventId?: number;
  reloadToken?: number;    // 👈 NEW
}
const LiveRoomManager: React.FC<LiveRoomManagerProps> = ({ eventId }) => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<StreamingRoomResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedType, setSelectedType] = useState<
    "" | StreamingRoomType
  >("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewRoom, setViewRoom] = useState<
    StreamingRoomDetailResponse | null
  >(null);
  const [editRoom, setEditRoom] = useState<
    StreamingRoomDetailResponse | null
  >(null);
  const [deleteRoomTarget, setDeleteRoomTarget] =
    useState<StreamingRoomResponse | null>(null);

  // ---- Load rooms ----
  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      // vẫn gọi API chung, có filter type nếu chọn
      const res = await getAdminRooms(selectedType || undefined);
      if (res.code === 200 && res.result) {
        const all = res.result;

        // 🔥 nếu có eventId -> chỉ lấy room của event đó
        const filteredByEvent = eventId
          ? all.filter((r) => r.eventId === eventId)
          : all;

        setRooms(filteredByEvent);
      } else {
        toast.error(res.message || "Không tải được danh sách phòng.");
      }
    } catch (e) {
      toast.error("Lỗi khi tải danh sách phòng.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, eventId]);


  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // reset trang khi filter type/search đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  // ---- Filter + pagination ----
  const filteredRooms = useMemo(() => {
    const kw = searchTerm.trim().toLowerCase();
    if (!kw) return rooms;
    return rooms.filter((r) => {
      const title = (r.title || "").toLowerCase();
      const rn = r.roomName.toLowerCase();
      return title.includes(kw) || rn.includes(kw);
    });
  }, [rooms, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRooms.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);

  const pagedRooms = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredRooms.slice(start, start + itemsPerPage);
  }, [filteredRooms, safePage, itemsPerPage]);

  // ---- Handlers ----
  const handleView = async (room: StreamingRoomResponse) => {
    try {
      const res = await getRoomDetailAdmin(room.roomName);
      if (res.code === 200 && res.result) {
        setViewRoom(res.result);
      } else {
        toast.error(res.message || "Không lấy được chi tiết phòng.");
      }
    } catch {
      toast.error("Lỗi khi lấy chi tiết phòng.");
    }
  };

  const handleEdit = async (room: StreamingRoomResponse) => {
    try {
      const res = await getRoomDetailAdmin(room.roomName);
      if (res.code === 200 && res.result) {
        setEditRoom(res.result);
      } else {
        toast.error(res.message || "Không lấy được chi tiết phòng.");
      }
    } catch {
      toast.error("Lỗi khi lấy chi tiết phòng.");
    }
  };

  const handleDelete = (room: StreamingRoomResponse) => {
    setDeleteRoomTarget(room);
  };

  const confirmDelete = async () => {
    if (!deleteRoomTarget) return;
    try {
      const res = await deleteRoomAdmin(deleteRoomTarget.roomName);
      if (res.code === 200) {
        toast.success("Xoá phòng thành công!");
        setDeleteRoomTarget(null);
        await loadRooms();
      } else {
        toast.error(
          res.message || "Xoá phòng thất bại, vui lòng thử lại."
        );
      }
    } catch {
      toast.error("Xoá phòng thất bại, vui lòng thử lại.");
    }
  };

  const handleSaveEdit = async (update: StreamingRoomUpdateRequest) => {
    if (!editRoom) return;
    try {
      const res = await updateRoomAdmin(editRoom.roomName, update);
      if (res.code === 200 && res.result) {
        toast.success("Cập nhật phòng thành công!");
        setEditRoom(null);
        await loadRooms();
      } else {
        toast.error(
          res.message || "Cập nhật phòng thất bại, vui lòng thử lại."
        );
      }
    } catch {
      toast.error("Cập nhật phòng thất bại, vui lòng thử lại.");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    toast("Đã xoá bộ lọc tìm kiếm.", {
      duration: 1500,
      position: "top-right",
      style: { background: "#059669", color: "#fff" },
    });
  };

  const handleJoinLive = (room: StreamingRoomResponse) => {
    // Admin đi vào live page, LiveRoomPage sẽ tự join dựa vào roomName trong URL
    navigate(`/live/${encodeURIComponent(room.roomName)}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Quản lý phòng livestream
        </h2>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề hoặc RoomName..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded-md w-72"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center gap-1"
          >
            <X size={14} /> Xóa
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-600">Trạng thái:</span>
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(
                e.target.value as "" | StreamingRoomType
              )
            }
            className="border px-2 py-2 rounded-md text-sm"
          >
            <option value="">Tất cả</option>
            <option value="Upcoming">Sắp diễn ra</option>
            <option value="Live">Đang live</option>
            <option value="Closed">Đã đóng</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Số mục/trang:</span>
            <input
              type="number"
              min={1}
              value={itemsPerPage}
              onChange={(e) => {
                const v = Math.max(1, Number(e.target.value) || 1);
                setItemsPerPage(v);
                setCurrentPage(1);
              }}
              className="border px-2 py-1 rounded-md w-16 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RoomName
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bắt đầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tạo lúc
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-gray-500"
                >
                  Đang tải...
                </td>
              </tr>
            ) : pagedRooms.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-gray-500"
                >
                  Không có phòng nào.
                </td>
              </tr>
            ) : (
              pagedRooms.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm">{room.id}</td>
                  <td
                    className="px-6 py-4 text-sm"
                    title={room.title}
                  >
                    {room.title || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">
                    {room.roomName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {room.type
                      ? TYPE_LABEL[room.type]
                      : room.isActive
                      ? "Đang live"
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatDateTime(room.startAt)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatDateTime(room.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleJoinLive(room)}
                        className="text-green-600 hover:text-green-900"
                        title="Vào live (cohost)"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={() => handleView(room)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(room)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
                        className="text-red-600 hover:text-red-900"
                        title="Xoá"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredRooms.length}
      />

      {/* Modal: View detail */}
      {viewRoom && (
        <ViewRoomModal
          room={viewRoom}
          onClose={() => setViewRoom(null)}
        />
      )}

      {/* Modal: Edit room */}
      {editRoom && (
        <EditRoomModal
          room={editRoom}
          onSave={handleSaveEdit}
          onClose={() => setEditRoom(null)}
        />
      )}

      {/* Modal: Confirm delete */}
      {deleteRoomTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <p className="mb-4">
              Bạn có chắc chắn muốn xoá phòng{" "}
              <strong>{deleteRoomTarget.roomName}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteRoomTarget(null)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Modal: View detail =====
const ViewRoomModal: React.FC<{
  room: StreamingRoomDetailResponse;
  onClose: () => void;
}> = ({ room, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Chi tiết phòng: {room.title || room.roomName}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">RoomName</div>
              <div className="font-mono text-sm">
                {room.roomName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Trạng thái</div>
              <div className="text-sm">
                {room.type
                  ? TYPE_LABEL[room.type]
                  : room.isActive
                  ? "Đang live"
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Bắt đầu</div>
              <div className="text-sm">
                {formatDateTime(room.startAt)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Tạo lúc</div>
              <div className="text-sm">
                {formatDateTime(room.createdAt)}
              </div>
            </div>
            {room.closedAt && (
              <div>
                <div className="text-sm text-gray-500">Đóng lúc</div>
                <div className="text-sm">
                  {formatDateTime(room.closedAt)}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500">Người tạo (ID)</div>
              <div className="text-sm">
                {room.createdByUserId}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Người tham gia ({room.participants.length})
            </h4>
            {room.participants.length === 0 ? (
              <div className="text-sm text-gray-500">
                Chưa có người tham gia.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        UserId
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        RTC UID
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        Role
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        Tham gia lúc
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.participants.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t"
                      >
                        <td className="px-3 py-2">
                          {p.userId}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {p.rtcUid}
                        </td>
                        <td className="px-3 py-2">
                          {p.role}
                        </td>
                        <td className="px-3 py-2">
                          {p.status}
                        </td>
                        <td className="px-3 py-2">
                          {formatDateTime(p.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Modal: Edit room =====
const EditRoomModal: React.FC<{
  room: StreamingRoomDetailResponse;
  onSave: (update: StreamingRoomUpdateRequest) => void;
  onClose: () => void;
}> = ({ room, onSave, onClose }) => {
  const [title, setTitle] = useState(room.title || "");
  const [type, setType] = useState<StreamingRoomType>(
    room.type || "UPCOMING"
  );
  const [startAtLocal, setStartAtLocal] = useState(
    toInputDateTimeLocal(room.startAt || room.createdAt)
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const update: StreamingRoomUpdateRequest = {
      title: title.trim(),
      type,
    };
    if (startAtLocal) {
      // convert local -> ISO
      const d = new Date(startAtLocal);
      if (!Number.isNaN(d.getTime())) {
        update.startAt = d.toISOString();
      }
    }
    onSave(update);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl w-full max-w-md relative p-6 space-y-4"
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          type="button"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold mb-2">
          Chỉnh sửa phòng: {room.roomName}
        </h3>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tiêu đề
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="Tiêu đề phòng..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Thời gian bắt đầu
          </label>
          <input
            type="datetime-local"
            value={startAtLocal}
            onChange={(e) => setStartAtLocal(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Loại phòng
          </label>
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as StreamingRoomType)
            }
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="Upcoming">Sắp diễn ra</option>
            <option value="Live">Đang live</option>
            <option value="Closed">Đã đóng</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md text-sm"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default LiveRoomManager;
