import React, { useState } from 'react';
import { Lock, Key, PlusSquare, CheckCircle, Info, Shield, Eye, EyeOff, Save } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordProps {
  onSubmit?: (data: ChangePasswordFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate("/view-profile?tab=profile", { replace: true }); 
  };

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState<Partial<ChangePasswordFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ChangePasswordFormData> = {};
    if (!formData.currentPassword.trim()) newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!formData.newPassword.trim()) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (formData.newPassword.length < 6) newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    else if (formData.newPassword === formData.currentPassword) newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    else if (formData.confirmPassword !== formData.newPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onSubmit) onSubmit(formData);
  };

  const handleInputChange = (field: keyof ChangePasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Đổi mật khẩu</h1>
          <p className="text-gray-600">Cập nhật mật khẩu để bảo mật tài khoản</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Current Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl 
                               transition-all duration-200 bg-gray-50 focus:bg-white
                               ${errors.currentPassword 
                                 ? 'border-red-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/20' 
                                 : 'border-gray-200 focus:border-yellow-500 focus:ring-3 focus:ring-yellow-500/20'
                               }`}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-3 text-gray-500 hover:text-yellow-600 transition-colors"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="mt-2 text-sm text-red-500">{errors.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl 
                               transition-all duration-200 bg-gray-50 focus:bg-white
                               ${errors.newPassword 
                                 ? 'border-red-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/20' 
                                 : 'border-gray-200 focus:border-yellow-500 focus:ring-3 focus:ring-yellow-500/20'
                               }`}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-3 text-gray-500 hover:text-yellow-600 transition-colors"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-2 text-sm text-red-500">{errors.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl 
                               transition-all duration-200 bg-gray-50 focus:bg-white
                               ${errors.confirmPassword 
                                 ? 'border-red-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/20' 
                                 : 'border-gray-200 focus:border-yellow-500 focus:ring-3 focus:ring-yellow-500/20'
                               }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-3 text-gray-500 hover:text-yellow-600 transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Yêu cầu mật khẩu:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Ít nhất 6 ký tự</li>
                      <li>• Khác với mật khẩu hiện tại</li>
                      <li>• Nên có chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 
                             font-semibold rounded-2xl hover:bg-gray-50 
                             transition-all duration-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                 className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700
                          hover:from-green-700 hover:to-green-800 text-white font-semibold 
                          rounded-2xl transition-all duration-300 hover:shadow-lg 
                          hover:shadow-green-500/25 disabled:opacity-50 
                          flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Cập nhật
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Mẹo bảo mật:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Không chia sẻ mật khẩu với ai</li>
                <li>• Sử dụng mật khẩu mạnh và duy nhất</li>
                <li>• Thay đổi mật khẩu định kỳ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
