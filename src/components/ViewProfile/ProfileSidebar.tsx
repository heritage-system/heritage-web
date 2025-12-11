import React from 'react';
import { 
  User, 
  Heart, 
  Calendar, 
  FileText, 
  Send, 
  LucideBookMarked ,History
} from 'lucide-react';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  contributorOnly: boolean;
}

interface Profile {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  isContributor?: boolean;
}

interface ProfileSidebarProps {
  profile: Profile;
  currentTab: string;
  onMenuChange: (key: string) => void;
}

const MENU: MenuItem[] = [
  { key: "profile", label: "Thông tin cá nhân", icon: <User className="w-5 h-5" />,contributorOnly: false },
  { key: "favorites", label: "Di sản yêu thích", icon: <Heart className="w-5 h-5" />,contributorOnly: false},
  { key: "contribution_saves", label: "Bài viết đã lưu", icon: <LucideBookMarked className="w-5 h-5" />,contributorOnly: false},
  { key: "events", label: "Sự kiện đã tham gia", icon: <Calendar className="w-5 h-5" />,contributorOnly: false },
  { key: "quiz", label: "Lịch sử quiz", icon: <FileText className="w-5 h-5" />,contributorOnly: false },
  { key: "interaction_history", label: "Lịch sử tương tác", icon: <History className="w-5 h-5" />, contributorOnly: false },
  // Hai mục này chỉ hiển thị khi là contributor
  { key: "contributions", label: "Đóng góp đã gửi", icon: <Send className="w-5 h-5" />, contributorOnly: true },
  // { key: "collaborator-request", label: "Yêu cầu cộng tác viên", icon: <Users className="w-5 h-5" />, contributorOnly: false },
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  profile, 
  currentTab, 
  onMenuChange 
}) => {
  return (
    <div className="w-72 bg-gradient-to-b from-yellow-50 via-red-50 to-orange-50 py-8 px-6 flex flex-col border-r border-yellow-200">
      {/* Menu Items */}
      <div className="space-y-2">
        {MENU.filter(item => !item.contributorOnly || profile.isContributor).map((item) => (
          <button
            key={item.key}
            onClick={() => onMenuChange(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left group ${
              currentTab === item.key
                ? "bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white shadow-lg transform scale-105"
                : "text-black hover:bg-yellow-200/50 hover:transform hover:translate-x-1"
            }`}
          >
            <span className="group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
            {currentTab === item.key && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-auto pt-3 border-t border-yellow-200">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-2">
          <div className="text-xs text-black text-center mb-1">
            Hoạt động tháng này
          </div>
          <div className="grid grid-cols-2 gap-1 text-center">
            <div>
              <div className="text-lg font-bold text-black">12</div>
              <div className="text-xs text-black">Tương tác</div>
            </div>
            <div>
              <div className="text-lg font-bold text-black">5</div>
              <div className="text-xs text-black">Đóng góp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
