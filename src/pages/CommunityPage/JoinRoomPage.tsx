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
import {useAuth} from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();

  // const load = async () => {
  //   setLoading(true);
  //   setErr(null);
  //   try {
  //     const today = new Date().toISOString(); // yyyy-MM-ddTHH:mm:ss
  //     const res = await getEvents({ from: today });
  //     if (res.code === 200 && res.result) {
  //       setEvents(res.result);
  //     } else {
  //       setErr(res.message || "Không tải được danh sách sự kiện.");
  //     }
  //   } catch (e) {
  //     setErr("Không thể kết nối máy chủ.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const load = async () => {
  setLoading(true);
  setErr(null);
  try {
    const now = new Date();

    // 👉 Tạo mốc 00:00 của ngày hôm nay (theo local time)
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(), // 0h00
      0,
      0,
      0,
      0
    );

    const from = startOfToday.toISOString(); // gửi lên backend

    const res = await getEvents({ from });
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
    <div className="min-h-screen bg-white bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 ">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 bg-clip-text text-transparent">
              Sự kiện & Livestream
            </span>{" "}
            Di sản Văn hóa Lễ hội
          </h1>

          <p className="text-gray-600 text-lg my-4">
            Hòa mình vào không gian lễ hội Việt Nam qua những sự kiện và buổi phát sóng trực tuyến — khám phá, kết nối và trải nghiệm.
          </p>

        </div>

        {/* Error / loading */}
        {/* {err && (
          <p className="mb-4 text-sm text-center text-rose-600">{err}</p>
        )} */}

         {/* ======== GIAO DIỆN KHI CHƯA ĐĂNG NHẬP ======== */}
      {!isLoggedIn && (
        <div className="flex flex-col items-center justify-center py-20">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"
            alt="Login Required"
            className="w-36 h-36 opacity-80 mb-6"
          />

          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Bạn cần đăng nhập để tham gia sự kiện
          </h2>

          <p className="text-gray-600 text-center max-w-md mb-6">
            Tính năng sự kiện & livestream chỉ dành cho thành viên.  
            Đăng nhập để đăng ký sự kiện, theo dõi livestream và nhận thông báo mới nhất nhé!
          </p>

          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-full text-white font-medium shadow-md
                       bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 
                       hover:scale-105 transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

        {isLoggedIn && ( 
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
        </div> )}
      </main>
    </div>
  );
};

export default JoinRoomPage;
