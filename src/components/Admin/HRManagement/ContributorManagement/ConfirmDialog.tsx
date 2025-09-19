import React from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import PortalModal from "../../../Layouts/PortalModal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "warning",
  loading = false,
}) => {
  const typeConfig = {
    danger: {
      icon: <XCircle className="text-red-600" size={24} />,
      confirmClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      iconBg: "bg-red-100",
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-600" size={24} />,
      confirmClass: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      iconBg: "bg-yellow-100",
    },
    info: {
      icon: <Info className="text-blue-600" size={24} />,
      confirmClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      iconBg: "bg-blue-100",
    },
  }[type];

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="sm"
      ariaLabel={title}
      centered
      contentClassName="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full"
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-full ${typeConfig.iconBg}`}>
          {typeConfig.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
                         border-gray-300 rounded-lg hover:bg-gray-50 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-offset-2 
                          disabled:opacity-50 disabled:cursor-not-allowed 
                          transition-colors flex items-center justify-center ${typeConfig.confirmClass}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </PortalModal>
  );
};

export default ConfirmDialog;
