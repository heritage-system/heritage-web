// components/UserManagement/ConfirmDelete.tsx
import { X } from "lucide-react";

interface User {
  id: string;
  name: string;
}

interface ConfirmDeleteProps {
  user: User;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDelete({ user, onCancel, onConfirm }: ConfirmDeleteProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">Xóa người dùng hệ thống</h3>
        <p className="text-sm text-gray-600">
          Bạn có chắc muốn xóa "{user.name}"? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border rounded-md">
            Hủy
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}