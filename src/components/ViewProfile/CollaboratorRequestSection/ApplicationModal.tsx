import React, { useState, ChangeEvent, useEffect } from 'react';
import { 
  ClipboardList, 
  User, 
  Target, 
  Folder, 
  X, 
  Send 
} from 'lucide-react';
import PortalModal from '../../Layouts/ModalLayouts/PortalModal';
import { ApplicationData } from './CollaboratorRequestSection';

interface ApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationData) => Promise<boolean>;
  loading: boolean;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading
}) => {
  const [application, setApplication] = useState<ApplicationData>({
    bio: '',
    expertise: '',
    documentsUrl: ''
  });

  useEffect(() => {
    if (!open) {
      setApplication({
        bio: '',
        expertise: '',
        documentsUrl: ''
      });
    }
  }, [open]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplication(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const success = await onSubmit(application);
    if (success) {
      setApplication({
        bio: '',
        expertise: '',
        documentsUrl: ''
      });
    }
  };

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="xl"
      maxHeight="90vh"
      ariaLabel="Đơn đăng ký cộng tác viên"
    >
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-h-full overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-blue-600" />
            Đơn đăng ký cộng tác viên
          </h3>
          <p className="text-gray-600">Vui lòng điền đầy đủ thông tin để chúng tôi có thể đánh giá hồ sơ của bạn</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              Tiểu sử cá nhân <span className="text-red-500">*</span>
            </label>
            <textarea
              name="bio"
              value={application.bio}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 h-32 resize-y"
              placeholder="Giới thiệu về bản thân, quá trình học tập và công việc..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              Chuyên môn <span className="text-red-500">*</span>
            </label>
            <textarea
              name="expertise"
              value={application.expertise}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 h-32 resize-y"
              placeholder="Lĩnh vực chuyên môn của bạn, kinh nghiệm liên quan đến di sản văn hóa..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
             Tài liệu đính kèm
            </label>
            <input
              type="url"
              name="documentsUrl"
              value={application.documentsUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              placeholder="Link đến portfolio, blog cá nhân hoặc tài liệu liên quan..."
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            <X className="w-4 h-4" />
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            disabled={loading}
          >
            <Send className="w-4 h-4" />
            {loading ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
          </button>
        </div>
      </div>
    </PortalModal>
  );
};

export default ApplicationModal;