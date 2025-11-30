import React from "react";
import { Loader2, User, Mail, ArrowRight, AlertCircle, X } from "lucide-react";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";
import { UserSearchResponse } from "../../../../types/user";
import { UserStatus } from "../../../../types/enum";

interface ConfirmStatusChangeProps {
  user: UserSearchResponse | null;     // Cho phép null
  newStatus: UserStatus | null;        // Cho phép null
  isLoading?: boolean;
  message: string;
  isOpen: boolean;                     // Bắt buộc có isOpen
  onCancel: () => void;
  onConfirm: () => void;
}

const statusConfig: Record<UserStatus, { label: string; color: string }> = {
  [UserStatus.ACTIVE]: { label: "Hoạt động", color: "bg-green-100 text-green-800" },
  [UserStatus.INACTIVE]: { label: "Không hoạt động", color: "bg-gray-100 text-gray-800" },
  [UserStatus.PENDING_VERIFICATION]: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
  [UserStatus.BANNED]: { label: "Bị cấm", color: "bg-red-100 text-red-800" },
  [UserStatus.DELETED]: { label: "Đã xóa", color: "bg-red-100 text-red-800" },
};

export default function ConfirmStatusChange({
  user,
  newStatus,
  isLoading = false,
  message,
  isOpen,
  onCancel,
  onConfirm,
}: ConfirmStatusChangeProps) {
  // HIỆN LOADING KHI CHƯA CÓ DATA (trường hợp mở nhanh)
  if (!user || newStatus === null) {
    return (
      <PortalModal open={isOpen} onClose={onCancel} size="md" maxWidth="520px" centered>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-600" size={56} />
          <p className="mt-6 text-lg font-medium text-gray-700">Đang chuẩn bị...</p>
        </div>
      </PortalModal>
    );
  }

  const currentStatus = statusConfig[user.userStatus as UserStatus];
  const nextStatus = statusConfig[newStatus];

  return (
    <PortalModal
      open={isOpen}
      onClose={onCancel}
      size="md"
      maxWidth="520px"
      closeOnOverlay={!isLoading}
      closeOnEsc={!isLoading}
      centered
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận thay đổi trạng thái</h3>
              <p className="text-sm text-gray-600 mt-1">Hành động này sẽ có hiệu lực ngay lập tức</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Thông tin người dùng */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="font-semibold text-gray-900">{user.userName || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>

          {/* Trạng thái chuyển đổi */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Hiện tại</p>
                <span
                  className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium ${
                    currentStatus?.color || "bg-gray-200 text-gray-700"
                  }`}
                >
                  {currentStatus?.label || user.userStatus}
                </span>
              </div>

              <ArrowRight className="w-5 h-5 text-gray-400" />

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Sắp tới</p>
                <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium ${nextStatus.color}`}>
                  {nextStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Cảnh báo */}
          {message && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </button>
          </div>
        </div>
      </div>
    </PortalModal>
  );
}