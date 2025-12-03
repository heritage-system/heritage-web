import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "./EventContext";
import {
  EventStatus,
  EventCategory,
  EventTag,
  EventResponse,
  EventWithRoomsCreateRequest,
  EventWithRoomsUpdateRequest,
} from "../../../types/event";
import {
  StreamingRoomSummaryResponse, // 🆕 thêm dòng này
} from "../../../types/event";
import { Plus, Edit2, Trash2, Radio, X, ArrowLeft, Play } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadImage } from "../../../services/fileService";
import ParticipantManager from "./ParticipantManager";
import {
  createEventWithRooms,
  updateEventWithRooms,
} from "../../../services/eventService";

import EventRoomsEditor, {
  TempRoom,
} from "./EventRoomsEditor";

// ===== Helpers =====
const tagOptions: { label: string; value: EventTag }[] = [
  { label: "Nổi bật", value: EventTag.FEATURED },
  { label: "Miễn phí", value: EventTag.FREE },
  { label: "Gói Premium", value: EventTag.PREMIUM },
  { label: "Có ghi hình", value: EventTag.RECORDED },
  { label: "Hỏi đáp (Q&A)", value: EventTag.QNA },
];

const statusTabs: { label: string; value: EventStatus }[] = [
  { label: "Sắp diễn ra", value: EventStatus.UPCOMING },
  { label: "Đang diễn ra", value: EventStatus.LIVE },
  { label: "Đã kết thúc", value: EventStatus.CLOSED },
];

// ISO -> value cho input datetime-local
function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";

  let normalized = iso;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(iso)) {
    normalized = iso + "Z";
  }

  const d = new Date(normalized);
  if (isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Hiển thị local cho list / rooms
function toLocalDisplay(iso: string | null | undefined): string {
  if (!iso) return "";
  let normalized = iso;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(iso)) {
    normalized = iso + "Z";
  }
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
}

const categoryOptions = [
  { label: "Chung", value: EventCategory.GENERAL },
  { label: "Toạ đàm di sản", value: EventCategory.HERITAGE_TALK },
  { label: "Lễ hội", value: EventCategory.FESTIVAL },
  { label: "Workshop", value: EventCategory.WORKSHOP },
  { label: "Tour trực tuyến", value: EventCategory.ONLINE_TOUR },
];

type EventFormMode = "create" | "edit";

interface EventFormValues {
  title: string;
  description: string;
  thumbnailUrl: string;
  startAt: string; // datetime-local
  closeAt: string;
  category: EventCategory;
  tags: EventTag;
}

// ====================== MAIN PAGE ======================
const EventList: React.FC = () => {
  const navigate = useNavigate();
  const {
    events,
    selectedEvent,
    setSelectedEvent,
    loadEvents,
    deleteEvent,
    loading,
  } = useEvent();

  const [statusFilter, setStatusFilter] = useState<EventStatus>(
    EventStatus.UPCOMING
  );
  const handleEnterLive = (room: StreamingRoomSummaryResponse) => {
    // Giống LiveRoomManager: join live bằng roomName
    navigate(`/live/${encodeURIComponent(room.roomName)}`);
  };
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");

  // load list khi mount & khi đổi statusFilter
  useEffect(() => {
    void loadEvents({ status: statusFilter });
  }, [loadEvents, statusFilter]);

  const handleDelete = async (ev: EventResponse) => {
    const ok = window.confirm(`Xoá sự kiện "${ev.title}"?`);
    if (!ok) return;
    await deleteEvent(ev.id);
    await loadEvents({ status: statusFilter });
  };

  const handleManageStreams = (ev: EventResponse) => {
    navigate(`/admin/stream?eventId=${ev.id}`);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setViewMode("create");
  };

  const handleEditEvent = (ev: EventResponse) => {
    setSelectedEvent(ev);
    setViewMode("edit");
  };

  const handleSavedFromForm = async (ev: EventResponse) => {
    setSelectedEvent(ev);
    setViewMode("list");
    await loadEvents({ status: statusFilter });
  };

  const handleBackFromForm = () => {
    setViewMode("list");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {viewMode === "list" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-800">
                Quản lý sự kiện
              </h1>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700"
                onClick={handleNewEvent}
              >
                <Plus className="w-4 h-4" />
                Tạo sự kiện
              </button>
            </div>

            {/* LIST + FILTER */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">
                  Danh sách sự kiện ({events.length})
                </h2>
                <div className="flex items-center gap-1">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(tab.value);
                        setSelectedEvent(null);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] border ${
                        statusFilter === tab.value
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                {events.length === 0 && (
                  <div className="p-4 text-sm text-slate-500">
                    Chưa có sự kiện nào. Nhấn nút{" "}
                    <span className="font-semibold">"Tạo sự kiện"</span> phía
                    trên để thêm mới.
                  </div>
                )}
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 cursor-pointer ${
                      selectedEvent?.id === ev.id ? "bg-indigo-50/60" : ""
                    }`}
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {ev.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {ev.title}
                        </p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {ev.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {toLocalDisplay(ev.startAt as unknown as string)}
                      </p>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {ev.registeredCount} người đã đăng ký
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageStreams(ev);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-100"
                          >
                            <Radio className="w-3 h-3" />
                            Phòng live
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(ev);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] border border-indigo-100"
                          >
                            <Edit2 className="w-3 h-3" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(ev);
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streaming rooms của selectedEvent (view only) */}
            {selectedEvent && selectedEvent.streamingRooms.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">
                  Các phòng livestream của "{selectedEvent.title}"
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {selectedEvent.streamingRooms.map((r) => (
                    <div
                      key={r.id}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold line-clamp-1">
                          {r.title || r.roomName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {r.type}
                        </span>
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500">
                        {r.startAt
                          ? toLocalDisplay(r.startAt as unknown as string)
                          : "Chưa thiết lập thời gian"}
                      </div>

                      <div className="mt-1 text-[11px]">
                        Trạng thái:{" "}
                        <span
                          className={
                            r.isActive ? "text-emerald-600" : "text-slate-500"
                          }
                        >
                          {r.isActive ? "Đang hoạt động" : "Không hoạt động"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEnterLive(r)}
                        className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full 
                       bg-green-50 text-green-700 text-[11px] border border-green-200 
                       hover:bg-green-100"
                      >
                        <Play className="w-3 h-3" />
                        Vào phòng
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ParticipantManager cho selectedEvent */}
            {selectedEvent && <ParticipantManager eventId={selectedEvent.id} />}
          </>
        )}

        {/* ==== FORM MODE: CREATE / EDIT + ROOMS EDITOR ==== */}
        {(viewMode === "create" || viewMode === "edit") && (
          <EventFormWithRooms
            mode={viewMode as EventFormMode}
            event={viewMode === "edit" ? selectedEvent : null}
            onBack={handleBackFromForm}
            onSaved={handleSavedFromForm}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

// ====================== FORM + ROOMS ======================
const EventFormWithRooms: React.FC<{
  mode: EventFormMode;
  event: EventResponse | null;
  onBack: () => void;
  onSaved: (ev: EventResponse) => void;
  loading?: boolean;
}> = ({ mode, event, onBack, onSaved, loading }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const [startAt, setStartAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [category, setCategory] = useState<EventCategory>(EventCategory.GENERAL);
  const [tags, setTags] = useState<EventTag>(EventTag.NONE);

  const [rooms, setRooms] = useState<TempRoom[]>([]);
  const [saving, setSaving] = useState(false);

  // init form khi chuyển mode / event
  useEffect(() => {
    if (mode === "edit" && event) {
      setTitle(event.title ?? "");
      setDescription(event.description ?? "");
      setThumbnailUrl(event.thumbnailUrl ?? "");
      setStartAt(isoToLocalInput(event.startAt));
      setCloseAt(isoToLocalInput(event.closeAt || undefined));
      setCategory(event.category ?? EventCategory.GENERAL);
      setTags(event.tags ?? EventTag.NONE);

      const mappedRooms: TempRoom[] = (event.streamingRooms || []).map(
        (r) => ({
          tempId: crypto.randomUUID(),
          id: r.id,
          roomName: r.roomName,
          title: r.title || "",
          startAt: r.startAt ? isoToLocalInput(r.startAt) : "",
          type: r.type as any,
        })
      );

      setRooms(mappedRooms);
    } else {
      // create mode
      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setStartAt("");
      setCloseAt("");
      setCategory(EventCategory.GENERAL);
      setTags(EventTag.NONE);
      setRooms([]);
    }
  }, [mode, event]);

  const toggleTag = (t: EventTag) => {
    setTags((prev) => (prev & t ? prev & ~t : prev | t));
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    try {
      const res = await uploadImage(file);
      if (res.code === 200 && res.result) {
        setThumbnailUrl(res.result);
        toast.success("Đã upload thumbnail");
      } else {
        toast.error(res.message || "Upload thumbnail thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề sự kiện");
      return;
    }
    if (!startAt) {
      toast.error("Vui lòng chọn thời gian bắt đầu");
      return;
    }

    try {
      setSaving(true);

      const startAtIso = new Date(startAt).toISOString();
      const closeAtIso = closeAt ? new Date(closeAt).toISOString() : undefined;

      // map rooms sang DTO
      const mappedRooms = rooms.map((r) => ({
        id: r.id,
        title: r.title?.trim() || "",
        startAt: r.startAt ? new Date(r.startAt).toISOString() : startAtIso,
        type: r.type as any,
      }));

      if (mode === "create") {
        const payload: EventWithRoomsCreateRequest = {
          title: title.trim(),
          description: description.trim() || "",
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          startAt: startAtIso,
          closeAt: closeAtIso,
          category,
          tags,
          rooms: mappedRooms.map((r) => ({
            title: r.title,
            startAt: r.startAt,
            type: r.type,
          })),
        };

        const res = await createEventWithRooms(payload);
        if ((res.code === 200 || res.code === 201) && res.result) {
          toast.success("Tạo sự kiện và phòng livestream thành công");
          onSaved(res.result);
        } else {
          toast.error(res.message || "Tạo sự kiện thất bại");
        }
      } else {
        if (!event) return;

        const payload: EventWithRoomsUpdateRequest = {
          id: event.id,
          title: title.trim(),
          description: description.trim() || "",
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          startAt: startAtIso,
          closeAt: closeAtIso,
          category,
          tags,
          rooms: mappedRooms,
        };

        const res = await updateEventWithRooms(event.id, payload);
        if (res.code === 200 && res.result) {
          toast.success("Cập nhật sự kiện và phòng livestream thành công");
          onSaved(res.result);
        } else {
          toast.error(res.message || "Cập nhật sự kiện thất bại");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu sự kiện");
    } finally {
      setSaving(false);
    }
  };

  const disabled = saving || loading;

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 shadow-sm mb-6">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              type="button"
              className="text-slate-600 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {mode === "create" ? "Tạo sự kiện" : "Chỉnh sửa sự kiện"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Điền thông tin sự kiện & thiết lập các phòng livestream ngay bên
                dưới.
              </p>
            </div>
          </div>

          <button
            form="event-with-rooms-form"
            type="submit"
            disabled={disabled}
            className={`px-5 py-2.5 rounded-full font-medium text-white text-sm shadow 
              ${
                disabled
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {saving
              ? "Đang lưu..."
              : mode === "create"
              ? "Tạo sự kiện"
              : "Lưu"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        <form
          id="event-with-rooms-form"
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tiêu đề
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tiêu đề sự kiện..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Mô tả ngắn gọn về sự kiện..."
            />
          </div>

          {/* Thumbnail */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Ảnh đại diện
              </label>
              <span className="text-[11px] text-slate-400">
                Ảnh sẽ được upload lên Cloudinary
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingThumb}
                  className="text-xs"
                />
                {uploadingThumb && (
                  <span className="text-xs text-slate-500">
                    Đang upload...
                  </span>
                )}
              </div>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Hoặc dán URL thumbnail sẵn có..."
                />
                {thumbnailUrl && (
                  <div className="mt-2">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Xem trước:
                    </p>
                    <img
                      src={thumbnailUrl}
                      alt="thumbnail preview"
                      className="w-40 h-24 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Thời gian bắt đầu
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Thời gian kết thúc (tuỳ chọn)
              </label>
              <input
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Danh mục sự kiện
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as unknown as EventCategory)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nhãn (tags)
              </label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((t) => {
                  const active = !!(tags & t.value);
                  return (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => toggleTag(t.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] border ${
                        active
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ====== STREAMING ROOMS EDITOR ====== */}
          <EventRoomsEditor rooms={rooms} onChange={setRooms} />

          {/* FOOTER */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              <X className="w-3 h-3" />
              Hủy
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-50"
            >
              {mode === "create" ? (
                <>
                  <Plus className="w-4 h-4" />
                  Tạo sự kiện
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventList;
