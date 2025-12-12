import React, { useState } from "react";
import { BookmarkPlus, Share2, Flag } from "lucide-react";
import ReportModal from "../Contribution/ReportModal";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import PortalModal from "../Layouts/ModalLayouts/PortalModal";
import { useNavigate } from "react-router-dom";
interface Author {
  avatarUrl: string;
  contributorName: string;
}

interface SidebarProps {
  contributionId: number;
  author: Author;
  isSaved: boolean;
  onSave: () => void;
}

const ContributionDetailSidebar: React.FC<SidebarProps> = ({ 
  author, 
  isSaved, 
  onSave,
  contributionId
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const navigate = useNavigate();
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = document.title;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success("Đã sao chép link!");  
        break;
    }
    setShowShareMenu(false);
  };

  const handleSaveClick = () => {    
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }
    onSave();
  };

  const handleReportClick = () => {    
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }
    setReportOpen(true);
  };
  return (
    <div className="sticky top-8 space-y-6">
      {/* Author Info */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={author.avatarUrl} 
            alt={author.contributorName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{author.contributorName}</h4>
            <p className="text-xs text-gray-600">Tác giả</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h4>
        <div className="space-y-3">
          {/* Lưu bài viết */}
          <button 
            onClick={handleSaveClick}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isSaved 
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-yellow-50 hover:text-yellow-700'
            }`}
          >
            <BookmarkPlus className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Đã lưu' : 'Lưu bài viết'}</span>
          </button>

          {/* Chia sẻ */}
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>

            {showShareMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 flex items-center justify-around w-40">
                <button 
                  onClick={() => handleShare('facebook')} 
                  className="p-2 rounded-full hover:bg-blue-50 text-blue-600"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </button>

                <button 
                  onClick={() => handleShare('twitter')} 
                  className="p-2 rounded-full hover:bg-blue-50 text-sky-500"
                  title="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.86 1.09A4.52 4.52 0 0016.11 0c-2.63 0-4.77 2.13-4.77 4.76 0 .37.04.73.12 1.07C7.69 5.67 4.07 3.75 1.64.96a4.77 4.77 0 00-.65 2.39c0 1.65.84 3.1 2.12 3.95a4.52 4.52 0 01-2.16-.6v.06c0 2.3 1.65 4.22 3.84 4.65a4.5 4.5 0 01-2.14.08c.6 1.86 2.34 3.22 4.4 3.26A9.05 9.05 0 010 19.54a12.79 12.79 0 006.92 2.03c8.3 0 12.84-6.88 12.84-12.84 0-.2 0-.41-.01-.61A9.18 9.18 0 0023 3z"/>
                  </svg>
                </button>

                <button 
                  onClick={() => handleShare('copy')} 
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                  title="Sao chép link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10 13a5 5 0 007.54 4.54l3.36-3.36a5 5 0 00-7.07-7.07l-.88.88"/>
                    <path d="M14 11a5 5 0 00-7.54-4.54L3.1 9.82a5 5 0 007.07 7.07l.88-.88"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Báo cáo */}
          <button 
            onClick={handleReportClick}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <Flag className="w-4 h-4" />
            <span>Báo cáo</span>
          </button>

          {/* Modal */}
          <ReportModal
            open={reportOpen}
            onClose={() => setReportOpen(false)}
            contributionId={contributionId}
          />

          <PortalModal
            open={openLoginModal}
            onClose={() => setOpenLoginModal(false)}
          >
            <div className="p-6 text-center border-2 border-red-400 rounded-xl shadow-lg bg-white">
              <h2 className="text-lg font-semibold mb-3">Bạn cần đăng nhập</h2>
              <p className="text-gray-600 mb-4">
                Vui lòng đăng nhập để thực hiện hành động!
              </p>

              {/* Wrap button trong div flex justify-center */}
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-yellow-800 to-yellow-600 text-white px-6 py-2 rounded-xl
                            hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          </PortalModal>
        </div>
      </div>
    </div>
  );
};

export default ContributionDetailSidebar;