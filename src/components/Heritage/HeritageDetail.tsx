import React, { useState } from 'react';
import { 
  MapPin, Calendar, Heart, Share2, Clock, Users, ChevronLeft, ChevronRight, Bookmark, Navigation, Phone
} from 'lucide-react';

interface Review {
  id: string | number;
  user: string;
  avatar: string;
  date: string;
  content: string;
  likes: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const HeritageDetailView: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([
    { id: generateId(), user: "Nguyễn Minh Anh", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face", date: "2 ngày trước", content: "Lễ hội tuyệt vời!", likes: 12 }
  ]);

  const heritage = {
    title: "Lễ hội Chùa Hương",
    location: "Hà Nội",
    date: "15/01/2025",
    duration: "3-5 giờ",
    visitors: "50,000+ người/năm",
    phone: "+84 24 3827 2345",
    address: "Xã Hương Sơn, Huyện Mỹ Đức, Hà Nội",
    hasVR: true,
    isHot: true
  };

  const images = [
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop"
  ];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newReview: Review = {
        id: generateId(),
        user: "Người dùng ẩn danh",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        date: "Vừa xong",
        content: newComment,
        likes: 0
      };
      setReviews(prev => [newReview, ...prev]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-5 h-5 mr-1" /> Quay lại
          </button>
          <div className="flex space-x-3">
            <button onClick={() => setIsBookmarked(!isBookmarked)} className={`p-2 rounded-full ${isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'} hover:bg-yellow-200 transition-colors`}>
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image carousel */}
          <div className="relative h-80 rounded-xl overflow-hidden">
            <img src={images[currentImageIndex]} alt={heritage.title} className="w-full h-full object-cover" />
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
            {heritage.hasVR && <span className="absolute top-4 left-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">VR Available</span>}
            {heritage.isHot && <span className="absolute top-4 left-32 bg-red-500 text-white px-3 py-1 rounded-full text-sm">Trending</span>}
          </div>

          {/* Title & Like */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{heritage.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {heritage.location}</div>
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {heritage.date}</div>
              </div>
            </div>
            <button onClick={() => setIsLiked(!isLiked)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${isLiked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Đã thích' : 'Yêu thích'}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex space-x-8">
              {['overview', 'reviews'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as 'overview' | 'reviews')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab === 'overview' ? 'Tổng quan' : 'Đánh giá'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl p-6">
            {activeTab === 'overview' && <p className="text-gray-700 leading-relaxed">Lễ hội Chùa Hương là một trong những lễ hội lớn nhất miền Bắc, diễn ra từ tháng Giêng đến tháng Ba âm lịch hàng năm, thu hút du khách trong và ngoài nước.</p>}

            {activeTab === 'reviews' && (
              <div>
                {/* Form bình luận */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>
                  <form onSubmit={handleSubmitComment}>
                    <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600" rows={4} placeholder="Nhập bình luận..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                    <button type="submit" className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors" disabled={!newComment.trim()}>Gửi bình luận</button>
                  </form>
                </div>

                {/* Danh sách bình luận */}
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <img src={r.avatar} alt={r.user} className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{r.user}</span>
                          <span className="text-sm text-gray-500">{r.date}</span>
                        </div>
                        <p className="text-gray-700 mt-1">{r.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Lượng khách</p>
                  <p className="text-gray-600">{heritage.visitors}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3"><Phone className="w-5 h-5 text-gray-400" /><span className="text-gray-700">{heritage.phone}</span></div>
              <div className="flex items-center space-x-3"><MapPin className="w-5 h-5 text-gray-400" /><span className="text-gray-700">{heritage.address}</span></div>
            </div>
            <button className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
              <Navigation className="w-4 h-4" />
              <span>Chỉ đường</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritageDetailView;
