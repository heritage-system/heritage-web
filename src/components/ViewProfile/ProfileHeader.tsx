import React, { useState } from "react";
import { UpdateProfileResponse, UpdateProfileRequest } from "../../types/user";
import { Check, X, Save, Camera, Edit, Key } from "lucide-react";
import { uploadImage } from "../../services/uploadService";

interface ProfileHeaderProps {
  profile: UpdateProfileResponse;
  formData: UpdateProfileRequest;
  setFormData: (data: UpdateProfileRequest) => void;
  editMode: boolean;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  onChangePassword: () => void;
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [showAvatarActions, setShowAvatarActions] = useState<boolean>(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh!");
      return;
    }

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB!");
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Preview ảnh ngay lập tức
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setShowAvatarActions(true);
      };
      reader.readAsDataURL(file);

      // Upload ảnh lên server (Cloudinary qua BE)
      const response = await uploadImage(file);

      if (response.code !== 200 || !response.result) {
        throw new Error(response.message || "Upload failed");
      }

      // Cập nhật formData với URL ảnh từ server
      setFormData({
        ...formData,
        avatarUrl: response.result,
      });

      setAvatarPreview(response.result);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Có lỗi xảy ra khi upload ảnh!");
      setAvatarPreview(null);
      setShowAvatarActions(false);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      await onSave();
      setShowAvatarActions(false);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  const handleCancelAvatar = () => {
    setAvatarPreview(null);
    setShowAvatarActions(false);
    setFormData({
      ...formData,
      avatarUrl: profile.avatarUrl,
    });
  };

  const currentAvatarUrl = avatarPreview || formData.avatarUrl || profile.avatarUrl || "/api/placeholder/96/96";

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
            {/* Avatar với khả năng click để thay đổi */}
            <div className="relative group cursor-pointer">
              <img
                src={currentAvatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white/50 shadow-2xl object-cover transition-all duration-300 group-hover:brightness-75"
              />

              {/* Upload Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="text-white w-6 h-6" />
              </div>

              {/* Loading Overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Hidden file input */}
              <label className="absolute inset-0 cursor-pointer rounded-full">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            {/* Avatar action buttons */}
            {showAvatarActions && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                <button
                  onClick={handleCancelAvatar}
                  className="px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-1 text-xs transition-colors shadow-lg"
                >
                  <X className="w-3 h-3" /> Hủy
                </button>
                <button
                  onClick={handleSaveAvatar}
                  className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 text-xs transition-colors shadow-lg"
                >
                  <Save className="w-3 h-3" /> Lưu
                </button>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2 drop-shadow-sm text-gray-900">
              {(editMode ? formData.fullName : profile.fullName) || "Người dùng"}
            </h1>
            <p className="text-gray-700 mb-3 text-lg">
              {editMode ? formData.email : profile.email}
            </p>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-white/30 rounded-full text-sm">
                Thành viên VIP
              </span>
            </div>
          </div>
        </div>

        {!editMode ? (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </button>
            <button
              onClick={onChangePassword}
              className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
            >
              <Key className="w-4 h-4" />
              Đổi mật khẩu
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
            >
              <X className="w-4 h-4" /> Hủy bỏ
            </button>
            <button
              onClick={onSave}
              className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;