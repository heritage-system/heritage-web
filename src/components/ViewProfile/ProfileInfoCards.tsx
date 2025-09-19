import React, { useRef, useEffect } from 'react';
import { UpdateProfileRequest } from '../../types/user';

interface Profile {
  userName?: string;
  fullName?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ProfileInfoCardProps {
  profile: Profile;
  formData: UpdateProfileRequest;
  setFormData: (data: UpdateProfileRequest) => void;
  editMode: boolean;
  type: 'personal' | 'contact';
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  profile,
  formData,
  setFormData,
  editMode,
  type
}) => {
  const isPersonal = type === 'personal';

  // Ref cho input date
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenCalendar = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-lg transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div
        className={`p-6 ${
          isPersonal
            ? "bg-gradient-to-r from-yellow-50 via-red-50 to-orange-50"
            : "bg-gradient-to-r from-yellow-50 via-red-50 to-orange-50"
        } border-b border-gray-200`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 ${
              isPersonal ? "bg-yellow-200" : "bg-amber-200"
            } rounded-2xl flex items-center justify-center border border-yellow-300/50`}
          >
            <span
              className={`text-2xl ${
                isPersonal ? "text-yellow-700" : "text-amber-700"
              }`}
            >
              {isPersonal ? "👤" : "📞"}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-black">
              {isPersonal ? "Thông tin cá nhân" : "Thông tin liên hệ"}
            </h3>
            <p className="text-sm text-black">
              {isPersonal
                ? "Thông tin cơ bản về tài khoản"
                : "Thông tin để liên hệ với bạn"}
            </p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="space-y-6">
          {isPersonal ? (
            <>
              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  <span className="text-yellow-600">🏷️</span>
                  Tên đăng nhập
                </label>
                {editMode ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.userName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, userName: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl 
                                 focus:ring-3 focus:ring-yellow-500/20 focus:border-yellow-500 
                                 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên đăng nhập"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-2xl text-black font-semibold border-2 border-transparent">
                    {profile.userName || "Chưa cập nhật"}
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  <span className="text-amber-600">👨‍💼</span>
                  Họ và tên
                </label>
                {editMode ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.fullName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl 
                                 focus:ring-3 focus:ring-yellow-500/20 focus:border-yellow-500 
                                 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-2xl text-black font-semibold border-2 border-transparent">
                    {profile.fullName || "Chưa cập nhật"}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  <span className="text-amber-600">🎂</span>
                  Ngày sinh
                </label>
                {editMode ? (
                  <div className="relative">
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={formData.dateOfBirth?.split("T")[0] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfBirth: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl 
                                 focus:ring-3 focus:ring-yellow-500/20 focus:border-yellow-500 
                                 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    {/* Icon click mở lịch */}
                    <div
                      className="absolute right-3 top-3 text-yellow-500 cursor-pointer"
                      onClick={handleOpenCalendar}
                    >
                      <span className="text-lg">📅</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-2xl text-black font-semibold border-2 border-transparent">
                    {profile.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  <span className="text-amber-600">📧</span>
                  Email
                </label>
                {editMode ? (
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl 
                                 focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 
                                 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập email"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-2xl text-black font-semibold border-2 border-transparent">
                    {profile.email || "Chưa cập nhật"}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  <span className="text-yellow-600">📱</span>
                  Số điện thoại
                </label>
                {editMode ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl 
                                 focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 
                                 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-2xl text-black font-semibold border-2 border-transparent">
                    {profile.phone || "Chưa cập nhật"}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  <span className="text-amber-600">📍</span>
                  Địa chỉ
                </label>
                {editMode ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl 
                                 focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 
                                 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-2xl text-black font-semibold border-2 border-transparent">
                    {profile.address || "Chưa cập nhật"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
