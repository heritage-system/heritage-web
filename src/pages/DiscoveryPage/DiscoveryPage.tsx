import React, { useState } from "react";
import DiscoveryGoogleMapsView from "../../components/Discovery/DiscoveryGoogleMapsView";
import DiscoveryHeritageGrid from "../../components/Discovery/DiscoveryHeritageGrid";
import DiscoveryQuickFilters from "../../components/Discovery/DiscoveryQuickFilters";
import DiscoveryUpcomingEvents from "../../components/Discovery/DiscoveryUpcomingEvents";
import DiscoveryViewToggle from "../../components/Discovery/DiscoveryViewToggle";
import { Heritage } from "../../types/heritage";


// Sample heritage data
export const heritages: Heritage[] = [
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
  {
    id: 2,
    name: "Nhã nhạc Cung đình Huế",
    lat: 16.4637,
    lng: 107.5909,
    description: "Di sản văn hóa phi vật thể được UNESCO công nhận.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=240&fit=crop",
    location: "Thừa Thiên Huế",
    date: "20/03/2025",
    rating: 4.8,
    views: 9800,
    comments: 14,
    hasVR: false,
    trending: true,
    type: "performance",
    isHot: true,
    category: "music",
  },
  {
    id: 3,
    name: "Múa rối nước Thăng Long",
    lat: 21.0285,
    lng: 105.8542,
    description: "Nghệ thuật múa rối nước truyền thống của Việt Nam.",
    image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=240&fit=crop",
    location: "Hà Nội",
    date: "25/02/2025",
    rating: 4.6,
    views: 7200,
    comments: 12,
    hasVR: true,
    trending: false,
    type: "performance",
    isHot: false,
    category: "performances",
  },
  {
    id: 4,
    name: "Làng gốm Bát Tràng",
    lat: 21.0245,
    lng: 105.9965,
    description: "Làng nghề truyền thống với lịch sử hơn 700 năm.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=240&fit=crop",
    location: "Hà Nội",
    date: "05/04/2025",
    rating: 4.5,
    views: 6800,
    comments: 9,
    hasVR: false,
    trending: false,
    type: "craft",
    isHot: false,
    category: "crafts",
  },
  {
    id: 5,
    name: "Lễ hội Kate người Chăm",
    lat: 11.7569,
    lng: 108.9891,
    description: "Lễ hội truyền thống của đồng bào Chăm tại Ninh Thuận.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=240&fit=crop",
    location: "Ninh Thuận",
    date: "10/10/2025",
    rating: 4.7,
    views: 8600,
    comments: 8,
    hasVR: true,
    trending: false,
    type: "festival",
    isHot: false,
    category: "festivals",
  },
  {
    id: 6,
    name: "Lễ Giỗ Tổ Hùng Vương",
    lat: 21.3080,
    lng: 105.0113,
    description: "Lễ hội tưởng nhớ công đức các vua Hùng.",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
    location: "Phú Thọ",
    date: "18/04/2025",
    rating: 4.9,
    views: 15200,
    comments: 31,
    hasVR: true,
    trending: true,
    type: "festival",
    isHot: true,
    category: "festivals",
  },
];

const SORT_OPTIONS = ["Mới nhất", "Phổ biến", "Đánh giá cao"];

const DiscoveryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [view, setView] = useState<"grid" | "map">("grid");
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [sortOption, setSortOption] = useState<string>("Mới nhất");

  // Filter
  const filtered = heritages.filter(
    (h) => selectedCategory === "all" || h.category === selectedCategory
  );

  // Sort
const sorted = [...filtered].sort((a, b) => {
  switch (sortOption) {
    case "Phổ biến":
      return b.views - a.views; // số nên so sánh trực tiếp
    case "Đánh giá cao":
      return b.rating - a.rating;
    default:
      // Chuyển "dd/mm/yyyy" -> "yyyy-mm-dd" để new Date parse chính xác
      const [dayA, monthA, yearA] = a.date.split("/").map(Number);
      const [dayB, monthB, yearB] = b.date.split("/").map(Number);
      return new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime();
  }
});


  // Pagination / Load more
  const visibleHeritages = sorted.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Khám phá <span className="text-purple-600">Di sản Văn hóa</span> Việt Nam
          </h1>
          <p className="text-gray-600">Hành trình khám phá những giá trị văn hóa truyền thống</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:flex-1">
            {/* Controls */}
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

            {/* Results Counter */}
            <p className="text-sm text-gray-600 mb-4">
              Tìm thấy <span className="font-medium">{filtered.length}</span> di sản văn hóa
            </p>

            {/* Content View */}
            {view === "grid" ? (
              <DiscoveryHeritageGrid heritages={visibleHeritages} />
            ) : (
              <DiscoveryGoogleMapsView heritages={visibleHeritages} />
            )}

            {/* Load More */}
            {view === "grid" && visibleCount < sorted.length && (
              <div className="text-center mt-8">
                <button
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
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

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-purple-600">500+</div>
                    <div className="text-xs text-gray-600">Di sản</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">50+</div>
                    <div className="text-xs text-gray-600">VR Tours</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">10K+</div>
                    <div className="text-xs text-gray-600">Người dùng</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">98%</div>
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
