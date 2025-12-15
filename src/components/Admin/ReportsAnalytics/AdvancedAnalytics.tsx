import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import {
  ContributionTopViewed,
  HeritageTopViewed,
  fetchTopContributionsViewed,
  fetchTopHeritageViewed,
  fetchYearlyGrowth,
  YearlyGrowthPoint,
} from "../../../services/dashboardService";

const StatCard = ({ icon: Icon, label, value, change, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  color: string;
}) => {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
        <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
};

const AdvancedAnalytics = () => {
  const [topHeritage, setTopHeritage] = useState<HeritageTopViewed[]>([]);
  const [topContributions, setTopContributions] = useState<ContributionTopViewed[]>([]);
  const [growthData, setGrowthData] = useState<YearlyGrowthPoint[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [heritageRes, contribRes, growthRes] = await Promise.all([
        fetchTopHeritageViewed(5),
        fetchTopContributionsViewed(5),
        fetchYearlyGrowth(6),
      ]);
      if (!active) return;
      if (heritageRes.result) setTopHeritage(heritageRes.result);
      if (contribRes.result) setTopContributions(contribRes.result);
      if (growthRes.result) setGrowthData(growthRes.result);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const latestGrowth = useMemo(() => {
    if (!growthData.length) return null;
    return [...growthData].sort((a, b) => b.year - a.year)[0];
  }, [growthData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Phân tích Nâng cao</h1>
          <p className="text-gray-500 mt-1">Thống kê chi tiết về hoạt động người dùng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={TrendingUp}
            label="Tổng Di sản"
            value={latestGrowth ? latestGrowth.heritage.toLocaleString() : "–"}
            change=""
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Tổng Người dùng"
            value={latestGrowth ? latestGrowth.users.toLocaleString() : "–"}
            change=""
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Tổng Đóng góp"
            value={latestGrowth ? latestGrowth.contributions.toLocaleString() : "–"}
            change=""
            color="bg-green-50 text-green-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Năm dữ liệu"
            value={latestGrowth ? `${latestGrowth.year}` : "–"}
            change=""
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Di sản được yêu thích nhất */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-green-600 rounded"></span>
              <h2 className="text-lg font-semibold text-gray-800">Di sản được yêu thích</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topHeritage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={160}
                  stroke="#6b7280"
                  tickFormatter={(value) => (typeof value === "string" && value.length > 26 ? `${value.slice(0, 23)}...` : value)}
                />
                <Tooltip />
                <Bar dataKey="favorites" fill="#10b981" radius={[0, 8, 8, 0]} name="Yêu thích" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Đóng góp được xem nhiều nhất */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-amber-600 rounded"></span>
              <h2 className="text-lg font-semibold text-gray-800">Đóng góp được xem nhiều nhất</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topContributions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis
                  dataKey="title"
                  type="category"
                  width={180}
                  stroke="#6b7280"
                  tickFormatter={(value) => (typeof value === "string" && value.length > 26 ? `${value.slice(0, 23)}...` : value)}
                />
                <Tooltip />
                <Bar dataKey="views" fill="#f59e0b" radius={[0, 8, 8, 0]} name="Lượt xem" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdvancedAnalytics;