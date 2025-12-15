import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Clock, 
  Shield, 
  Users, 
  FileText, 
  RotateCcw,
  Target,
  Edit3,
  CheckSquare,
  Activity,
  Settings
} from 'lucide-react';
import { ContributorApplyResponse } from '../../../types/contributor';
import { ContributorStatus } from '../../../types/enum';

interface VerifiedTabProps {
  contributorData: ContributorApplyResponse | null;
  loadError: string | null;
  loading: boolean;
  onRetryLoad: () => void;
  onLoginRedirect: () => void;
  onOpenApplicationModal: () => void;
}

const VerifiedTab: React.FC<VerifiedTabProps> = ({
  contributorData,
  loadError,
  loading,
  onRetryLoad,
  onLoginRedirect,
  onOpenApplicationModal
}) => {
  // Contributor đã verified và đang ACTIVE hoặc APPROVED
  const isVerifiedContributor = contributorData?.status === ContributorStatus.ACTIVE;

  // Case: Lỗi load dữ liệu
  if (loadError) {
    return (
      <div className="text-center py-12">
        <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-16 h-16 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-red-600 mb-4">Lỗi tải dữ liệu</h3>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-red-700 mb-4">{loadError}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onRetryLoad}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              disabled={loading}
            >
              Thử lại
            </button>
            {loadError.includes('đăng nhập') && (
              <button
                onClick={onLoginRedirect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Đăng nhập lại
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 1: Contributor chính thức
  if (isVerifiedContributor) {
    return (
      <div className="text-center py-12">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Tài khoản đã được xác thực
        </h3>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Chúc mừng! Tài khoản của bạn đã được admin xác thực và bạn đang hoạt động với tư cách là cộng tác viên của hệ thống.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto">
          <div className="text-green-600 text-lg font-semibold mb-4 flex items-center justify-center gap-2">
            <Target className="w-5 h-5" />
            Quyền hạn của bạn
          </div>
          <div className="text-left space-y-3 text-green-700">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-green-600" />
              <span>Tạo và chỉnh sửa bài viết về di sản văn hóa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-green-600" />
              <span>Đánh giá và phê duyệt nội dung từ thành viên</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span>Tham gia các hoạt động bảo tồn di sản</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-green-600" />
              <span>Truy cập các tính năng nâng cao của hệ thống</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Đã có application nhưng chưa được active
  if (contributorData) {
    // Bị từ chối
    if (contributorData.status === ContributorStatus.REJECTED) {
      return (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-16 h-16 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Đơn đăng ký đã bị từ chối
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Bạn có thể gửi lại đơn đăng ký mới với thông tin được cải thiện.
          </p>

          <button
            onClick={onOpenApplicationModal}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-xl flex items-center gap-2 mx-auto"
            disabled={loading}
          >
            <RotateCcw className="w-5 h-5" />
            Gửi lại đơn đăng ký
          </button>
        </div>
      );
    }

    // Đơn đang chờ duyệt
    if (contributorData.status === ContributorStatus.APPLIED) {
      return (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-16 h-16 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Đơn đăng ký đang chờ duyệt
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Vui lòng chờ admin xem xét đơn đăng ký của bạn.
          </p>
        </div>
      );
    }

    // Bị treo
    if (contributorData.status === ContributorStatus.SUSPENDED) {
      return (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-16 h-16 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Quyền Contributor bị tạm ngưng
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tài khoản của bạn đang bị tạm ngưng quyền cộng tác viên. Vui lòng liên hệ admin để biết thêm chi tiết.
          </p>
        </div>
      );
    }
  }

  // Case 3: Chưa nộp đơn → cho phép apply
  return (
    <div className="text-center py-12">
      <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Users className="w-16 h-16 text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Chưa được cấp quyền Contributor
      </h3>
      <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
        Hãy gửi đơn đăng ký để trở thành cộng tác viên và đóng góp nhiều hơn cho cộng đồng di sản văn hóa.
      </p>

      <button
        onClick={onOpenApplicationModal}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-xl flex items-center gap-2 mx-auto"
        disabled={loading}
      >
        <FileText className="w-5 h-5" />
        Đăng ký làm cộng tác viên
      </button>
    </div>
  );
};

export default VerifiedTab;