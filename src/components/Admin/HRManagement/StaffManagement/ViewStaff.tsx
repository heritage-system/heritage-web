import React from "react";
import { X, Mail, Phone, MapPin, Calendar, Shield, UserCheck, Ban, Clock, Check, X as CrossIcon, Loader2 } from "lucide-react";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";
import { StaffDetailResponse } from "../../../../types/staff";
import { StaffRole, StaffStatus } from "../../../../types/enum";

interface ViewStaffProps {
  staff: StaffDetailResponse | null;
  onClose: () => void;
  isOpen: boolean;
}

const getStatusBadge = (status: StaffStatus) => {
  switch (status) {
    case StaffStatus.ACTIVE:
      return { color: "bg-blue-100 text-blue-800", text: "Đang hoạt động", icon: UserCheck };
    case StaffStatus.INACTIVE:
      return { color: "bg-gray-100 text-gray-800", text: "Tạm ngưng", icon: Ban };
    case StaffStatus.SUSPENDED:
      return { color: "bg-red-100 text-red-800", text: "Bị đình chỉ", icon: Ban };
    case StaffStatus.RETIRED:
      return { color: "bg-gray-500 text-white", text: "Đã nghỉ việc", icon: Ban };
    case StaffStatus.PENDING:
      return { color: "bg-yellow-100 text-yellow-800", text: "Chờ duyệt", icon: Clock };
    default:
      return { color: "bg-gray-200 text-gray-600", text: "Không xác định", icon: Ban };
  }
};

const getRoleLabel = (role: StaffRole) => {
  const map: Record<StaffRole, string> = {
    [StaffRole.CONTENT_REVIEWER]: "Duyệt nội dung",
    [StaffRole.EVENT_MANAGER]: "Quản lý sự kiện",
    [StaffRole.SUPPORT_STAFF]: "Hỗ trợ người dùng",
    [StaffRole.COORDINATOR]: "Điều phối viên",
    [StaffRole.MODERATOR]: "Kiểm duyệt viên",
    [StaffRole.ADMIN_ASSISTANT]: "Trợ lý Admin",
  };
  return map[role] || "Không xác định";
};

export default function ViewStaff({ staff, onClose, isOpen }: ViewStaffProps) {
  // LOADING KHI CHƯA CÓ DATA
  if (!staff) {
    return (
      <PortalModal open={isOpen} onClose={onClose} size="lg" maxWidth="720px" centered>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-600" size={56} />
          <p className="mt-6 text-lg font-medium text-gray-700">Đang tải chi tiết nhân viên...</p>
        </div>
      </PortalModal>
    );
  }

  const statusInfo = getStatusBadge(staff.staffStatus);
  const StatusIcon = statusInfo.icon;

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa cập nhật";

  const formatDateTime = (date?: string | null) =>
    date ? new Date(date).toLocaleString("vi-VN") : "Chưa có";

  return (
    <PortalModal open={isOpen} onClose={onClose} size="lg" maxWidth="720px" centered contentClassName="bg-white rounded-2xl shadow-2xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Chi tiết Nhân viên</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhân viên</label>
              <p className="text-gray-900 font-medium">{staff.userName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                {staff.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-purple-600" />
                <span className="font-medium text-gray-900">{getRoleLabel(staff.staffRole)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <StatusIcon size={16} />
                  {statusInfo.text}
                </span>
                {staff.staffStatus === StaffStatus.PENDING && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Clock size={14} />
                    Đang chờ phê duyệt
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-gray-800 mb-3">Thông tin liên hệ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-600">Điện thoại</p>
                  <p className="font-medium text-gray-900">{staff.phone || "Chưa cập nhật"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-600">Địa chỉ</p>
                  <p className="font-medium text-gray-900">{staff.address || "Chưa cập nhật"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-600">Ngày sinh</p>
                  <p className="font-medium text-gray-900">{formatDate(staff.dateOfBirth)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Quyền hạn bổ sung</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { check: staff.canManageEvents, label: "Quản lý sự kiện" },
                { check: staff.canReplyReports, label: "Phản hồi báo cáo" },
                { check: staff.canAssignTasks, label: "Phân công nhiệm vụ" },
              ].map((perm, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium border ${
                    perm.check
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  {perm.check ? <Check size={18} /> : <CrossIcon size={18} />}
                  {perm.label}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Tham gia:</span>
              <span className="font-medium text-gray-900">{formatDate(staff.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cập nhật lần cuối:</span>
              <span className="font-medium text-gray-900">{formatDateTime(staff.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </PortalModal>
  );
}