import React, { useState } from "react";
import AvatarUpload from "./AvatarUpload";
import { UpdateProfileResponse, UpdateProfileRequest } from "../../types/user";

interface ProfileHeaderProps {
  profile: UpdateProfileResponse;
  formData: UpdateProfileRequest;
  setFormData: (data: UpdateProfileRequest) => void;
  editMode: boolean;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  onChangePassword: () => void; // thêm props đổi mật khẩu
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  formData,
  setFormData,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onChangePassword,
}) => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            {editMode ? (
              <AvatarUpload formData={formData} setFormData={setFormData} />
            ) : (
              <img
                src={profile.avatarUrl || "/api/placeholder/96/96"}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white/50 shadow-2xl object-cover"
              />
            )}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2 drop-shadow-sm text-gray-900">
              {(editMode ? formData.fullName : profile.fullName) || "Người dùng"}
            </h1>
            <p className="text-gray-700 mb-3 text-lg">
              {editMode ? formData.email : profile.email}
            </p>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white border border-white/30 rounded-full">
                Thành viên VIP
              </span>
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white border border-white/30 rounded-full">
                Đã xác thực
              </span>
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white border border-white/30 rounded-full">
                Hoạt động
              </span>
            </div>
          </div>
        </div>

        {!editMode ? (
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white rounded-2xl hover:scale-105 transition-transform"
            >
              Chỉnh sửa thông tin
            </button>
            <button
              onClick={onChangePassword}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white rounded-2xl hover:scale-105 transition-transform"
            >
              Đổi mật khẩu
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600"
            >
              ❌ Hủy bỏ
            </button>
            <button
              onClick={onSave}
              className="px-5 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600"
            >
              💾 Lưu thay đổi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
