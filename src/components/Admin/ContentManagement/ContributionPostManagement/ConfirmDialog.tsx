import React from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";

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
  if (!open) return null;

  const typeConfig = {
    warning: {
      icon: <AlertTriangle className="text-yellow-600" size={24} />,
      bg: "bg-yellow-100",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700",
    },
    danger: {
      icon: <XCircle className="text-red-600" size={24} />,
      bg: "bg-red-100",
      buttonBg: "bg-red-600 hover:bg-red-700",
    },
    info: {
      icon: <Info className="text-blue-600" size={24} />,
      bg: "bg-blue-100",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
    },
  }[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 p-2 rounded-full ${typeConfig.bg}`}>
            {typeConfig.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors ${typeConfig.buttonBg}`}
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
      </div>
    </div>
  );
};

export default ConfirmDialog;