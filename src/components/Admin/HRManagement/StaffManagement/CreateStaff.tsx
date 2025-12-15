import React, { useRef, useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";
import { UserCreationByAdminRequest } from "../../../../types/user";
import { StaffRole } from "../../../../types/enum";

interface CreateStaffProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserCreationByAdminRequest) => Promise<void>;
}

const staffRoleOptions = [
  { value: StaffRole.CONTENT_REVIEWER, label: "Duyệt nội dung" },
  { value: StaffRole.EVENT_MANAGER, label: "Quản lý sự kiện" },
  { value: StaffRole.SUPPORT_STAFF, label: "Hỗ trợ người dùng" },
  { value: StaffRole.COORDINATOR, label: "Điều phối viên" },
  { value: StaffRole.MODERATOR, label: "Kiểm duyệt viên" },
  { value: StaffRole.ADMIN_ASSISTANT, label: "Trợ lý Admin" },
] as const;

export default function CreateStaff({ isOpen, onClose, onSave }: CreateStaffProps) {
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;
    setLoading(true);

    try {
      const data: UserCreationByAdminRequest = {
        username: form.username.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        fullName: form.fullName.value.trim(),
        phone: form.phone.value.trim() || undefined,
        address: form.address.value.trim() || undefined,
        dateOfBirth: form.dateOfBirth.value || undefined,
        staffRole: Number(form.staffRole.value) as StaffRole,
        canManageEvents: form.canManageEvents.checked,
        canReplyReports: form.canReplyReports.checked,
        canAssignTasks: form.canAssignTasks.checked,
        roleName: "STAFF",
      };

      await onSave(data);
      form.reset(); 
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <PortalModal
      open={isOpen}
      onClose={handleClose}
      size="lg"
      maxWidth="720px"
      closeOnOverlay={!loading}
      closeOnEsc={!loading}
      initialFocusRef={firstInputRef as React.RefObject<HTMLElement>}
      ariaLabelledby="create-staff-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full">
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-100">
          <h3 id="create-staff-title" className="text-2xl font-bold text-gray-900">
            Thêm nhân viên mới
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                name="username"
                required
                minLength={3}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                placeholder="staff123"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                placeholder="staff@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                type="text"             
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
              <input
                name="phone"
                type="text"            
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                placeholder="0901234567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
              <input
                name="address"
                type="text"            
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                placeholder="123 Đường ABC, Quận 1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
              <input
                name="dateOfBirth"
                type="date"             
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
 
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vai trò nhân viên <span className="text-red-500">*</span>
              </label>
              <select
                name="staffRole"
                required
                disabled={loading}
                defaultValue={StaffRole.CONTENT_REVIEWER}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              >
                {staffRoleOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">Quyền hạn bổ sung</p>
            <div className="space-y-3">
              {[
                { name: "canManageEvents", label: "Quản lý sự kiện" },
                { name: "canReplyReports", label: "Phản hồi báo cáo" },
                { name: "canAssignTasks", label: "Phân công nhiệm vụ" },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={item.name}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Tạo nhân viên
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PortalModal>
  );
}