import React, { useState } from "react";
import PortalModal from "../Layouts/ModalLayouts/PortalModal";
import { CreateReportRequest } from "../../types/report";
import { createReport } from "../../services/reportService";
import toast from "react-hot-toast";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  heritageId: number;
}

const REPORT_REASONS = [
  "Nội dung sai sự thật",
  "Ngôn ngữ không phù hợp",
  "Spam hoặc quảng cáo",
  "Vi phạm bản quyền",
  "Khác",
];

const ContentReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  heritageId,
}) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Toggle chọn/bỏ chọn checkbox
  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  // Điều kiện để bật nút gửi
  const canSubmit =
    selectedReasons.length > 0 ||
    (selectedReasons.includes("Khác") && customReason.trim().length > 0);

  const handleSubmit = async () => {
    let reasonsToSend = [...selectedReasons];

    // Nếu có "Khác" thì thay bằng nội dung custom
    if (reasonsToSend.includes("Khác")) {
      reasonsToSend = reasonsToSend.filter((r) => r !== "Khác");
      if (customReason.trim()) {
        reasonsToSend.push(customReason.trim());
      }
    }

    if (reasonsToSend.length === 0) {
      toast.error("Vui lòng chọn ít nhất một lý do");
      return;
    }

    try {
      setLoading(true);
      
      var reason = reasonsToSend.join(", ")
     

      const res = await createReport({ heritageId, reason });
      if (res.code === 200 || res.code === 201) {
        toast.success("Báo cáo đã được gửi!");
        onClose();
        setSelectedReasons([]);
        setCustomReason("");
      } else {
        toast.error(res.message || "Không thể gửi báo cáo");
      }
    } catch (err) {
      toast.error("Lỗi khi gửi báo cáo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="xl"
      contentClassName="bg-white rounded-xl p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Báo cáo bài viết</h2>

      {/* Danh sách checkbox ngang */}
      <div className="flex flex-wrap gap-4 mb-6">
        {REPORT_REASONS.map((reason, idx) => (
          <label
            key={idx}
            className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            <input
              type="checkbox"
              value={reason}
              checked={selectedReasons.includes(reason)}
              onChange={() => toggleReason(reason)}
              className="text-red-600 focus:ring-red-500"
            />
            <span className="text-gray-700">{reason}</span>
          </label>
        ))}
      </div>

      {/* Input khi chọn Khác */}
      {selectedReasons.includes("Khác") && (
        <textarea
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Nhập lý do chi tiết..."
          className="w-full mt-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          rows={3}
        />
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className={`px-4 py-2 text-sm font-medium rounded-md text-white 
            bg-gradient-to-r from-yellow-700 to-red-700 
            hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Đang gửi..." : "Gửi báo cáo"}
        </button>
      </div>
    </PortalModal>
  );
};

export default ContentReportModal;
