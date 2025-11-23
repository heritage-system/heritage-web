// components/UserManagement/ViewUser.tsx
import { X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  lastLogin: string;
}

interface ViewUserProps {
  user: User;
  onClose: () => void;
}

export default function ViewUser({ user, onClose }: ViewUserProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4">Chi tiết người dùng hệ thống</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Họ tên</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Vai trò</p>
            <p className="font-medium">
              {user.role === "admin" ? "Quản trị" : user.role === "editor" ? "Biên tập" : "Xem"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Trạng thái</p>
            <p className="font-medium">
              {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Đăng nhập cuối</p>
            <p className="font-medium">{user.lastLogin}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}