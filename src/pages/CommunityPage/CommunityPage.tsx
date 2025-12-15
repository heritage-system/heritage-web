// src/pages/CommunityPage.tsx
import React, { useState } from 'react';
import { Video } from 'lucide-react';
import CommunityStats from '../../components/Community/CommunityStats';
import LiveWorkshopPanel from '../../components/Community/LiveWorkshopPanel';
import WorkshopCard from '../../components/Community/WorkshopCard';
import UpcomingWorkshops from '../../components/Community/UpcomingWorkshops';
import ActiveMentors from '../../components/Community/ActiveMentors';

const CommunityPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const workshops = [
    {
      id: 1,
      title: 'Làm gốm truyền thống Bát Tràng',
      description: 'Học cách tạo hình và nung gốm theo phương pháp truyền thống của làng Bát Tràng.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      instructor: 'Nghệ nhân Nguyễn Văn A',
      category: 'Thủ công',
      date: '28/06/2025',
      time: '14:00 - 17:00',
      duration: '3 giờ',
      participants: 15,
      maxParticipants: 20,
      rating: 4.9,
      isLive: true,
      isVirtual: true
    },
    // ... các workshop khác
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', icon: 'Theater' },
    { id: 'Thủ công', name: 'Thủ công', icon: 'Pot' },
    { id: 'Âm nhạc', name: 'Âm nhạc', icon: 'Music' },
    { id: 'Ẩm thực', name: 'Ẩm thực', icon: 'Cake' }
  ];

  const filteredWorkshops = workshops.filter(workshop => 
    selectedCategory === 'all' || workshop.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 bg-clip-text text-transparent">
              Cộng đồng
            </span> Di sản Văn hóa Lễ hội
          </h1>
          <p className="text-gray-600 text-lg">Kết nối, học hỏi và chia sẻ cùng cộng đồng yêu văn hóa truyền thống</p>
        </div>

        <div className="mb-8">
          <CommunityStats />
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          <div className="xl:flex-1 space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Video className="w-5 h-5 mr-2 text-red-500" />
                Workshop đang diễn ra
              </h2>
              <LiveWorkshopPanel />
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredWorkshops.map(workshop => (
                <div key={workshop.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
                  <WorkshopCard workshop={workshop} />
                </div>
              ))}
            </div>
          </div>

          <div className="xl:w-96 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <UpcomingWorkshops />
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <ActiveMentors />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityPage;