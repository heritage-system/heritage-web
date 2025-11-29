import React, { useState } from "react";
import { X, Save, AlertCircle, Loader2 } from "lucide-react";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";
import { StaffDetailResponse, StaffUpdateRequest } from "../../../../types/staff";
import { StaffRole, StaffStatus } from "../../../../types/enum";

interface UpdateStaffProps {
  staff: StaffDetailResponse | null;
  onClose: () => void;
  onSave: (data: StaffUpdateRequest) => Promise<void>;
  isOpen: boolean;
}

 const staffRoleOptions = [
  { value: StaffRole.CONTENT_REVIEWER, label: "Duyệt nội dung" },
  { value: StaffRole.EVENT_MANAGER, label: "Quản lý sự kiện" },
  { value: StaffRole.SUPPORT_STAFF, label: "Hỗ trợ người dùng" },
  { value: StaffRole.COORDINATOR, label: "Điều phối viên" },
  { value: StaffRole.MODERATOR, label: "Kiểm duyệt viên" },
  { value: StaffRole.ADMIN_ASSISTANT, label: "Trợ lý Admin" },
] as const;

const staffStatusOptions = [
  { value: StaffStatus.ACTIVE, label: "Hoạt động" },
  { value: StaffStatus.INACTIVE, label: "Tạm ngưng" },
  { value: StaffStatus.SUSPENDED, label: "Bị đình chỉ" },
  { value: StaffStatus.RETIRED, label: "Đã nghỉ việc" },
] as const;

export default function UpdateStaff({ staff, onClose, onSave, isOpen }: UpdateStaffProps) {
  const [loading, setLoading] = useState(false);

  // LOADING KHI CHƯA CÓ DATA
  if (!staff) {
    return (
      <PortalModal open={isOpen} onClose={onClose} size="lg" maxWidth="900px">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-600" size={56} />
          <p className="mt-6 text-lg font-medium text-gray-700">Đang tải thông tin nhân viên...</p>
        </div>
      </PortalModal>
    );
  }

  const isPending = staff.staffStatus === StaffStatus.PENDING;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const form = e.currentTarget;

    const payload: StaffUpdateRequest = {
      fullName: form.fullName.value.trim() || undefined,
      phone: form.phone.value.trim() || undefined,
      address: form.address.value.trim() || undefined,
      dateOfBirth: form.dateOfBirth.value || undefined,
      staffRole: Number(form.staffRole.value) as StaffRole,
      staffStatus: isPending
        ? staff.staffStatus
        : (Number(form.staffStatus.value) as StaffStatus),
      canManageEvents: form.canManageEvents.checked,
      canReplyReports: form.canReplyReports.checked,
      canAssignTasks: form.canAssignTasks.checked,
    };

    try {
      await onSave(payload);
    } catch {
      // Lỗi đã được xử lý ở parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <PortalModal
      open={isOpen}
      onClose={handleClose}
      size="lg"
      maxWidth="900px"
      closeOnOverlay={!loading}
      closeOnEsc={!loading}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa nhân viên</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={26} />
          </button>
        </div>

        {isPending && (
          <div className="mx-8 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">Nhân viên đang chờ duyệt</p>
              <p className="text-amber-700 text-sm mt-1">
                Bạn chỉ có thể chỉnh sửa thông tin cơ bản. Trạng thái sẽ được thay đổi sau khi duyệt.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
              <input
                value={staff.userName}
                disabled
                className="w-full px-4 py-3 bg  bg-gray-50 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Không thể thay đổi tên đăng nhập</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                value={staff.email}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                type="text"
                defaultValue={staff.fullName}
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
                defaultValue={staff.phone || ""}
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
                defaultValue={staff.address || ""}
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
                defaultValue={staff.dateOfBirth || ""}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vai trò nhân viên <span className="text-red-500">*</span>
              </label>
              <select
                name="staffRole"
                defaultValue={staff.staffRole}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              >
                {staffRoleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
              <select
                name="staffStatus"
                defaultValue={staff.staffStatus}
                disabled={isPending || loading}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isPending || loading ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""
                }`}
              >
                {staffStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {isPending && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Sẽ được duyệt sau khi admin xác nhận
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-4">Quyền hạn bổ sung</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="canManageEvents"
                  defaultChecked={staff.canManageEvents}
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-700">Quản lý sự kiện</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="canReplyReports"
                  defaultChecked={staff.canReplyReports}
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-700">Phản hồi báo cáo</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="canAssignTasks"
                  defaultChecked={staff.canAssignTasks}
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-700">Phân công nhiệm vụ</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
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
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-60 flex items-center gap-2 min-w-[140px] justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PortalModal>
  );
}