// components/UserManagement/CreateUser.tsx
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { UserCreationByAdminRequest } from "../../../../types/user";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";

interface CreateUserProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserCreationByAdminRequest) => Promise<void>;
}

export default function CreateUser({ open, onClose, onSave }: CreateUserProps) {
  const [formData, setFormData] = useState<UserCreationByAdminRequest>({
    username: "",
    email: "",
    fullName: "",
    roleName: "MEMBER",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.fullName) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
      // lỗi xử lý ở parent
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.username && formData.email && formData.fullName;

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="md"
      maxWidth="520px"
      closeOnOverlay={true}
      closeOnEsc={true}
      ariaLabelledby="create-user-title"
      contentClassName="overflow-hidden"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 id="create-user-title" className="text-2xl font-bold text-gray-900">
            Tạo thành viên mới
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
            aria-label="Đóng"
          >
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value.trim() })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="nhap_username"
            />
          </div>

          {/* Họ tên */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Nguyễn Văn A"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value.trim() })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="user@gmail.com"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo thành viên"
              )}
            </button>
          </div>
        </form>
      </div>
    </PortalModal>
  );
}