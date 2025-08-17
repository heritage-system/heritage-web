import React, { useState } from 'react';
import DiscoveryGoogleMapsView from "../../components/Discovery/DiscoveryGoogleMapsView";
import DiscoveryHeader from '../../components/Discovery/DiscoveryHeader';
import DiscoveryHeritageGrid from '../../components/Discovery/DiscoveryHeritageGrid';
import DiscoveryQuickFilters from '../../components/Discovery/DiscoveryQuickFilters';
import DiscoveryUpcomingEvents from '../../components/Discovery/DiscoveryUpcomingEvents';
import DiscoveryViewToggle from '../../components/Discovery/DiscoveryViewToggle';

// Main Discovery Page Component
const DiscoveryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [view, setView] = useState('grid');

  // Sample heritage data
  const heritages = [
    {
      id: 1,
      title: 'Lễ hội Chùa Hương',
      description: 'Lễ hội lớn nhất miền Bắc, diễn ra tại chùa Hương với nhiều hoạt động tâm linh.',
      image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop',
      location: 'Hà Nội',
      date: '15/01/2025',
      rating: 4.9,
      views: '12.3K',
      comments: 23,
      hasVR: true,
      isHot: true,
      category: 'festivals'
    },
    {
      id: 2,
      title: 'Nhã nhạc Cung đình Huế',
      description: 'Di sản văn hóa phi vật thể được UNESCO công nhận.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=240&fit=crop',
      location: 'Thừa Thiên Huế',
      date: '20/03/2025',
      rating: 4.8,
      views: '9.8K',
      comments: 14,
      hasVR: false,
      isHot: true,
      category: 'music'
    },
    {
      id: 3,
      title: 'Múa rối nước Thăng Long',
      description: 'Nghệ thuật múa rối nước truyền thống của Việt Nam.',
      image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=240&fit=crop',
      location: 'Hà Nội',
      date: '25/02/2025',
      rating: 4.6,
      views: '7.2K',
      comments: 12,
      hasVR: true,
      isHot: false,
      category: 'performances'
    },
    {
      id: 4,
      title: 'Làng gốm Bát Tràng',
      description: 'Làng nghề truyền thống với lịch sử hơn 700 năm.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=240&fit=crop',
      location: 'Hà Nội',
      date: '05/04/2025',
      rating: 4.5,
      views: '6.8K',
      comments: 9,
      hasVR: false,
      isHot: false,
      category: 'crafts'
    },
    {
      id: 5,
      title: 'Lễ hội Kate người Chăm',
      description: 'Lễ hội truyền thống của đồng bào Chăm tại Ninh Thuận.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=240&fit=crop',
      location: 'Ninh Thuận',
      date: '10/10/2025',
      rating: 4.7,
      views: '8.6K',
      comments: 8,
      hasVR: true,
      isHot: false,
      category: 'festivals'
    },
    {
      id: 6,
      title: 'Lễ Giỗ Tổ Hùng Vương',
      description: 'Lễ hội tưởng nhớ công đức các vua Hùng.',
      image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop',
      location: 'Phú Thọ',
      date: '18/04/2025',
      rating: 4.9,
      views: '15.2K',
      comments: 31,
      hasVR: true,
      isHot: true,
      category: 'festivals'
    }
  ];

  // Filter heritages based on selected category
  const filteredHeritages = heritages.filter(heritage => 
    selectedCategory === 'all' || heritage.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Khám phá <span className="text-purple-600">Di sản Văn hóa</span> Việt Nam
          </h1>
          <p className="text-gray-600">
            Hành trình khám phá những giá trị văn hóa truyền thống
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <DiscoveryQuickFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <div className="flex items-center gap-4">
                <DiscoveryViewToggle view={view} onViewChange={setView} />
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                  <option>Mới nhất</option>
                  <option>Phổ biến</option>
                  <option>Đánh giá cao</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Tìm thấy <span className="font-medium">{filteredHeritages.length}</span> di sản văn hóa
              </p>
            </div>

            {/* Content View */}
            {view === 'grid' ? (
              <DiscoveryHeritageGrid heritages={filteredHeritages} />
            ) : (
              <DiscoveryGoogleMapsView heritages={filteredHeritages} />
            )}

            {/* Load More - only show in grid view */}
            {view === 'grid' && (
              <div className="text-center mt-8">
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Xem thêm di sản
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="sticky top-6">
              <DiscoveryUpcomingEvents />
              
              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-purple-600">500+</div>
                    <div className="text-xs text-gray-600">Di sản</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">50+</div>
                    <div className="text-xs text-gray-600">VR Tours</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">10K+</div>
                    <div className="text-xs text-gray-600">Người dùng</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">98%</div>
                    <div className="text-xs text-gray-600">Hài lòng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryPage;