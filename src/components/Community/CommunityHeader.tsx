import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// Header Component
const CommunityHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-xl text-purple-600">VTFP</span>
            <span className="text-gray-600 text-sm">Heritage Portal</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium">Trang chủ</Link>
            <Link to="/DiscoveryPage" className="text-gray-700 hover:text-purple-600 font-medium">Khám phá</Link>
            <Link to="/VRToursPage" className="text-gray-700 hover:text-purple-600 font-medium">VR Tours</Link>
            <Link to="/LearningPage" className="text-gray-700 hover:text-purple-600 font-medium">Học tập</Link>
            <Link to="/CommunityPage" className="text-gray-700 hover:text-purple-600 font-medium">Cộng đồng</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CommunityHeader;