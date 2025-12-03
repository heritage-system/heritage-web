import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Area, Scatter, ScatterChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Map, TrendingUp, Users, Calendar, Award, MapPin, Flame, Filter } from "lucide-react";

// Dữ liệu phân bố di sản theo tỉnh thành
const heritageByProvince = [
  { province: "Thừa Thiên Huế", count: 156, tangible: 98, intangible: 58 },
  { province: "Quảng Nam", count: 89, tangible: 52, intangible: 37 },
  { province: "Hà Nội", count: 134, tangible: 87, intangible: 47 },
  { province: "Hồ Chí Minh", count: 78, tangible: 45, intangible: 33 },
  { province: "Đà Nẵng", count: 45, tangible: 28, intangible: 17 },
  { province: "Nghệ An", count: 67, tangible: 39, intangible: 28 },
  { province: "Thanh Hóa", count: 82, tangible: 51, intangible: 31 },
];

// Dữ liệu xu hướng đóng góp theo tháng
const contributionTrend = [
  { month: "T1", contributions: 145, approved: 120, pending: 15, rejected: 10 },
  { month: "T2", contributions: 168, approved: 142, pending: 18, rejected: 8 },
  { month: "T3", contributions: 192, approved: 165, pending: 20, rejected: 7 },
  { month: "T4", contributions: 156, approved: 135, pending: 14, rejected: 7 },
  { month: "T5", contributions: 203, approved: 178, pending: 19, rejected: 6 },
  { month: "T6", contributions: 234, approved: 205, pending: 22, rejected: 7 },
];

// Dữ liệu đánh giá chất lượng di sản
const qualityMetrics = [
  { subject: "Tính xác thực", A: 85, B: 78, fullMark: 100 },
  { subject: "Giá trị lịch sử", A: 92, B: 85, fullMark: 100 },
  { subject: "Bảo tồn", A: 78, B: 88, fullMark: 100 },
  { subject: "Tài liệu", A: 88, B: 72, fullMark: 100 },
  { subject: "Tiếp cận", A: 75, B: 82, fullMark: 100 },
  { subject: "Tương tác", A: 82, B: 79, fullMark: 100 },
];

// Dữ liệu tương tác người dùng theo loại di sản
const interactionByType = [
  { type: "Kiến trúc", views: 45000, likes: 3200, shares: 890 },
  { type: "Nghệ thuật", views: 38000, likes: 2800, shares: 720 },
  { type: "Văn học", views: 29000, likes: 2100, shares: 450 },
  { type: "Ẩm thực", views: 52000, likes: 4100, shares: 1200 },
  { type: "Lễ hội", views: 41000, likes: 3500, shares: 950 },
  { type: "Nghề thủ công", views: 34000, likes: 2600, shares: 680 },
];

// Dữ liệu tăng trưởng theo năm
const yearlyGrowth = [
  { year: "2019", heritage: 450, users: 5200, contributions: 890 },
  { year: "2020", heritage: 520, users: 7800, contributions: 1240 },
  { year: "2021", heritage: 612, users: 11500, contributions: 1680 },
  { year: "2022", heritage: 723, users: 16200, contributions: 2150 },
  { year: "2023", heritage: 856, users: 22400, contributions: 2890 },
  { year: "2024", heritage: 945, users: 28900, contributions: 3420 },
];

// Dữ liệu scatter: Mối quan hệ giữa số lượt xem và tương tác
const engagementData = [
  { views: 1200, engagement: 45, category: "Kiến trúc" },
  { views: 2100, engagement: 78, category: "Kiến trúc" },
  { views: 1800, engagement: 62, category: "Nghệ thuật" },
  { views: 3200, engagement: 95, category: "Ẩm thực" },
  { views: 2800, engagement: 88, category: "Lễ hội" },
  { views: 1500, engagement: 52, category: "Văn học" },
  { views: 2500, engagement: 82, category: "Ẩm thực" },
  { views: 1900, engagement: 68, category: "Nghề thủ công" },
  { views: 3500, engagement: 105, category: "Lễ hội" },
  { views: 2200, engagement: 75, category: "Kiến trúc" },
];

// Top di sản hot nhất
const hotHeritage = [
  { name: "Hoàng Thành Huế", score: 95, trend: "+15%" },
  { name: "Phố cổ Hội An", score: 92, trend: "+12%" },
  { name: "Nhã nhạc cung đình", score: 88, trend: "+8%" },
  { name: "Ca trù", score: 85, trend: "+10%" },
  { name: "Áo dài Việt Nam", score: 82, trend: "+18%" },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

const FilterButton = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "bg-white text-gray-700 border hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const DataVisualization = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trực quan hóa Dữ liệu</h1>
          <p className="text-gray-500 mt-1">Phân tích chuyên sâu và trực quan các chỉ số quan trọng</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
            <div className="flex gap-2">
              <FilterButton active={selectedFilter === "all"} onClick={() => setSelectedFilter("all")}>
                Tất cả
              </FilterButton>
              <FilterButton active={selectedFilter === "tangible"} onClick={() => setSelectedFilter("tangible")}>
                Vật thể
              </FilterButton>
              <FilterButton active={selectedFilter === "intangible"} onClick={() => setSelectedFilter("intangible")}>
                Phi vật thể
              </FilterButton>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("chart")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === "chart" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Biểu đồ
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Bảng
            </button>
          </div>
        </div>

        {/* Hot Heritage Trending */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={24} />
            <h2 className="text-xl font-bold">🔥 Top Di sản HOT nhất tuần</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {hotHeritage.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl font-bold">#{index + 1}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{item.trend}</span>
                </div>
                <p className="text-sm font-medium mb-1">{item.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full"
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 1: Phân bố địa lý + Xu hướng đóng góp */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Phân bố theo tỉnh thành */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              <MapPin size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Phân bố Di sản theo Tỉnh thành</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={heritageByProvince}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="province" angle={-45} textAnchor="end" height={100} stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="tangible" stackId="a" fill="#3b82f6" name="Vật thể" radius={[0, 0, 0, 0]} />
                <Bar dataKey="intangible" stackId="a" fill="#8b5cf6" name="Phi vật thể" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Xu hướng đóng góp */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-green-600 rounded"></span>
              <TrendingUp size={20} className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Xu hướng Đóng góp</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={contributionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="contributions" fill="#10b981" stroke="#10b981" fillOpacity={0.3} name="Tổng" />
                <Bar dataKey="approved" fill="#22c55e" name="Đã duyệt" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Chờ duyệt" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Radar Chart + Tăng trưởng theo năm */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Đánh giá chất lượng */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-purple-600 rounded"></span>
              <Award size={20} className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Đánh giá Chất lượng Di sản</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={qualityMetrics}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
                <PolarRadiusAxis stroke="#6b7280" />
                <Radar name="Vật thể" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Radar name="Phi vật thể" dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.5} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Tăng trưởng theo năm */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-indigo-600 rounded"></span>
              <Calendar size={20} className="text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-800">Tăng trưởng theo Năm</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={yearlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="heritage" stroke="#6366f1" strokeWidth={3} name="Di sản" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} name="Người dùng" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="contributions" stroke="#ec4899" strokeWidth={3} name="Đóng góp" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Tương tác theo loại + Scatter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tương tác theo loại di sản */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-cyan-600 rounded"></span>
              <Users size={20} className="text-cyan-600" />
              <h2 className="text-lg font-semibold text-gray-800">Tương tác theo Loại Di sản</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={interactionByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="type" type="category" width={100} stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#06b6d4" name="Lượt xem" />
                <Bar dataKey="likes" fill="#3b82f6" name="Thích" />
                <Bar dataKey="shares" fill="#8b5cf6" name="Chia sẻ" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mối quan hệ Views vs Engagement */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-rose-600 rounded"></span>
              <TrendingUp size={20} className="text-rose-600" />
              <h2 className="text-lg font-semibold text-gray-800">Lượt xem vs Tương tác</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="views" name="Lượt xem" stroke="#6b7280" />
                <YAxis type="number" dataKey="engagement" name="Tương tác" stroke="#6b7280" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter name="Di sản" data={engagementData} fill="#f43f5e">
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng Di sản</p>
            <p className="text-3xl font-bold">945</p>
            <p className="text-xs opacity-75 mt-2">↑ 10.4% so với năm trước</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng Người dùng</p>
            <p className="text-3xl font-bold">28.9K</p>
            <p className="text-xs opacity-75 mt-2">↑ 29.0% so với năm trước</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng Đóng góp</p>
            <p className="text-3xl font-bold">3,420</p>
            <p className="text-xs opacity-75 mt-2">↑ 18.3% so với năm trước</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tỉnh thành</p>
            <p className="text-3xl font-bold">63</p>
            <p className="text-xs opacity-75 mt-2">Trên toàn quốc</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;