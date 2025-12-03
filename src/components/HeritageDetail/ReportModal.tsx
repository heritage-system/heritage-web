import React, { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import PortalModal from "../Layouts/ModalLayouts/PortalModal";
import { createReport } from "../../services/reportService";


interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  heritageId: number; // ID di sản
}

const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, heritageId }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError("Vui lòng nhập lý do báo cáo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
    await createReport({ heritageId, reason });

      setSuccess(true);
      setReason("");

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="lg"
      maxWidth="500px"
      contentClassName="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 max-w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Báo cáo nội dung</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lý do */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nhập lý do báo cáo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do tại đây..."
            className="w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            disabled={loading}
          />
        </div>

        {/* Thông báo */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">✅ Gửi báo cáo thành công!</p>}

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border text-gray-600 hover:bg-gray-50"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-sm rounded-xl text-white font-medium transition ${
              reason.trim()
                ? "bg-gradient-to-r from-yellow-500 to-red-600 hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!reason.trim() || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
              </span>
            ) : (
              "Gửi báo cáo"
            )}
          </button>
        </div>
      </form>
    </PortalModal>
  );
};

export default ReportModal;
  