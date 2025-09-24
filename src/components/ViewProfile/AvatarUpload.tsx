import React, { useState } from "react";
import { UpdateProfileRequest } from "../../types/user";
import { uploadImage } from "../../services/uploadService";

interface AvatarUploadProps {
  formData: UpdateProfileRequest;
  setFormData: (data: UpdateProfileRequest) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ formData, setFormData }) => {
  const [preview, setPreview] = useState<string | null>(formData.avatarUrl || null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploading(true);

      // Preview ảnh ngay lập tức
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
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

      setPreview(response.result);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Có lỗi xảy ra khi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Avatar Display */}
      <div className="relative group">
        <img
          src={preview || formData.avatarUrl || "/api/placeholder/96/96"}
          alt="Avatar"
          className="w-24 h-24 rounded-full border-4 border-white/50 shadow-2xl object-cover 
                     transition-all duration-300 group-hover:brightness-75"
        />

        {/* Upload Overlay */}
        <div
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300 flex items-center justify-center"
        >
          <span className="text-white text-sm font-medium">Thay đổi</span>
        </div>

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Upload Input */}
      <label className="absolute inset-0 cursor-pointer rounded-full">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {/* Upload Button */}
      <div className="mt-4 text-center">
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-medium 
                           transition-all duration-300 cursor-pointer
                           ${
                             uploading
                               ? "bg-gray-400 text-white cursor-not-allowed"
                               : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white hover:shadow-lg hover:shadow-yellow-500/25"
                           }`}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang tải...
            </>
          ) : (
            <>
              <span className="text-lg">📷</span>
              Chọn ảnh
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};

export default AvatarUpload;
