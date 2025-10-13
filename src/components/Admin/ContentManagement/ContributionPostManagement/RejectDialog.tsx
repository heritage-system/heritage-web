import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  loading?: boolean;
}

const RejectDialog: React.FC<RejectDialogProps> = ({ open, onClose, onConfirm, loading }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) setNote("");
  }, [open]);

  const handleSubmit = () => {
    if (note.trim() === "") return alert("Vui lòng nhập lý do từ chối!");
    onConfirm(note.trim());
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <XCircle className="mx-auto text-red-500 mb-3" size={36} />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Từ chối bài đăng</h3>
        <p className="text-gray-600 mb-4">Nhập lý do từ chối bài đăng này:</p>

        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập lý do..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleSubmit()}
        />

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {loading ? "Đang xử lý..." : "Từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectDialog;
