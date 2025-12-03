import React, { useRef, useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";
import { UserCreationByAdminRequest } from "../../../../types/user";

interface CreateContributorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserCreationByAdminRequest) => Promise<void>;
}


export default function CreateContributor({ isOpen, onClose, onSave }: CreateContributorProps) {
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [isPremiumEligible, setIsPremiumEligible] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;
    setLoading(true);

    try {
      const data: UserCreationByAdminRequest = {
        username: form.username.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        fullName: form.fullName.value.trim(),
        phone: form.phone.value.trim() || undefined,
        address: form.address.value.trim() || undefined,
        dateOfBirth: form.dateOfBirth.value || undefined,  
        bio: form.bio.value.trim(),
        expertise: form.expertise.value.trim(),           
        isPremiumEligible: isPremiumEligible,        
        roleName: "CONTRIBUTOR",
      };

      await onSave(data);
      form.reset(); 
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <PortalModal
      open={isOpen}
      onClose={handleClose}
      size="lg"
      maxWidth="720px"
      closeOnOverlay={!loading}
      closeOnEsc={!loading}
      initialFocusRef={firstInputRef as React.RefObject<HTMLElement>}
      ariaLabelledby="create-staff-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full">
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-100">
          <h3 id="create-staff-title" className="text-2xl font-bold text-gray-900">
            Thêm cộng tác viên mới
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                name="username"
                required
                minLength={3}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                placeholder="contributor123"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                placeholder="staff@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                type="text"             
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">            
               {/* BIO */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiểu sử</label>
                <textarea
                  name="bio"                         
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 mb-2"
                  placeholder="Nhập tiểu sử..."
                />
              </div>

              {/* EXPERTISE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chuyên môn</label>
                <input
                  type="text"
                  name="expertise"
                
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 mb-4"
                  placeholder="Nhập chuyên môn..."
                />
              </div>

              {/* DOCUMENTS URL - visible when editing */}
            
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tài liệu (URL)</label>
                  <input
                    type="url"
                    name="documentsUrl"
                  
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 mb-4"
                    placeholder="Nhập đường dẫn tài liệu..."
                  />
                </div> */}

              {/* IS PREMIUM ELIGIBLE */}
<div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-red-50">
  <span className="text-sm font-medium text-gray-900">
    Cho phép đăng bài <span className="text-red-600 font-semibold">Premium</span>
  </span>

  <button
    type="button"
    role="switch"
    disabled={loading}
    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors
      ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${isPremiumEligible ? "bg-gradient-to-r from-yellow-600 to-red-600" : "bg-gray-300"}
    `}
    onClick={() => setIsPremiumEligible(!isPremiumEligible)}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
        ${isPremiumEligible ? "translate-x-6" : "translate-x-1"}
      `}
    />
  </button>
</div>

            </div>

           
        </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
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
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Tạo cộng tác viên
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PortalModal>
  );
}