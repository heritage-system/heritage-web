// components/UserManagement/StatsCards.tsx
import { Users, UserCheck, UserX, Shield } from "lucide-react";

interface Stats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <Users size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Tổng người dùng</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-50 text-green-600">
          <UserCheck size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Đang hoạt động</p>
          <p className="text-xl font-semibold">{stats.active}</p>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
          <UserX size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Không hoạt động</p>
          <p className="text-xl font-semibold">{stats.inactive}</p>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <Shield size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Hoạt động trong 30 ngày</p>
          <p className="text-xl font-semibold">{stats.newThisMonth}</p>
        </div>
      </div>
    </div>
  );
}