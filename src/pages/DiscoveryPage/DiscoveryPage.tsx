import React, { useEffect, useState } from "react";
import DiscoveryGoogleMapsView from "../../components/Discovery/DiscoveryGoogleMapsView";
import DiscoveryHeritageGrid from "../../components/Discovery/DiscoveryHeritageGrid";
import DiscoveryQuickFilters from "../../components/Discovery/DiscoveryQuickFilters";
import DiscoveryUpcomingEvents from "../../components/Discovery/DiscoveryUpcomingEvents";
import DiscoveryViewToggle from "../../components/Discovery/DiscoveryViewToggle";
import { Heritage } from "../../types/heritage";
import { HeritageLocationResponse } from "../../types/heritageLocation";
import { getHeritages } from "../../services/heritageLocationService";

const SORT_OPTIONS = ["Mới nhất", "Phổ biến", "Đánh giá cao"];

// ✅ Data cứng cho Grid view
const STATIC_HERITAGES: Heritage[] = [
  {
    id: 1,
    name: "Lễ hội Chùa Hương",
    lat: 20.5531,
    lng: 105.5872,
    description: "Lễ hội lớn nhất miền Bắc, diễn ra tại chùa Hương với nhiều hoạt động tâm linh.",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
    location: "Hà Nội",
    date: "15/01/2025",
    rating: 4.9,
    views: 12300,
    comments: 23,
    hasVR: true,
    trending: true,
    type: "festival",
    isHot: true,
    category: "festivals",
  },
  // ... các di sản khác giữ nguyên như bạn đã có
];

const DiscoveryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [view, setView] = useState<"grid" | "map">("grid");
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [sortOption, setSortOption] = useState<string>("Mới nhất");
  const [mapHeritages, setMapHeritages] = useState<HeritageLocationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heritages: Heritage[] = STATIC_HERITAGES;

  // ✅ Fetch API khi chuyển sang Map
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getHeritages();
        if (!response) throw new Error("No response received from API");
        if (response.code !== 200) throw new Error(`API error: ${response.message}`);

        setMapHeritages(response.result ?? []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error occurred");
        setMapHeritages([]);
      } finally {
        setLoading(false);
      }
    };

    if (view === "map") {
      fetchMapData();
    }
  }, [view]);

  // ---- Grid data filter + sort ----
  const filtered = heritages.filter(
    (h: Heritage) => selectedCategory === "all" || h.category === selectedCategory
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "Phổ biến":
        return b.views - a.views;
      case "Đánh giá cao":
        return b.rating - a.rating;
      default:
        const [dayA, monthA, yearA] = a.date.split("/").map(Number);
        const [dayB, monthB, yearB] = b.date.split("/").map(Number);
        return (
          new Date(yearB, monthB - 1, dayB).getTime() -
          new Date(yearA, monthA - 1, dayA).getTime()
        );
    }
  });

  const visibleHeritages = sorted.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Khám phá{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
              Di sản Văn hóa
            </span>{" "}
            Việt Nam
          </h1>
          <p className="text-gray-600">
            Hành trình khám phá những giá trị văn hóa truyền thống
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:flex-1">
            {/* Filters + View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <DiscoveryQuickFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <div className="flex items-center gap-4">
                <DiscoveryViewToggle view={view} onViewChange={setView} />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Heritage Count */}
            <p className="text-sm text-gray-600 mb-4">
              Tìm thấy{" "}
              <span className="font-medium">
                {view === "map" ? mapHeritages.length : filtered.length}
              </span>{" "}
              di sản văn hóa
            </p>

            {/* Error UI */}
            {error && view === "map" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="text-red-400 mr-2">⚠️</div>
                  <div>
                    <h4 className="text-red-800 font-medium">Lỗi tải dữ liệu</h4>
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setView("grid");
                        setTimeout(() => setView("map"), 100);
                      }}
                      className="text-red-700 underline text-sm mt-1 hover:text-red-800"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid / Map */}
            {view === "grid" ? (
              <DiscoveryHeritageGrid heritages={visibleHeritages} />
            ) : loading ? (
              <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-700 mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu bản đồ...</p>
              </div>
            ) : (
              <DiscoveryGoogleMapsView heritages={mapHeritages} />
            )}

            {/* Load more */}
            {view === "grid" && visibleCount < sorted.length && (
              <div className="text-center mt-8">
                <button
                  className="bg-gradient-to-r from-yellow-700 to-red-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                >
                  Xem thêm di sản
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="sticky top-6 space-y-4">
              <DiscoveryUpcomingEvents />
              <div className="bg-gradient-to-r from-yellow-100 to-red-100 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-yellow-700">500+</div>
                    <div className="text-xs text-gray-600">Di sản</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-700">50+</div>
                    <div className="text-xs text-gray-600">VR Tours</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-700">10K+</div>
                    <div className="text-xs text-gray-600">Người dùng</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-700">98%</div>
                    <div className="text-xs text-gray-600">Hài lòng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryPage;
