import React, { useState, useEffect } from "react";
import { Users, UserCheck, Briefcase, HeartHandshake, Landmark, FolderTree, Brain, MessageSquare, TrendingUp } from "lucide-react";
import { ExecutiveDashboardStats, fetchExecutiveDashboard } from "../../../services/dashboardService";

// Component StatCard
const StatCard = ({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) => {
  return (
    <div className="rounded-xl border bg-white p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-semibold">{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

// Component Section với divider
const StatSection = ({ title, children }: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-blue-600 rounded"></span>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
};

const ExecutiveDashboard = () => {
  const [stats, setStats] = useState<ExecutiveDashboardStats>({
    users: {
      total: 0,
      employees: 0,
      contributors: 0,
    },
    heritage: {
      totalHeritage: 0,
      categories: 0,
      quizzes: 0,
    },
    contributions: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      setLoading(true);
      const res = await fetchExecutiveDashboard();

      if (!active) return;
      if (res.result) {
        setStats(res.result);
        setError(null);
      } else {
        setError(res.message ?? "Không thể tải dữ liệu dashboard.");
      }
      setLoading(false);
    };

    loadStats();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Điều hành</h1>
          <p className="text-gray-500 mt-1">Tổng quan hệ thống VTFP Admin</p>
          {loading && <p className="text-sm text-gray-400 mt-2">Đang tải dữ liệu...</p>}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Section 1: Người dùng */}
        <StatSection title="Quản lý Người dùng">
          <StatCard
            icon={Users}
            label="Tổng người dùng"
            value={stats.users.total}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Briefcase}
            label="Tổng nhân viên"
            value={stats.users.employees}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={HeartHandshake}
            label="Tổng người đóng góp"
            value={stats.users.contributors}
            color="bg-green-50 text-green-600"
          />
        </StatSection>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Section 2: Di sản */}
        <StatSection title="Quản lý Di sản">
          <StatCard
            icon={Landmark}
            label="Tổng di sản"
            value={stats.heritage.totalHeritage}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={FolderTree}
            label="Tổng thể loại"
            value={stats.heritage.categories}
            color="bg-cyan-50 text-cyan-600"
          />
          <StatCard
            icon={Brain}
            label="Tổng quiz"
            value={stats.heritage.quizzes}
            color="bg-indigo-50 text-indigo-600"
          />
        </StatSection>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Section 3: Đóng góp */}
        <StatSection title="Quản lý Đóng góp">
          <StatCard
            icon={MessageSquare}
            label="Tổng đóng góp"
            value={stats.contributions.total}
            color="bg-rose-50 text-rose-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Đang chờ duyệt"
            value={stats.contributions.pending}
            color="bg-orange-50 text-orange-600"
          />
          <StatCard
            icon={UserCheck}
            label="Đã phê duyệt"
            value={stats.contributions.approved}
            color="bg-emerald-50 text-emerald-600"
          />
        </StatSection>

      </div>
    </div>
  );
};

export default ExecutiveDashboard;