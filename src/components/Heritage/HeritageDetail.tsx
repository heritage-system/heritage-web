import React, { useState } from 'react';
import { 
  MapPin, 
  Star, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Heart, 
  Share2, 
  Clock, 
  Users, 
  Camera,
  Play,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Navigation,
  Phone,
  Globe,
  Info
} from 'lucide-react';

const HeritageDetailView = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const heritage = {
    id: 1,
    title: "Lễ hội Chùa Hương",
    location: "Hà Nội",
    description: "Lễ hội lớn nhất miền Bắc, diễn ra tại chùa Hương với nhiều hoạt động tâm linh và văn hóa truyền thống.",
    rating: 4.9,
    totalRatings: 1247,
    views: "12.3K",
    comments: 23,
    date: "15/01/2025",
    hasVR: true,
    isHot: true,
    duration: "3-5 giờ",
    bestTime: "Tháng 2 - Tháng 4",
    visitors: "50,000+ người/năm",
    phone: "+84 24 3827 2345",
    website: "chuahuong.vn",
    address: "Xã Hương Sơn, Huyện Mỹ Đức, Hà Nội"
  };

  const images = [
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop"
  ];

  const reviews = [
    {
      id: 1,
      user: "Nguyễn Minh Anh",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      date: "2 ngày trước",
      content: "Lễ hội thực sự tuyệt vời! Không gian thiêng liêng, cảnh đẹp hùng vĩ. Đi cáp treo ngắm cảnh rất thú vị.",
      likes: 12,
      helpful: true
    },
    {
      id: 2,
      user: "Trần Văn Nam",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 4,
      date: "1 tuần trước",
      content: "Nên đi vào buổi sáng sớm để tránh đông người. Cảnh đẹp, không khí trong lành.",
      likes: 8,
      helpful: false
    },
    {
      id: 3,
      user: "Lê Thị Hoa",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      date: "2 tuần trước",
      content: "Trải nghiệm VR rất ấn tượng! Giúp hiểu rõ hơn về lịch sử và ý nghĩa của lễ hội.",
      likes: 15,
      helpful: true
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Quay lại
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full ${
                  isBookmarked ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                } hover:bg-purple-200 transition-colors`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative h-80 bg-gray-200 rounded-xl overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={heritage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {heritage.hasVR && (
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      VR Available
                    </span>
                  )}
                  {heritage.isHot && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Trending
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1}/{images.length}
                </div>
                
                {/* Navigation buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* VR/Video button */}
                <button className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Play className="w-4 h-4" />
                  <span>Xem VR</span>
                </button>
              </div>

              {/* Image thumbnails */}
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-purple-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title and Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{heritage.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {heritage.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {heritage.date}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    isLiked
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Đã thích' : 'Yêu thích'}</span>
                </button>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(Math.floor(heritage.rating))}
                  </div>
                  <span className="font-semibold text-lg">{heritage.rating}</span>
                  <span className="text-gray-500">({heritage.totalRatings} đánh giá)</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {heritage.views}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {heritage.comments}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Tổng quan' },
                  { id: 'reviews', label: 'Đánh giá' },
                  { id: 'photos', label: 'Hình ảnh' },
                  { id: 'tips', label: 'Mẹo du lịch' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Giới thiệu</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Lễ hội Chùa Hương là một trong những lễ hội lớn nhất và quan trọng nhất của miền Bắc Việt Nam. 
                      Diễn ra từ tháng Giêng đến tháng Ba âm lịch hàng năm, lễ hội thu hút hàng triệu lượt du khách 
                      trong và ngoài nước đến tham dự.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Nằm tại vùng núi Hương Tích thuộc xã Hương Sơn, huyện Mỹ Đức, Hà Nội, khu vực này được 
                      mệnh danh là "Nam thiên đệ nhất động" với nhiều hang động, chùa chiền linh thiêng và 
                      cảnh quan thiên nhiên hùng vĩ.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Điểm nổi bật</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Hành trình thuyền trên sông Yến đầy thơ mộng</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Cáp treo hiện đại với tầm nhìn toàn cảnh</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Động Hương Tích - hang động thiên nhiên kỳ vĩ</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Các ngôi chùa cổ kính với kiến trúc độc đáo</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Đánh giá từ du khách</h3>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Viết đánh giá
                    </button>
                  </div>

                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.avatar}
                          alt={review.user}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{review.user}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{review.content}</p>
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                              <ThumbsUp className="w-4 h-4" />
                              <span>Hữu ích ({review.likes})</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                              <Flag className="w-4 h-4" />
                              <span>Báo cáo</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'photos' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Thư viện ảnh</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tips' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Mẹo du lịch</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Thời gian tốt nhất</h4>
                      <p className="text-blue-800">Nên đi vào buổi sáng sớm (6-7h) để tránh đông người và thời tiết mát mẻ.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Trang phục</h4>
                      <p className="text-green-800">Mặc trang phục lịch sự khi vào chùa, mang giày dép thoải mái để leo núi.</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Chuẩn bị</h4>
                      <p className="text-orange-800">Mang theo nước uống, đồ ăn nhẹ và máy ảnh để ghi lại những khoảnh khắc đẹp.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Thời gian tham quan</p>
                    <p className="text-gray-600">{heritage.duration}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Thời điểm lý tưởng</p>
                    <p className="text-gray-600">{heritage.bestTime}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Lượng khách</p>
                    <p className="text-gray-600">{heritage.visitors}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{heritage.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{heritage.website}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{heritage.address}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                <Navigation className="w-4 h-4" />
                <span>Chỉ đường</span>
              </button>
            </div>

            {/* Related Heritage */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Có thể bạn quan tâm</h3>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1558618047-5c1c6d6e4b6c?w=80&h=60&fit=crop"
                    alt="Heritage"
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">Đền Đô</h4>
                    <p className="text-xs text-gray-600">Bắc Ninh</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">4.7</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=80&h=60&fit=crop"
                    alt="Heritage"
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">Làng cổ Đường Lâm</h4>
                    <p className="text-xs text-gray-600">Sơn Tây, Hà Nội</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">4.5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritageDetailView;