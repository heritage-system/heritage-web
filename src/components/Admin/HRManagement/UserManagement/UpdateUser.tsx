// components/UserManagement/UpdateUser.tsx
import React, { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { UserDetailResponse } from "../../../../types/user";
import { UserStatus } from "../../../../types/enum";

interface UpdateUserProps {
  user: UserDetailResponse;
  onClose: () => void;
  onSave?: (newStatus: UserStatus) => Promise<void>;
}

const roleLabel: Record<string, string> = {
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
  CONTRIBUTOR: "Đóng góp viên",
  USER: "Người dùng thường",
  MEMBER: "Thành viên",
};

// DÙNG CHÍNH XÁC ENUM – KHÔNG HARD CODE
const statusOptions = [
  { value: UserStatus.ACTIVE, label: "Hoạt động", color: "text-green-600" },
  { value: UserStatus.INACTIVE, label: "Không hoạt động", color: "text-gray-600" },
  { value: UserStatus.PENDING_VERIFICATION, label: "Chờ duyệt", color: "text-yellow-600" },
  { value: UserStatus.BANNED, label: "Bị cấm", color: "text-red-600" },
  { value: UserStatus.DELETED, label: "Đã xóa", color: "text-red-700 font-semibold" },
] as const;

export default function UpdateUser({ user, onClose, onSave }: UpdateUserProps) {
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user.userStatus);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave || selectedStatus === user.userStatus) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(selectedStatus);
      onClose();
    } catch {
      setIsSaving(false);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 relative">
        <button onClick={onClose} disabled={isSaving} className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg">
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-8">Chỉnh sửa trạng thái</h3>

        <div className="bg-gray-50 p-6 rounded-xl mb-8 space-y-4">
          <div><strong>{user.fullName || user.userName}</strong></div>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Chọn trạng thái mới
            </label>
            <div className="space-y-3">
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedStatus === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === opt.value}
                    onChange={() => setSelectedStatus(opt.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className={`font-medium ${opt.color}`}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-3 border rounded-xl hover:bg-gray-50">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || selectedStatus === user.userStatus}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}