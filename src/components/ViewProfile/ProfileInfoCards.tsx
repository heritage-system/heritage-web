import React, { useRef } from 'react';
import {
  User,
  Phone,
  AtSign,
  Calendar,
  Tag,
  MapPin,
  UserCheck,
} from 'lucide-react';
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
    <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Card Header */}
      <div className="p-8 bg-gradient-to-r from-yellow-50 via-red-50 to-orange-50 border-b border-gray-100">
        <div className="flex items-center gap-5">
          <div
            className={`w-16 h-16 ${
              isPersonal ? '' : ''
            } rounded-3xl flex items-center justify-center border border-yellow-300/50 shadow-lg`}
          >
            {isPersonal ? (
              <User className="text-black w-8 h-8" />
            ) : (
              <Phone className="text-black w-8 h-8" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {isPersonal ? 'Thông tin cá nhân' : 'Thông tin liên hệ'}
            </h3>
            <p className="text-gray-600 text-base">
              {isPersonal
                ? 'Thông tin cơ bản về tài khoản của bạn'
                : 'Thông tin để liên hệ và kết nối với bạn'}
            </p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-8">
        <div className="grid gap-8">
          {isPersonal ? (
            <>
              {/* Username */}
              <div className="group">
                <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-black" />
                  </div>
                  Tên đăng nhập
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.userName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base font-medium placeholder-gray-400"
                    placeholder="Nhập tên đăng nhập của bạn"
                  />
                ) : (
                  <div className="px-5 py-4 rounded-2xl text-gray-900 font-semibold text-base bg-gray-50 border-2 border-transparent">
                    {profile.userName || (
                      <span className="text-gray-400 font-normal">Chưa cập nhật</span>
                    )}
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div className="group">
                <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-black" />
                  </div>
                  Họ và tên
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base font-medium placeholder-gray-400"
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                ) : (
                  <div className="px-5 py-4 rounded-2xl text-gray-900 font-semibold text-base bg-gray-50 border-2 border-transparent">
                    {profile.fullName || (
                      <span className="text-gray-400 font-normal">Chưa cập nhật</span>
                    )}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="group">
                <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-black" />
                  </div>
                  Ngày sinh
                </label>
                {editMode ? (
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={formData.dateOfBirth?.split('T')[0] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base font-medium"
                  />
                ) : (
                  <div className="px-5 py-4 rounded-2xl text-gray-900 font-semibold text-base bg-gray-50 border-2 border-transparent">
                    {profile.dateOfBirth ? (
                      new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')
                    ) : (
                      <span className="text-gray-400 font-normal">Chưa cập nhật</span>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Email */}
              <div className="group">
                <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                    <AtSign className="w-4 h-4 text-black" />
                  </div>
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base font-medium placeholder-gray-400"
                    placeholder="Nhập địa chỉ email"
                  />
                ) : (
                  <div className="px-5 py-4 rounded-2xl text-gray-900 font-semibold text-base bg-gray-50 border-2 border-transparent">
                    {profile.email || (
                      <span className="text-gray-400 font-normal">Chưa cập nhật</span>
                    )}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="group">
                <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-black" />
                  </div>
                  Số điện thoại
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base font-medium placeholder-gray-400"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="px-5 py-4 rounded-2xl text-gray-900 font-semibold text-base bg-gray-50 border-2 border-transparent">
                    {profile.phone || (
                      <span className="text-gray-400 font-normal">Chưa cập nhật</span>
                    )}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="group">
                <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-black" />
                  </div>
                  Địa chỉ
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base font-medium placeholder-gray-400"
                    placeholder="Nhập địa chỉ của bạn"
                  />
                ) : (
                  <div className="px-5 py-4 rounded-2xl text-gray-900 font-semibold text-base bg-gray-50 border-2 border-transparent">
                    {profile.address || (
                      <span className="text-gray-400 font-normal">Chưa cập nhật</span>
                    )}
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