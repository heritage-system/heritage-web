import React, { useState, useEffect } from 'react';
import { getMyApplication, applyContributor } from '../../../services/contributorService';
import { ContributorApplyResponse } from '../../../types/contributor';
import ApplicationModal from './ApplicationModal';
import StatusDisplay from './StatusDisplay';
import { toast } from "react-hot-toast";
import { Users, Loader2, X, CheckCircle } from 'lucide-react';
import Spinner from "../../Layouts/LoadingLayouts/Spinner";
export interface ApplicationData {
  bio: string;
  expertise: string;
  documentsUrl: string;
}

const CollaboratorRequestSection: React.FC = () => {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contributorData, setContributorData] = useState<ContributorApplyResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadContributorData();
  }, []);

  const loadContributorData = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const response = await getMyApplication();

      if (response.code === 200 && response.result) {
        setContributorData(response.result);
      } else if (response.code === 404 || !response.result) {
        setContributorData(null);
      } else if (response.code === 403) {
        setLoadError('Bạn không có quyền truy cập thông tin này. Vui lòng đăng nhập lại.');
      } else {
        setLoadError(response.message || 'Không thể tải thông tin cộng tác viên');
      }
    } catch (error: any) {
      console.error('Error loading contributor data:', error);

      if (error?.response?.status === 403) {
        setLoadError('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
      } else if (error?.response?.status === 401) {
        setLoadError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error?.response?.status === 404) {
        setContributorData(null);
      } else {
        setLoadError('Có lỗi xảy ra khi tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async (applicationData: ApplicationData) => {
    if (!applicationData.bio.trim() || !applicationData.expertise.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!", {
        icon: <X className="w-5 h-5 text-red-500" />,
      });
      return false;
    }

    try {
      setLoading(true);
      const response = await applyContributor({
        bio: applicationData.bio,
        expertise: applicationData.expertise,
        documentsUrl: applicationData.documentsUrl || undefined,
      });

      if (response.code === 201 && response.result) {
        await loadContributorData();
        setShowApplicationModal(false);
        toast.success(
          "Đã gửi đơn đăng ký thành công! Chúng tôi sẽ xem xét và phản hồi trong vòng 7 ngày làm việc.",
          {
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          }
        );
        return true;
      } else {
        toast.error(
          `${response.message || "Có lỗi xảy ra khi gửi đơn đăng ký"}`,
          {
            icon: <X className="w-5 h-5 text-red-500" />,
          }
        );
        return false;
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(
        `${
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi gửi đơn đăng ký"
        }`,
        {
          icon: <X className="w-5 h-5 text-red-500" />,
        }
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLoad = () => {
    loadContributorData();
  };

  const handleLoginRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('contributorId');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading && !contributorData) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px] flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mb-4" size={32}/>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-black mb-3 flex items-center gap-3">
          <Users className="w-10 h-10 text-blue-600" />
          Yêu cầu cộng tác viên
        </h2>
        <p className="text-gray-700 text-lg">
          Trở thành cộng tác viên để đóng góp nhiều hơn cho cộng đồng di sản văn hóa
        </p>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-blue-200">
        <StatusDisplay
          contributorData={contributorData}
          loadError={loadError}
          loading={loading}
          onRetryLoad={handleRetryLoad}
          onLoginRedirect={handleLoginRedirect}
          onOpenApplicationModal={() => setShowApplicationModal(true)}
        />
      </div>

      <ApplicationModal
        open={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSubmit={handleSubmitApplication}
        loading={loading}
      />
    </div>
  );
};

export default CollaboratorRequestSection;