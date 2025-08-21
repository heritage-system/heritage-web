import React, { useState } from 'react';
import { Video, MessageCircle } from 'lucide-react';
import CommunityFeed from '../../components/Community/CommunityFeed';
import CommunityStats from '../../components/Community/CommunityStats';
import LiveWorkshopPanel from '../../components/Community/LiveWorkshopPanel';
import WorkshopCard from '../../components/Community/WorkshopCard';
import UpcomingWorkshops from '../../components/Community/UpcomingWorkshops';
import ActiveMentors from '../../components/Community/ActiveMentors';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('workshops');
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
    {
      id: 2,
      title: 'Thêu tay Huế cơ bản',
      description: 'Khóa học cơ bản về nghệ thuật thêu tay truyền thống của cố đô Huế.',
      image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop',
      instructor: 'Cô Phương Lan',
      category: 'Thủ công',
      date: '29/06/2025',
      time: '19:00 - 21:00',
      duration: '2 giờ',
      participants: 8,
      maxParticipants: 15,
      rating: 4.8,
      isLive: false,
      isVirtual: true
    },
    {
      id: 3,
      title: 'Học hát Xoan Phú Thọ',
      description: 'Khám phá và học hát dân ca Xoan - di sản văn hóa phi vật thể của Phú Thọ.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop',
      instructor: 'Thầy Hoàng Minh',
      category: 'Âm nhạc',
      date: '30/06/2025',
      time: '15:30 - 17:30',
      duration: '2 giờ',
      participants: 12,
      maxParticipants: 18,
      rating: 4.7,
      isLive: false,
      isVirtual: true
    },
    {
      id: 4,
      title: 'Làm bánh trung thu truyền thống',
      description: 'Workshop thực hành làm bánh trung thu theo công thức gia truyền.',
      image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
      instructor: 'Bà Nguyễn Thị Hương',
      category: 'Ẩm thực',
      date: '01/07/2025',
      time: '09:00 - 12:00',
      duration: '3 giờ',
      participants: 6,
      maxParticipants: 12,
      rating: 4.6,
      isLive: false,
      isVirtual: false
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🎭' },
    { id: 'Thủ công', name: 'Thủ công', icon: '🏺' },
    { id: 'Âm nhạc', name: 'Âm nhạc', icon: '🎵' },
    { id: 'Ẩm thực', name: 'Ẩm thực', icon: '🍰' }
  ];

  const filteredWorkshops = workshops.filter(workshop => 
    selectedCategory === 'all' || workshop.category === selectedCategory
  );

  return (
   <div className="min-h-screen bg-white mt-16">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 bg-clip-text text-transparent">
  Cộng đồng
</span> Di sản Văn hóa  
          </h1>
          <p className="text-gray-600 text-lg">Kết nối, học hỏi và chia sẻ cùng cộng đồng yêu văn hóa truyền thống</p>
        </div>

        {/* Community Stats */}
        <div className="mb-8">
          <CommunityStats />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-1 max-w-md mx-auto shadow-sm">
          <button
            onClick={() => setActiveTab('workshops')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'workshops'
                ? 'bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white shadow-lg'
                : 'text-gray-700 hover:bg-yellow-50'
            }`}
          >
            Workshop ảo
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white shadow-lg'
                : 'text-gray-700 hover:bg-yellow-50'
            }`}
          >
            Cộng đồng
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main Content */}
          <div className="xl:flex-1 space-y-8">

            {activeTab === 'workshops' ? (
              <>
                {/* Live Workshop Panel */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-red-500" />
                    Workshop đang diễn ra
                  </h2>
                  <LiveWorkshopPanel />
                </div>

                {/* Category Filters */}
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

                {/* Workshop Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredWorkshops.map(workshop => (
                    <div key={workshop.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
                      <WorkshopCard workshop={workshop} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                  Bài đăng từ cộng đồng
                </h2>
                <CommunityFeed />
              </div>
            )}

          </div>

          {/* Sidebar */}
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
