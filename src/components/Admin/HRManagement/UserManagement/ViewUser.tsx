import React from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  UserCheck,
  Ban,
  Clock,
  CheckCircle,
  AlertCircle,
  Cake,
  Heart,
  Bookmark,
  Flag,
  Users,
  MessageSquare,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { UserDetailResponse } from "../../../../types/user";
import { UserStatus } from "../../../../types/enum";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";

interface ViewUserProps {
  user: UserDetailResponse | null;
  onClose: () => void;
  isOpen: boolean;
}

const getStatusBadge = (status: UserStatus) => {
  switch (status) {
    case UserStatus.ACTIVE:
      return { color: "bg-blue-100 text-blue-800", text: "Hoạt động", icon: CheckCircle };
    case UserStatus.PENDING_VERIFICATION:
      return { color: "bg-yellow-100 text-yellow-800", text: "Chờ duyệt", icon: Clock };
    case UserStatus.INACTIVE:
      return { color: "bg-gray-100 text-gray-800", text: "Không hoạt động", icon: Ban };
    case UserStatus.BANNED:
      return { color: "bg-red-100 text-red-800", text: "Bị cấm", icon: AlertCircle };
    case UserStatus.DELETED:
      return { color: "bg-red-100 text-red-800", text: "Đã xóa", icon: X };
    default:
      return { color: "bg-gray-200 text-gray-600", text: "Không xác định", icon: Ban };
  }
};

const getRoleInfo = (roleName?: string) => {
  const map: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    ADMIN: { label: "Quản trị viên", icon: Shield, color: "text-purple-600" },
    STAFF: { label: "Nhân viên", icon: UserCheck, color: "text-indigo-600" },
    CONTRIBUTOR: { label: "Cộng tác viên", icon: MessageSquare, color: "text-blue-600" },
    MEMBER: { label: "Thành viên", icon: Users, color: "text-cyan-600" },
    USER: { label: "Người dùng thường", icon: User, color: "text-gray-600" },
  };
  return map[roleName || "USER"] || { label: roleName || "Người dùng thường", icon: User, color: "text-gray-600" };
};

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa cập nhật";

const formatDateTime = (date?: string | null) =>
  date ? new Date(date).toLocaleString("vi-VN") : "Chưa có";

export default function ViewUser({ user, onClose, isOpen }: ViewUserProps) {
  // HIỆN LOADING KHI CHƯA CÓ DATA
  if (!user) {
    return (
      <PortalModal open={isOpen} onClose={onClose} size="lg" maxWidth="720px" centered>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-600" size={56} />
          <p className="mt-6 text-lg font-medium text-gray-700">Đang tải thông tin người dùng...</p>
        </div>
      </PortalModal>
    );
  }

  const statusInfo = getStatusBadge(user.userStatus);
  const StatusIcon = statusInfo.icon;
  const roleInfo = getRoleInfo(user.roleName);
  const RoleIcon = roleInfo.icon;

  const hasContactInfo = !!user.phone || !!user.address || !!user.dateOfBirth;
  const hasActivityStats = Object.values({
    numberOfFavorites: user.numberOfFavorites || 0,
    numberOfHeritageReviews: user.numberOfHeritageReviews || 0,
    numberOfReports: user.numberOfReports || 0,
    numberOfSubscriptions: user.numberOfSubscriptions || 0,
    numberOfContributionSaves: user.numberOfContributionSaves || 0,
    numberOfContributionReviews: user.numberOfContributionReviews || 0,
    numberOfContributionReports: user.numberOfContributionReports || 0,
  }).some(v => v > 0);

  return (
    <PortalModal
      open={isOpen}
      onClose={onClose}
      size="lg"
      maxWidth="720px"
      ariaLabel="Chi tiết người dùng"
      centered
      contentClassName="bg-white rounded-2xl shadow-2xl"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        {/* Avatar + Tên lớn */}
        <div className="flex items-center gap-5 mb-6">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 shadow-md bg-gray-50">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <User size={40} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{user.fullName || "Chưa cập nhật"}</h4>
            <p className="text-gray-600">@{user.userName}</p>
          </div>
        </div>

        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900 flex items-center gap-2">
              <Mail size={16} className="text-gray-500" />
              {user.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <div className="flex items-center gap-2">
              <RoleIcon size={16} className={roleInfo.color} />
              <span className="font-medium text-gray-900">{roleInfo.label}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
                <StatusIcon size={16} />
                {statusInfo.text}
              </span>
              {user.userStatus === UserStatus.PENDING_VERIFICATION && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Clock size={14} />
                  Đang chờ xác minh tài khoản
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin liên hệ */}
       
          <div className="space-y-4 bg-gray-50 rounded-xl p-5 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Thông tin liên hệ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
             
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Điện thoại</p>
                    <p className="font-medium text-gray-900">{user.phone || "Chưa cập nhật"}</p>
                  </div>
                </div>
         

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{user.address || "Chưa cập nhật"}</p>
                  </div>
                </div>
             

           
                <div className="flex items-start gap-3">
                  <Cake size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Ngày sinh</p>
                    <p className="font-medium text-gray-900">{formatDate(user.dateOfBirth) || "Chưa cập nhật"}</p>
                  </div>
                </div>
            
            </div>
          </div>
     

        {/* Thống kê hoạt động */}
        
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">Thống kê hoạt động</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center text-sm">
              <div>
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{user.numberOfFavorites}</p>
                <p className="text-gray-600">Lễ hội yêu thích</p>
              </div>
              <div>
                <Bookmark className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{user.numberOfContributionSaves}</p>
                <p className="text-gray-600">Bài viết đã lưu</p>
              </div>
              <div>
                <Flag className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{user.numberOfReports}</p>
                <p className="text-gray-600">Báo cáo nội dung</p>
              </div>
              <div>
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{user.numberOfSubscriptions}</p>
                <p className="text-gray-600">Gói đã mua</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 text-center text-xs border-t pt-4">
              <div>
                <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="font-bold">{user.numberOfHeritageReviews}</p>
                <p className="text-gray-600">Bình luận lễ hội</p>
              </div>
              <div>
                <MessageSquare className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <p className="font-bold">{user.numberOfContributionReviews}</p>
                <p className="text-gray-600">Bình luân bài viết</p>
              </div>
              <div>
                <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="font-bold">{user.numberOfContributionReports}</p>
                <p className="text-gray-600">Báo cáo bài viết</p>
              </div>
              
            </div>
          </div>
       

        {/* Thời gian */}
        <div className="pt-4 border-t text-sm text-gray-600 space-y-2">
          <div className="flex justify-between">
            <span>Tạo tài khoản:</span>
            <span className="font-medium text-gray-900">{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cập nhật lần cuối:</span>
            <span className="font-medium text-gray-900">{formatDateTime(user.updatedAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </PortalModal>
  );
}