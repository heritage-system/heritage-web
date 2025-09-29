import React from "react";
import PortalModal from "./PortalModal";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  loading = false,
}) => {
  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="sm"
      contentClassName="bg-white rounded-xl p-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-700 mb-6">{message}</p>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : confirmText}
        </button>
      </div>
    </PortalModal>
  );
};

export default ConfirmModal;