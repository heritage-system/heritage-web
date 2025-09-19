import React from 'react';
import { ContributorApplyResponse } from '../../../types/contributor';
import { ContributorStatus } from '../../../types/enum';

interface StatusDisplayProps {
  contributorData: ContributorApplyResponse | null;
  loadError: string | null;
  loading: boolean;
  onRetryLoad: () => void;
  onLoginRedirect: () => void;
  onOpenApplicationModal: () => void;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  contributorData,
  loadError,
  loading,
  onRetryLoad,
  onLoginRedirect,
  onOpenApplicationModal
}) => {
  // Case: Lỗi load dữ liệu
  if (loadError) {
    return (
      <div className="text-center py-12">
        <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl">⚠️</span>
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

  // Case 1: Contributor chính thức (ACTIVE)
  if (contributorData?.status === ContributorStatus.ACTIVE) {
    return (
      <div className="text-center py-12">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl">✅</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Tài khoản đã được kích hoạt
        </h3>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Chúc mừng! Bạn đang hoạt động với tư cách là cộng tác viên của hệ thống.
        </p>
      </div>
    );
  }

  // Case 2: Có contributorData nhưng chưa ACTIVE
  if (contributorData) {
    if (contributorData.status === ContributorStatus.ACTIVE) {
      return (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">🎯</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Đơn đăng ký được chấp thuận
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Vui lòng chờ admin kích hoạt tài khoản của bạn.
          </p>
          {renderApplicationDetails(contributorData)}
        </div>
      );
    }

    if (contributorData.status === ContributorStatus.APPLIED) {
      return (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-6xl">⏳</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Đơn đăng ký đang được xem xét
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Cảm ơn bạn đã gửi đơn đăng ký cộng tác viên! Chúng tôi sẽ phản hồi trong vòng 7 ngày.
          </p>
          {renderApplicationDetails(contributorData)}
        </div>
      );
    }

    if (contributorData.status === ContributorStatus.REJECTED) {
      return (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">❌</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Đơn đăng ký đã bị từ chối
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Bạn có thể gửi lại đơn đăng ký mới.
          </p>
          {renderApplicationDetails(contributorData, true)}
        </div>
      );
    }

    if (contributorData.status === ContributorStatus.SUSPENDED) {
      return (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">⏸️</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Quyền Contributor bị tạm ngưng
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Vui lòng liên hệ admin để biết thêm chi tiết.
          </p>
          {renderApplicationDetails(contributorData)}
        </div>
      );
    }
  }

  // Case 3: Chưa có contributorData - cho phép đăng ký
  return (
    <div className="text-center py-12">
      <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-6xl">👥</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Chưa được cấp quyền Contributor
      </h3>
      <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
        Hãy gửi đơn đăng ký để trở thành cộng tác viên.
      </p>
      <button
        onClick={onOpenApplicationModal}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-xl"
        disabled={loading}
      >
        📝 Đăng ký làm cộng tác viên
      </button>
    </div>
  );

  // Helper function để render chi tiết đơn đăng ký
  function renderApplicationDetails(data: ContributorApplyResponse, showReapplyButton: boolean = false) {
    const getStatusConfig = (status: ContributorStatus) => {
      const configs = {
        [ContributorStatus.APPLIED]: {
          text: 'Đang chờ xem xét',
          color: 'bg-amber-100 text-amber-700',
          icon: '⏳'
        },
        [ContributorStatus.ACTIVE]: {
          text: 'Đang hoạt động',
          color: 'bg-green-100 text-green-700',
          icon: '🎯'
        },
        [ContributorStatus.REJECTED]: {
          text: 'Đã bị từ chối',
          color: 'bg-red-100 text-red-700',
          icon: '❌'
        },
        [ContributorStatus.SUSPENDED]: {
          text: 'Tạm ngừng',
          color: 'bg-gray-100 text-gray-700',
          icon: '⏸️'
        }
      };
      
      return configs[status] || { 
        text: 'Không xác định', 
        color: 'bg-gray-100 text-gray-700', 
        icon: '❓' 
      };
    };

    const statusConfig = getStatusConfig(data.status as ContributorStatus);

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 max-w-3xl mx-auto border border-blue-200 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xl font-bold text-gray-800">Thông tin đơn đăng ký</h4>
          <span className={`px-6 py-3 rounded-full font-bold text-lg ${statusConfig.color}`}>
            <span className="mr-2">{statusConfig.icon}</span>
            {statusConfig.text}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-sm text-blue-600 mb-1 font-medium">Mã đơn đăng ký</div>
            <div className="text-lg font-bold text-blue-800">#{data.id}</div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-6">
            <div className="text-sm text-purple-600 mb-1 font-medium">Ngày gửi đơn</div>
            <div className="text-lg font-bold text-purple-800">
              {new Date(data.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {data.bio && (
          <div className="mb-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👤</span>
              <span className="text-gray-700 font-medium">Tiểu sử cá nhân</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
              <p className="text-gray-700">{data.bio}</p>
            </div>
          </div>
        )}

        {data.expertise && (
          <div className="mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <span className="text-gray-700 font-medium">Chuyên môn</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-400">
              <p className="text-gray-700">{data.expertise}</p>
            </div>
          </div>
        )}

        {data.documentsUrl && (
          <div className="mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📁</span>
              <span className="text-gray-700 font-medium">Tài liệu đính kèm</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-pink-400">
              <a 
                href={data.documentsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {data.documentsUrl}
              </a>
            </div>
          </div>
        )}

        {/* Hiển thị thông tin dựa trên trạng thái */}
        {data.status === ContributorStatus.APPLIED && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
            <h5 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span>
              Quy trình đánh giá
            </h5>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-green-700 font-medium">Tiếp nhận đơn đăng ký</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-amber-700 font-medium">Xem xét hồ sơ (3-5 ngày)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">Thông báo kết quả cuối cùng</span>
              </div>
            </div>
          </div>
        )}

        {showReapplyButton && (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
            <h5 className="font-bold text-red-800 mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Gợi ý cải thiện để đăng ký lại
            </h5>
            <div className="text-left space-y-3 text-red-700 mb-6">
              <div className="flex items-start gap-2">
                <span>•</span>
                <span>Bổ sung thêm kinh nghiệm cụ thể liên quan đến di sản văn hóa</span>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <span>Cung cấp portfolio hoặc tài liệu chứng minh năng lực và đóng góp trước đây</span>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <span>Tham gia các khóa học, hội thảo về bảo tồn di sản văn hóa</span>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <span>Viết blog hoặc bài viết về chủ đề di sản để thể hiện hiểu biết</span>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={onOpenApplicationModal}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 font-semibold"
                disabled={loading}
              >
                Gửi đơn đăng ký mới
              </button>
            </div>
          </div>
        )}

        {/* Contact information */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📞</span>
            Liên hệ hỗ trợ
          </h5>
          <div className="text-sm text-blue-700 space-y-2">
            <div>Email: support@heritage-system.com</div>
            <div>Hotline: 1900-xxxx (8:00 - 17:00, T2-T6)</div>
            <div>Thời gian phản hồi: 1-2 ngày làm việc</div>
          </div>
        </div>
      </div>
    );
  }
};

export default StatusDisplay;