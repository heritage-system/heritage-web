import React, { useEffect, useMemo, useState } from "react";
import { Video } from "lucide-react";
import {
  EventResponse,
 
} from "../../types/event";
import {
  getEvents,
  registerForEvent,
  unregisterFromEvent,
} from "../../services/eventService";
import LiveEventPanel from "../../components/Community/LiveEventPanel";
import EventCard from "../../components/Community/EventCard";
import UpcomingEventsSidebar from "../../components/Community/UpcomingEventsSidebar";
import { toast } from "react-hot-toast";
import { EventCategory, EventStatus } from "../../types/enum";

type CategoryFilter = "all" | EventCategory;

const CATEGORY_FILTERS: { id: CategoryFilter; name: string }[] = [
  { id: "all", name: "Tất cả" },
  { id: EventCategory.GENERAL, name: "Chung" },
  { id: EventCategory.HERITAGE_TALK, name: "Toạ đàm" },
  { id: EventCategory.FESTIVAL, name: "Lễ hội" },
  { id: EventCategory.WORKSHOP, name: "Workshop" },
  { id: EventCategory.ONLINE_TOUR, name: "Tour online" },
];

const JoinRoomPage: React.FC = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getEvents({});
      if (res.code === 200 && res.result) {
        setEvents(res.result);
      } else {
        setErr(res.message || "Không tải được danh sách sự kiện.");
      }
    } catch (e) {
      setErr("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // ===== Chia LIVE / UPCOMING =====
  const liveEvents = useMemo(
    () => events.filter((e) => e.status === EventStatus.LIVE),
    [events]
  );

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.status === EventStatus.UPCOMING),
    [events]
  );

  // Chọn 1 event để highlight:
  // ưu tiên LIVE, nếu không có thì chọn ngẫu nhiên 1 UPCOMING
  const highlightEvent: EventResponse | null = useMemo(() => {
    if (liveEvents.length > 0) {
      // random một event live
      const idx = Math.floor(Math.random() * liveEvents.length);
      return liveEvents[idx];
    }
    if (upcomingEvents.length > 0) {
      const idx = Math.floor(Math.random() * upcomingEvents.length);
      return upcomingEvents[idx];
    }
    return null;
  }, [liveEvents, upcomingEvents]);

  // List cho grid (LIVE + UPCOMING) theo category filter
  const listedEvents = useMemo(() => {
    const combined = [...liveEvents, ...upcomingEvents].sort(
      (a, b) =>
        new Date(a.startAt as any).getTime() -
        new Date(b.startAt as any).getTime()
    );
    if (selectedCategory === "all") return combined;
    return combined.filter((e) => e.category === selectedCategory);
  }, [liveEvents, upcomingEvents, selectedCategory]);

  // Upcoming cho sidebar (limit 5)
  const upcomingForSidebar = useMemo(
    () =>
      upcomingEvents
        .slice()
        .sort(
          (a, b) =>
            new Date(a.startAt as any).getTime() -
            new Date(b.startAt as any).getTime()
        )
        .slice(0, 5),
    [upcomingEvents]
  );

  // ===== Đăng ký / huỷ đăng ký =====
  const toggleRegister = async (ev: EventResponse) => {
    try {
      if (!ev.registeredByMe) {
        const res = await registerForEvent(ev.id);
        if (res.code === 200 && res.result?.registered) {
          toast.success("Đã đăng ký tham gia sự kiện");
          setEvents((prev) =>
            prev.map((e) =>
              e.id === ev.id
                ? {
                    ...e,
                    registeredByMe: true,
                    registeredCount: e.registeredCount + 1,
                  }
                : e
            )
          );
        } else {
          toast.error(res.message || "Đăng ký thất bại");
        }
      } else {
        const res = await unregisterFromEvent(ev.id);
        if (res.code === 200 && !res.result?.registered) {
          toast.success("Đã huỷ đăng ký sự kiện");
          setEvents((prev) =>
            prev.map((e) =>
              e.id === ev.id
                ? {
                    ...e,
                    registeredByMe: false,
                    registeredCount: Math.max(
                      0,
                      e.registeredCount - 1
                    ),
                  }
                : e
            )
          );
        } else {
          toast.error(res.message || "Huỷ đăng ký thất bại");
        }
      }
    } catch {
      toast.error("Không thể kết nối máy chủ");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 bg-clip-text text-transparent">
              Sự kiện & Livestream
            </span>{" "}
            Di sản Văn hóa
          </h1>
          <p className="text-gray-600 text-lg">
            Khám phá, đăng ký và tham gia các sự kiện trực tuyến về di sản văn
            hóa. Bạn sẽ vào phòng livestream từ trang chi tiết sự kiện.
          </p>
        </div>

        {/* Error / loading */}
        {err && (
          <p className="mb-4 text-sm text-center text-rose-600">{err}</p>
        )}

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Cột trái: Live + list */}
          <div className="xl:flex-1 space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Video className="w-5 h-5 mr-2 text-red-500" />
                Sự kiện đang diễn ra
              </h2>
              <LiveEventPanel
                event={highlightEvent}
                onToggleRegister={toggleRegister}
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-3">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-purple-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Grid events */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading && listedEvents.length === 0 && (
                <div className="col-span-full text-center text-sm text-gray-500">
                  Đang tải danh sách sự kiện...
                </div>
              )}

              {!loading && listedEvents.length === 0 && (
                <div className="col-span-full text-center text-sm text-gray-500">
                  Không có sự kiện phù hợp bộ lọc.
                </div>
              )}

              {listedEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onToggleRegister={toggleRegister}
                />
              ))}
            </div>
          </div>

          {/* Cột phải: sidebar upcoming */}
          <div className="xl:w-96 space-y-6">
            <UpcomingEventsSidebar
              events={upcomingForSidebar}
              onToggleRegister={toggleRegister}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default JoinRoomPage;
