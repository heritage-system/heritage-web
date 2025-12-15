// components/UserManagement/UserTable.tsx
import React from "react";
import { Eye, Ban, UserCheck, Clock, AlertCircle } from "lucide-react";
import { UserSearchResponse } from "../../../../types/user";
import { UserStatus } from "../../../../types/enum";

// Helper icon theo số
const StatusIconMap: Record<UserStatus, React.FC<{ size?: number }>> = {
  [UserStatus.PENDING_VERIFICATION]: Clock,
  [UserStatus.PENDING_APPROVE]: Clock,
  [UserStatus.ACTIVE]: UserCheck,
  [UserStatus.INACTIVE]: Ban,
  [UserStatus.BANNED]: Ban,
  [UserStatus.DELETED]: Ban,
};

// Helper label + color
const getStatusDisplay = (status: UserStatus) => {
  switch (status) {
    case UserStatus.PENDING_APPROVE:
      return { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" };
    case UserStatus.PENDING_VERIFICATION:
      return { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" };
    case UserStatus.ACTIVE:
      return { label: "Hoạt động", color: "bg-green-100 text-green-800" };
    case UserStatus.INACTIVE:
      return { label: "Không hoạt động", color: "bg-gray-100 text-gray-800" };
    case UserStatus.BANNED:
      return { label: "Bị cấm", color: "bg-red-100 text-red-800" };
    case UserStatus.DELETED:
      return { label: "Đã xóa", color: "bg-red-100 text-red-800" };
    default:
      return { label: "Không xác định", color: "bg-gray-100 text-gray-700" };
  }
};

const roleDisplay: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Quản trị viên", color: "bg-red-100 text-red-800" },
  STAFF: { label: "Nhân viên", color: "bg-purple-100 text-purple-800" },
  CONTRIBUTOR: { label: "Đóng góp viên", color: "bg-blue-100 text-blue-800" },
  USER: { label: "Người dùng", color: "bg-gray-100 text-gray-700" },
  MEMBER: { label: "Thành viên", color: "bg-indigo-100 text-indigo-800" },
};

interface UserTableProps {
  data: UserSearchResponse[];
  onView: (user: UserSearchResponse) => void;
  onStatusChange: (user: UserSearchResponse, newStatus: UserStatus) => void;
}

export default function UserTable({ data, onView, onStatusChange }: UserTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 text-lg">Không có người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tên người dùng</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Trạng thái</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tạo ngày</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Hành động</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((user) => {
            const statusNum = user.userStatus as UserStatus;
            const statusDisplay = getStatusDisplay(statusNum);
            const StatusIcon = StatusIconMap[statusNum] || AlertCircle;

            return (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.userName || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                    <StatusIcon size={14} />
                    {statusDisplay.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <div className="flex justify-end gap-3 items-center">
    {/* Nút xem */}
    <button
      onClick={() => onView(user)}
      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
      title="Xem chi tiết"
    >
      <Eye size={16} />
    </button>

    {/* Nút chuyển sang ACTIVE */}
    {statusNum !== UserStatus.ACTIVE &&(<button
      onClick={() => onStatusChange(user, UserStatus.ACTIVE)}
      className={`p-2 rounded-lg transition-colors 
       
         
          bg-green-100 text-green-700
      `}
      title="Đặt thành Hoạt động"
    >
      <UserCheck size={16} />
    </button>
    )}

    {/* Nút chuyển sang INACTIVE */}
    {statusNum !== UserStatus.INACTIVE &&(<button
      onClick={() => onStatusChange(user, UserStatus.INACTIVE)}
      className={`p-2 rounded-lg transition-colors 
           bg-gray-100 text-gray-700
      `}
      title="Đặt thành Không hoạt động"
    >
      <Clock size={16} />
    </button>)}

    {/* Nút chuyển sang BANNED */}
    {statusNum !== UserStatus.BANNED &&(<button
      onClick={() => onStatusChange(user, UserStatus.BANNED)}
      className={`p-2 rounded-lg transition-colors 
       bg-red-100 text-red-700
      `}
      title="Cấm người dùng"
    >
      <Ban size={16} />
    </button>)}
  </div>
</td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}