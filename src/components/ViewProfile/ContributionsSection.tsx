import React from 'react';

interface ContributionItem {
  title: string;
  status: string;
}

interface ContributionsSectionProps {
  contributions: ContributionItem[];
  onMenuChange: (key: string) => void;
}

const ContributionsSection: React.FC<ContributionsSectionProps> = ({
  contributions,
  onMenuChange
}) => {
  const renderEmptyState = (icon: string, title: string, description: string) => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="text-8xl mb-6 animate-bounce">{icon}</div>
      <div className="text-xl font-semibold mb-3 text-gray-600">{title}</div>
      <div className="text-sm text-center max-w-md">{description}</div>
    </div>
  );

  const renderContributionItem = (item: ContributionItem, idx: number) => {
    const getStatusConfig = () => {
      switch(item.status) {
        case "Đã duyệt": return { 
          bg: "bg-yellow-100", 
          text: "text-yellow-700", 
          icon: "✅", 
          border: "border-yellow-300",
          darkBg: "bg-yellow-200"
        };
        case "Chờ duyệt": return { 
          bg: "bg-amber-100", 
          text: "text-amber-700", 
          icon: "⏳", 
          border: "border-amber-300",
          darkBg: "bg-amber-200"
        };
        default: return { 
          bg: "bg-orange-100", 
          text: "text-orange-700", 
          icon: "❌", 
          border: "border-orange-300",
          darkBg: "bg-orange-200"
        };
      }
    };
    
    const status = getStatusConfig();

    return (
      <div
        key={idx}
        className={`bg-white p-6 rounded-3xl border border-gray-100 hover:${status.border} hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 ${status.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-3xl">📤</span>
            </div>
            <div>
              <h4 className={`font-bold text-gray-800 group-hover:${status.text} transition-colors duration-200 text-lg mb-2`}>
                {item.title}
              </h4>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 ${status.darkBg} ${status.text} rounded-full text-sm font-bold`}>
                  <span className="mr-2">{status.icon}</span>{item.status}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  <span className="mr-1">📝</span>Bài viết
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 text-sm font-semibold group-hover:scale-105">
              <span className="mr-2">✏️</span>Chỉnh sửa
            </button>
            <button className={`px-4 py-2 ${status.bg} hover:opacity-80 ${status.text} rounded-xl transition-all duration-200 text-sm font-semibold`}>
              <span className="mr-2">👁️</span>Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-black mb-3 flex items-center gap-3">
            <span className="text-4xl">📤</span>
            Đóng góp đã gửi
          </h2>
          <p className="text-gray-700 text-lg">Các đóng góp nội dung bạn đã gửi</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-amber-300/50 shadow-lg">
            <div className="text-3xl font-bold text-amber-700">{contributions.length}</div>
            <div className="text-sm text-amber-600 font-medium">Đóng góp</div>
          </div>
          <button
            onClick={() => onMenuChange("add-contribution")}
            className="px-8 py-4 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white rounded-3xl hover:from-yellow-700 hover:to-amber-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <span className="mr-3 text-xl">➕</span>
            Thêm đóng góp mới
          </button>
        </div>
      </div>
      <div className="space-y-6">
        {contributions.length === 0 ? 
          renderEmptyState("📝", "Chưa có đóng góp nào", "Hãy chia sẻ kiến thức về di sản văn hóa!") :
          contributions.map(renderContributionItem)
        }
      </div>
    </div>
  );
};

export default ContributionsSection;