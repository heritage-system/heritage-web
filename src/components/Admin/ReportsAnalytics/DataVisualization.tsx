import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Calendar, MapPin, Flame } from "lucide-react";
import {
  EngagementByCategory,
  HeritageProvinceDistribution,
  HeritageTopViewed,
  YearlyGrowthPoint,
  ContributionTrendPoint,
  ContributionTopViewed,
  fetchEngagementByCategory,
  fetchHeritageByProvince,
  fetchTopContributionsViewed,
  fetchTopHeritageViewed,
  fetchContributionTrend,
  fetchYearlyGrowth,
  fetchExecutiveDashboard,
  ExecutiveDashboardStats,
} from "../../../services/dashboardService";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

const DataVisualization = () => {
  const [provinceData, setProvinceData] = useState<HeritageProvinceDistribution[]>([]);
  const [trendData, setTrendData] = useState<ContributionTrendPoint[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementByCategory[]>([]);
  const [growthData, setGrowthData] = useState<YearlyGrowthPoint[]>([]);
  const [topHeritage, setTopHeritage] = useState<HeritageTopViewed[]>([]);
  const [topContributions, setTopContributions] = useState<ContributionTopViewed[]>([]);
  const [execStats, setExecStats] = useState<ExecutiveDashboardStats | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [provinceRes, trendRes, engagementRes, growthRes, heritageRes, contribRes, execRes] = await Promise.all([
        fetchHeritageByProvince(),
        fetchContributionTrend(6),
        fetchEngagementByCategory(6),
        fetchYearlyGrowth(6),
        fetchTopHeritageViewed(5),
        fetchTopContributionsViewed(5),
        fetchExecutiveDashboard(),
      ]);

      if (!active) return;
      if (provinceRes.result) setProvinceData(provinceRes.result);
      if (trendRes.result) setTrendData(trendRes.result);
      if (engagementRes.result) setEngagementData(engagementRes.result);
      if (growthRes.result) setGrowthData(growthRes.result);
      if (heritageRes.result) setTopHeritage(heritageRes.result);
      if (contribRes.result) setTopContributions(contribRes.result);
      if (execRes.result) setExecStats(execRes.result);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const formattedTrend = useMemo(
    () =>
      trendData.map((item) => ({
        month: item.period?.slice(5) || item.period,
        ...item,
      })),
    [trendData]
  );


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trực quan hóa Dữ liệu</h1>
          <p className="text-gray-500 mt-1">Phân tích chuyên sâu và trực quan các chỉ số quan trọng</p>
        </div>

        {/* Top heritage by favorites */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={24} />
            <h2 className="text-xl font-bold">🔥 Top Di sản được yêu thích</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topHeritage.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl font-bold">#{index + 1}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{item.favorites.toLocaleString()} yêu thích</span>
                </div>
                <p className="text-sm font-medium mb-1">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top contributions by views */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1 h-6 bg-emerald-600 rounded"></span>
            <TrendingUp size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">Đóng góp được xem nhiều nhất</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topContributions} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis
                dataKey="title"
                type="category"
                width={160}
                stroke="#6b7280"
                tickFormatter={(value) => (typeof value === "string" && value.length > 26 ? `${value.slice(0, 23)}...` : value)}
              />
              <Tooltip />
              <Bar dataKey="views" fill="#10b981" name="Lượt xem" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
              <BarChart data={provinceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="province" angle={-45} textAnchor="end" height={100} stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Số di sản" radius={[4, 4, 0, 0]} />
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
              <ComposedChart data={formattedTrend}>
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

        {/* Tăng trưởng theo năm */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1 h-6 bg-indigo-600 rounded"></span>
            <Calendar size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Tăng trưởng theo Năm</h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={growthData}>
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

        {/* Summary Stats from API */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng Di sản</p>
            <p className="text-3xl font-bold">{execStats?.heritage.totalHeritage?.toLocaleString() ?? "–"}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng Người dùng</p>
            <p className="text-3xl font-bold">{execStats?.users.total?.toLocaleString() ?? "–"}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng Đóng góp</p>
            <p className="text-3xl font-bold">{execStats?.contributions.total?.toLocaleString() ?? "–"}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tỉnh thành</p>
            <p className="text-3xl font-bold">{provinceData.length ? provinceData.length.toLocaleString() : "–"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;