import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Users, Eye, MousePointer, Clock, Globe } from "lucide-react";

// Dữ liệu mẫu cho biểu đồ truy cập theo thời gian
const visitData = [
  { name: "T1", visits: 4200, users: 2400, pageViews: 8500 },
  { name: "T2", visits: 3800, users: 2210, pageViews: 7800 },
  { name: "T3", visits: 5200, users: 2900, pageViews: 10200 },
  { name: "T4", visits: 4500, users: 2600, pageViews: 9100 },
  { name: "T5", visits: 6800, users: 3800, pageViews: 13500 },
  { name: "T6", visits: 7200, users: 4100, pageViews: 14200 },
  { name: "T7", visits: 5900, users: 3400, pageViews: 11800 },
];

// Dữ liệu thiết bị
const deviceData = [
  { name: "Mobile", value: 45, color: "#3b82f6" },
  { name: "Desktop", value: 35, color: "#8b5cf6" },
  { name: "Tablet", value: 20, color: "#ec4899" },
];

// Dữ liệu di sản phổ biến
const heritagePopular = [
  { name: "Hoàng Thành Huế", views: 15420 },
  { name: "Nhã nhạc cung đình", views: 12800 },
  { name: "Chùa Thiên Mụ", views: 11200 },
  { name: "Lăng Tự Đức", views: 9500 },
  { name: "Lăng Khải Định", views: 8900 },
];

// Dữ liệu thời gian truy cập
const timeData = [
  { hour: "0h", users: 120 },
  { hour: "3h", users: 80 },
  { hour: "6h", users: 150 },
  { hour: "9h", users: 450 },
  { hour: "12h", users: 680 },
  { hour: "15h", users: 720 },
  { hour: "18h", users: 850 },
  { hour: "21h", users: 520 },
];

// Dữ liệu nguồn truy cập
const sourceData = [
  { name: "Tìm kiếm Google", value: 40 },
  { name: "Trực tiếp", value: 25 },
  { name: "Mạng xã hội", value: 20 },
  { name: "Giới thiệu", value: 15 },
];

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
  const [timeRange, setTimeRange] = useState("7days");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phân tích Nâng cao</h1>
            <p className="text-gray-500 mt-1">Thống kê chi tiết về hoạt động người dùng</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Tổng người dùng"
            value="24,532"
            change="+12.5%"
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Eye}
            label="Lượt xem"
            value="156,420"
            change="+8.2%"
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={MousePointer}
            label="Tỷ lệ tương tác"
            change="+3.1%"
            value="68.5%"
            color="bg-green-50 text-green-600"
          />
          <StatCard
            icon={Clock}
            label="Thời gian TB"
            value="4m 32s"
            change="+15.3%"
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Biểu đồ lượt truy cập */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              <h2 className="text-lg font-semibold text-gray-800">Lượt truy cập theo thời gian</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={visitData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="visits" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ thiết bị */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-purple-600 rounded"></span>
              <h2 className="text-lg font-semibold text-gray-800">Phân bổ thiết bị</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Di sản phổ biến */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-green-600 rounded"></span>
              <h2 className="text-lg font-semibold text-gray-800">Di sản được xem nhiều nhất</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={heritagePopular} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="views" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Thời gian truy cập */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-amber-600 rounded"></span>
              <h2 className="text-lg font-semibold text-gray-800">Người dùng theo giờ</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1 h-6 bg-indigo-600 rounded"></span>
            <h2 className="text-lg font-semibold text-gray-800">Nguồn truy cập</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sourceData.map((source, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={18} className="text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">{source.name}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{source.value}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${source.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;