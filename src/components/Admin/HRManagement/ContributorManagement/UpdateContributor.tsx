import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Loader2 } from "lucide-react";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";
import { ContributorResponse, ContributorUpdateRequest } from "../../../../types/contributor";

interface UpdateContributorProps {
  contributor: ContributorResponse | null;
  onClose: () => void;
  onSave: (data: ContributorUpdateRequest) => Promise<void>;
  isOpen: boolean;
}


export default function UpdateContributor({ contributor, onClose, onSave, isOpen }: UpdateContributorProps) {
  const [loading, setLoading] = useState(false);
  const [isPremiumEligible, setIsPremiumEligible] = useState(contributor?.isPremiumEligible ?? false);

  useEffect(() => {
    if (contributor) {
      setIsPremiumEligible(contributor.isPremiumEligible ?? false);
    }
  }, [contributor]);
  // LOADING KHI CHƯA CÓ DATA
  if (!contributor) {
    return (
      <PortalModal open={isOpen} onClose={onClose} size="lg" maxWidth="900px">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-600" size={56} />
          <p className="mt-6 text-lg font-medium text-gray-700">Đang tải thông tin cộng tác viên...</p>
        </div>
      </PortalModal>
    );
  }

  

  const formatDate = (value?: string | null): string => {
    if (!value) return "";
    return value.split("T")[0]; // hoặc dùng dayjs…
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const form = e.currentTarget;

    const payload: ContributorUpdateRequest = {
      fullName: form.fullName.value.trim() || undefined,
      phone: form.phone.value.trim() || undefined,
      address: form.address.value.trim() || undefined,
      dateOfBirth: form.dateOfBirth.value || undefined,   
      bio: form.bio.value.trim(),
      expertise: form.expertise.value.trim(),           
      isPremiumEligible: isPremiumEligible,    
    };

    try {
      await onSave(payload);
    } catch {
      // Lỗi đã được xử lý ở parent
    } finally {
      setLoading(false);
    }
  };

  

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <PortalModal
      open={isOpen}
      onClose={handleClose}
      size="lg"
      maxWidth="900px"
      closeOnOverlay={!loading}
      closeOnEsc={!loading}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-h-screen overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa cộng tác viên</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={26} />
          </button>
        </div>

        {/* {isPending && (
          <div className="mx-8 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">Nhân viên đang chờ duyệt</p>
              <p className="text-amber-700 text-sm mt-1">
                Bạn chỉ có thể chỉnh sửa thông tin cơ bản. Trạng thái sẽ được thay đổi sau khi duyệt.
              </p>
            </div>
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
              <input
                value={contributor.userName}
                disabled
                className="w-full px-4 py-3 bg  bg-gray-50 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Không thể thay đổi tên đăng nhập</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                value={contributor.email}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                type="text"
                defaultValue={contributor.fullName}
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
                defaultValue={contributor.phone || ""}
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
                defaultValue={contributor.address || ""}
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
                defaultValue={formatDate(contributor.dateOfBirth) || ""}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="md:col-span-2">            
               {/* BIO */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiểu sử</label>
                <textarea
                  name="bio"                         
                  disabled={loading}
                  defaultValue={contributor.bio || ""}
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
                  defaultValue={contributor.expertise || ""}
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

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
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
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-60 flex items-center gap-2 min-w-[140px] justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PortalModal>
  );
}