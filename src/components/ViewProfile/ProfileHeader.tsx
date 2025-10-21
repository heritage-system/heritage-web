import React, { useState } from "react";
import { UpdateProfileResponse, UpdateProfileRequest } from "../../types/user";
import { Check, X, Save, Camera, Edit, Key, Crown } from "lucide-react";
import { uploadImage } from "../../services/uploadService";

interface ProfileHeaderProps {
  profile: UpdateProfileResponse;
  formData: UpdateProfileRequest;
  setFormData: (data: UpdateProfileRequest) => void;
  editMode: boolean;
  onEdit: () => void;
  onSave: (data?: UpdateProfileRequest) => void | Promise<void>;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ✅ lưu file local chưa upload
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [showAvatarActions, setShowAvatarActions] = useState<boolean>(false);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) {
    e.target.value = ""; 
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn file hình ảnh!");
    e.target.value = ""; 
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Kích thước file không được vượt quá 5MB!");
    e.target.value = ""; 
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setAvatarPreview(reader.result as string);
    setShowAvatarActions(true);
    setSelectedFile(file);
  };
  reader.readAsDataURL(file);

  e.target.value = "";
};

const handleSaveAvatar = async () => {
  if (!selectedFile) return;
  try {
    setIsUploadingAvatar(true);
    const response = await uploadImage(selectedFile);

    if (response.code !== 200 || !response.result) {
      throw new Error(response.message || "Upload failed");
    }

    await onSave({
      ...formData,
      avatarUrl: response.result,
    });

    setShowAvatarActions(false);
    setAvatarPreview(null);
    setSelectedFile(null);
  } catch (error) {
    console.error("Error saving avatar:", error);
    alert("Có lỗi xảy ra khi lưu ảnh!");
  } finally {
    setIsUploadingAvatar(false);
  }
};

  const handleCancelAvatar = () => {
    setAvatarPreview(null);
    setShowAvatarActions(false);
    setSelectedFile(null);
    setFormData({
      ...formData,
      avatarUrl: profile.avatarUrl,
    });
  };

  const safeUrl = (url?: string | null) => {
    if (!url || url === "undefined" || url === "null") return undefined;
    return url;
  };

  const DEFAULT_AVATAR =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Windows_10_Default_Profile_Picture.svg/2048px-Windows_10_Default_Profile_Picture.svg.png";

  const currentAvatarUrl =
    safeUrl(avatarPreview) ||
    safeUrl(formData.avatarUrl) ||
    safeUrl(profile.avatarUrl) ||
    DEFAULT_AVATAR;

  return (
    <div className="bg-gradient-to-r from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              <img
                src={currentAvatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white/50 shadow-2xl object-cover transition-all duration-300 group-hover:brightness-75"
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="text-white w-6 h-6" />
              </div>

              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

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

            {/* Nút hành động */}
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
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              {(editMode ? formData.userName : profile.userName) || "Người dùng"}
            </h1>
            <p className="text-gray-700 mb-3 text-lg">
              {editMode ? formData.email : profile.email}
            </p>

            {profile.isPremium && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 text-white font-semibold border border-yellow-300/70 rounded-full text-sm shadow-md">
                  <Crown className="w-4 h-4 text-yellow-200 drop-shadow" />
                  Thành viên VIP
                </span>
              </div>
            )}
          </div>
        </div>

        {!editMode ? (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </button>
            <button
              onClick={onChangePassword}
              className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
            >
              <Key className="w-4 h-4" />
              Đổi mật khẩu
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
            >
              <X className="w-4 h-4" /> Hủy bỏ
            </button>
            <button 
              onClick={() => onSave()}
              className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
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
