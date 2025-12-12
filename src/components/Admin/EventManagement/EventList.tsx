import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "./EventContext";
import {

  EventResponse,
  EventWithRoomsCreateRequest,
  EventWithRoomsUpdateRequest,
  EVENT_STATUS_LABEL,
} from "../../../types/event";
import {
  StreamingRoomSummaryResponse, // 🆕 thêm dòng này
} from "../../../types/event";
import { Plus, Edit, Trash2, X, ArrowLeft, Play, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadImage } from "../../../services/fileService";
import ParticipantManager from "./ParticipantManager";
import {
  createEventWithRooms,
  updateEventWithRooms,
} from "../../../services/eventService";
import PortalModal from "../../Layouts/ModalLayouts/PortalModal";
import EventRoomsEditor, {
  TempRoom,
} from "./EventRoomsEditor";
import { EventCategory, EventStatus, EventTag } from "../../../types/enum";
import { isoToLocalInput, toLocalDisplay } from "../../../utils/datetime";

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


const categoryOptions = [
  { label: "Chung", value: EventCategory.GENERAL },
  { label: "Toạ đàm di sản", value: EventCategory.HERITAGE_TALK },
  { label: "Lễ hội", value: EventCategory.FESTIVAL },
  { label: "Workshop", value: EventCategory.WORKSHOP },
  { label: "Tour trực tuyến", value: EventCategory.ONLINE_TOUR },
];

type EventFormMode = "create" | "edit" | "detail";

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

// 🆕 state cho search/filter
const [keyword, setKeyword] = useState("");
const [categoryFilter, setCategoryFilter] = useState<EventCategory | "">("");
const [tagFilter, setTagFilter] = useState<EventTag | "">("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleEnterLive = (room: StreamingRoomSummaryResponse) => {
    // Giống LiveRoomManager: join live bằng roomName
    navigate(`/live/${encodeURIComponent(room.roomName)}`);
  };
 const [viewMode, setViewMode] =
  useState<"list" | "create" | "edit" | "detail">("list");


  // load list khi mount & khi đổi statusFilter
  useEffect(() => {
    void loadEvents({ status: statusFilter });
  }, [loadEvents, statusFilter]);

   const handleShowDeleteModal = async (ev: EventResponse) => {
    setSelectedEvent(ev);
    setShowDeleteModal(true);
  }
  const handleDelete = async (id: number) => {   
    if(!selectedEvent) return

    try {
      await deleteEvent(selectedEvent.id);
      setShowDeleteModal(false);     
      await loadEvents({ status: statusFilter });
    }
    catch {

    }    
      
  };

const handleManageDetails = (ev: EventResponse) => {
  setSelectedEvent(ev);      // chọn sự kiện
  setViewMode("detail");     // chuyển sang mode chi tiết
};
const handleBackFromDetail = () => {
  setViewMode("list");
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
// 🔁 Hàm gọi API list với mọi filter
const fetchEvents = React.useCallback(() => {
  void loadEvents({
    status: statusFilter,
    keyword: keyword.trim() || undefined,
    category:
      categoryFilter === ""
        ? undefined
        : (categoryFilter as EventCategory),
    tag: tagFilter === "" ? undefined : (tagFilter as EventTag),
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
}, [loadEvents, statusFilter, keyword, categoryFilter, tagFilter, fromDate, toDate]);

// 🟢 gọi khi mount + khi statusFilter đổi
useEffect(() => {
  fetchEvents();
}, [fetchEvents]);
const handleApplyFilters = () => {
  fetchEvents();
};

const handleClearFilters = () => {
  setKeyword("");
  setCategoryFilter("");
  setTagFilter("");
  setFromDate("");
  setToDate("");
  // Sau khi clear thì gọi lại
  void loadEvents({ status: statusFilter });
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

 {/* 🆕 KHU VỰC TÌM KIẾM / FILTER - ĐÃ FIX UI */}
<div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
  {/* Header với tiêu đề + nút nhỏ gọn */}
  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-slate-700">Bộ lọc tìm kiếm</h3>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClearFilters}
        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        Xoá lọc
      </button>
      <button
        type="button"
        onClick={handleApplyFilters}
        className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
      >
        Áp dụng
      </button>
    </div>
  </div>

  {/* Nội dung filter */}
  <div className="p-5 space-y-5">
    {/* Hàng 1: Thanh tìm kiếm full width */}
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        Tìm kiếm
      </label>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm theo tiêu đề sự kiện..."
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
      />
    </div>

    {/* Hàng 2: 4 filter - responsive 1/2/4 cột */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Danh mục */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Danh mục
        </label>
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value === ""
                ? ""
                : (Number(e.target.value) as EventCategory)
            )
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        >
          <option value="">Tất cả danh mục</option>
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Nhãn */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Nhãn
        </label>
        <select
          value={tagFilter}
          onChange={(e) =>
            setTagFilter(
              e.target.value === ""
                ? ""
                : (Number(e.target.value) as EventTag)
            )
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        >
          <option value="">Tất cả nhãn</option>
          {tagOptions.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Từ ngày */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Từ ngày
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Đến ngày */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Đến ngày
        </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>
    </div>

    {/* Hàng 3: Nút hành động lớn, căn phải
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={handleClearFilters}
        className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        Xoá lọc
      </button>
      <button
        type="button"
        onClick={handleApplyFilters}
        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
      >
        Áp dụng lọc
      </button>
    </div> */}
  </div>
</div>

    {/* LIST + FILTER (status tabs giữ nguyên) */}
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
  {EVENT_STATUS_LABEL[ev.status]}
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
    handleManageDetails(ev);
  }}
  className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 transition-colors"
  title="Xem chi tiết"
>
  <Eye size={16} />
</button>

<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleEditEvent(ev);
  }}
  className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition-colors"
  title="Chỉnh sửa"
>
  <Edit size={16} />
</button>

<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleShowDeleteModal(ev);
  }}
  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
  title="Xóa"
>
  <Trash2 size={16} />
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
 

<PortalModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        centered
        size="sm"
      >
        <div className="p-6 bg-white rounded-lg w-[380px]">
          <h2 className="text-xl font-bold mb-4 text-center">Xác nhận xóa</h2>

          <p className="text-gray-600 mb-6 text-center">
            Bạn có chắc muốn xóa sự kiện này không? Hành động này không thể hoàn tác.
          </p>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded bg-gray-300"
              onClick={() => setShowDeleteModal(false)}
            >
              Hủy
            </button>

            <button
              className="px-4 py-2 rounded bg-red-600 text-white"
              onClick={() => handleDelete(1)}
            >
              Xóa
            </button>
          </div>
        </div>
      </PortalModal>

        {/* ==== FORM MODE: CREATE / EDIT + ROOMS EDITOR ==== */}
       {/* FORM / DETAIL MODE: dùng chung EventFormWithRooms */}
{(viewMode === "create" || viewMode === "edit" || viewMode === "detail") && (
  <EventFormWithRooms
    mode={viewMode as EventFormMode}
    event={viewMode === "create" ? null : selectedEvent}
    onBack={viewMode === "detail" ? handleBackFromDetail : handleBackFromForm}
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
  const isClosedEvent = event?.status === EventStatus.CLOSED;

  // 🔒 Tất cả field read-only nếu:
  // - đang ở mode "detail" HOẶC
  // - đang edit nhưng event đã CLOSEDEnterLiveButton
  const readOnlyAll = mode === "detail" || (mode === "edit" && isClosedEvent);

  // ✅ Cho phép sửa closeAt nếu đang edit & event CLOSED
  const canEditCloseTime = mode === "edit" || isClosedEvent;

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
  if ((mode === "edit" || mode === "detail") && event) {
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
  if (readOnlyAll) return;
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

  // ❌ Chỉ chặn ở mode "detail"
  if (mode === "detail") return;

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
        console.log(mappedRooms);
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
      <div className=" bg-white border-b border-slate-200 shadow-sm mb-6 rounded-2xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between ro">
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
  {mode === "create"
    ? "Tạo sự kiện"
    : mode === "edit"
    ? "Chỉnh sửa sự kiện"
    : "Chi tiết sự kiện"}
</h1>
<p className="text-sm text-slate-500 mt-1">
  {mode === "detail"
    ? "Xem chi tiết thông tin sự kiện & các phòng livestream."
    : "Điền thông tin sự kiện & thiết lập các phòng livestream ngay bên dưới."}
</p>

            </div>
          </div>

         {mode !== "detail" && (
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
)}

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
  disabled={readOnlyAll}
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
              disabled={readOnlyAll}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Mô tả ngắn gọn về sự kiện..."
            />
          </div>

         {/* Thumbnail – Ảnh đại diện sự kiện (CHỈ FIX UI, RÕ CHỌN TỆP HOẶC DÁN URL) */}
<div className="space-y-6">

  {/* Tiêu đề */}
  <div className="flex items-center justify-between">
    <label className="text-sm font-semibold text-slate-800">
      Ảnh đại diện sự kiện
    </label>
    <span className="text-xs text-slate-500">
      Khuyến nghị 16:9 • Tối đa 5MB
    </span>
  </div>

  {/* Preview ảnh – đẹp như cũ nhưng mượt hơn */}
  <div className="relative -mx-6 md:mx-0">
    {thumbnailUrl ? (
      <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
        <img
          src={thumbnailUrl}
          alt="Ảnh đại diện sự kiện"
          className="w-full h-96 object-cover object-center"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/1200x675/f1f5f9/64748b?text=Ảnh+không+tải+được";
          }}
        />
      </div>
    ) : (
      <div className="h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-300 
                      flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="w-24 h-24 bg-slate-200 border-2 border-dashed rounded-3xl" />
        <p className="text-lg font-medium text-slate-600">Chưa có ảnh đại diện</p>
        <p className="text-sm">Chọn tệp hoặc dán link bên dưới</p>
      </div>
    )}
  </div>

  {/* PHẦN CHỌN ẢNH – RÕ RÀNG, ĐẸP, DỄ HIỂU NHẤT */}
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* 1. Chọn tệp từ máy – card đẹp, nổi bật */}
      {/* Chọn tệp từ máy – gọn, đẹp, đơn giản */}
<label className="flex items-center justify-center gap-3 px-6 py-4 
                  bg-indigo-50 hover:bg-indigo-100 border-2 border-dashed border-indigo-300 
                  hover:border-indigo-500 rounded-xl cursor-pointer transition-all">
  
  <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>

  <div className="text-left">
    <div className="font-medium text-slate-800">Chọn tệp</div>
    <div className="text-xs text-slate-600">Click để tải lên</div>
  </div>

  <input
    type="file"
    accept="image/*"
    onChange={handleThumbnailUpload}
    disabled={uploadingThumb || readOnlyAll}
    className="hidden"
  />
</label>

      {/* 2. Dán link ảnh – input rõ ràng, đẹp */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 text-center md:text-left">
          Hoặc gán URL
        </span>
        <input
          type="text"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          disabled={readOnlyAll}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                     placeholder:text-slate-400 transition-all"
        />
      </div>

    </div>

    {/* Loading khi upload */}
    {uploadingThumb && (
      <div className="flex items-center justify-center gap-2 text-indigo-600">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Đang tải ảnh lên...</span>
      </div>
    )}
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
                disabled={readOnlyAll}
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
                 disabled={!canEditCloseTime}  // ✅ chỉ cho sửa khi edit & CLOSED
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
    setCategory(Number(e.target.value) as EventCategory)
  }
   disabled={readOnlyAll}
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
                Nhãn (thẻ)
              </label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((t) => {
                  const active = !!(tags & t.value);
                  return (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => toggleTag(t.value)}
                      disabled={readOnlyAll}
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
  <EventRoomsEditor
  eventId={event?.id}
  rooms={rooms}
  onChange={setRooms}
  readOnly={readOnlyAll}    // 🔒 khoá rooms nếu CLOSED hoặc detail
  onRoomSaved={() => {
    onBack();
  }}
/>

          {/* FOOTER */}
        <div className="pt-2 flex items-center justify-end gap-3">
  {mode !== "detail" && (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 mr-3"
    >
      {mode === "create" ? (
        <>
          <Plus className="w-4 h-4" />
          Tạo sự kiện
        </>
      ) : (
        <>
          <Edit className="w-4 h-4" />
          Lưu thay đổi
        </>
      )}
    </button>
  )}

  <button
    type="button"
    onClick={onBack}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-50"
  >
    <X className="w-3 h-3" />
    {mode === "detail" ? "Quay lại" : "Hủy"}
  </button>
</div>

        </form>
      </div>
    </div>
  );
};

export default EventList;
