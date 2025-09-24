import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  CheckCircle, 
  FileText, 
  Camera 
} from 'lucide-react';

interface EventItem {
  name: string;
  date: string;
}

const mockEvents: EventItem[] = [
  { name: "Lễ hội Áo dài", date: "20/03/2025" },
  { name: "Ngày Di sản Việt Nam", date: "23/11/2024" },
  { name: "Festival Huế", date: "15/08/2024" },
  { name: "Lễ hội Đền Hùng", date: "10/04/2024" },
];

const EventsSection: React.FC = () => {
  const renderEmptyState = (icon: React.ReactNode, title: string, description: string) => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="mb-6 animate-bounce">{icon}</div>
      <div className="text-xl font-semibold mb-3 text-gray-600">{title}</div>
      <div className="text-sm text-center max-w-md">{description}</div>
    </div>
  );

  const renderEventItem = (item: EventItem, idx: number) => (
    <div
      key={idx}
      className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 group-hover:text-yellow-700 transition-colors duration-200 text-lg mb-2">
              {item.name}
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {item.date}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Đã tham gia
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-xl transition-all duration-200 text-sm font-semibold group-hover:scale-105 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Xem certificate
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 text-sm font-semibold flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Ảnh sự kiện
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-black mb-3 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-amber-600" />
            Sự kiện đã tham gia
          </h2>
          <p className="text-gray-700 text-lg">Các sự kiện văn hóa bạn đã tham gia</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-amber-300/50 shadow-lg">
          <div className="text-3xl font-bold text-amber-700">{mockEvents.length}</div>
          <div className="text-sm text-amber-600 font-medium">Sự kiện</div>
        </div>
      </div>
      <div className="space-y-6">
        {mockEvents.length === 0 ? 
          renderEmptyState(
            <Calendar className="w-20 h-20 text-gray-300" />, 
            "Chưa tham gia sự kiện nào", 
            "Hãy tham gia các sự kiện văn hóa thú vị!"
          ) :
          mockEvents.map(renderEventItem)
        }
      </div>
    </div>
  );
};

export default EventsSection;