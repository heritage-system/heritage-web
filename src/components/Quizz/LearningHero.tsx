
import { 
  Play, 
  Eye, 
  Gamepad2,
} from 'lucide-react';

// Main Components
const LearningHero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-8">
          <Gamepad2 className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-blue-600 font-medium">Học tập tương tác thông minh</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Khám phá <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Di sản</span>
          <br />
          <span className="text-gray-900">Qua trò chơi thú vị</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Tham gia các quiz tương tác, mini-games và trải nghiệm AR/VR để hiểu sâu hơn về 
          di sản văn hóa Việt Nam một cách thú vị và sáng tạo
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center transform hover:scale-105">
            <Play className="w-5 h-5 mr-2" />
            Bắt đầu chơi ngay
          </button>
          <button className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border border-gray-200 hover:shadow-lg transition-all flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Xem demo tương tác
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">50+</div>
            <div className="text-gray-600">Quiz thú vị</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">25K+</div>
            <div className="text-gray-600">Người chơi</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">100K+</div>
            <div className="text-gray-600">Lượt chơi</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">4.8★</div>
            <div className="text-gray-600">Đánh giá</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningHero;