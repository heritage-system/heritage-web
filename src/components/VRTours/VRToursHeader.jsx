import React, { useState, useEffect} from 'react';
import { 
  Search, 
  Menu,
  X,
  Bell,
  LogIn,
} from 'lucide-react';
import { Link } from 'react-router-dom';


// Header Component
const Header = ({ isMenuOpen, setIsMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                VTFP
              </h1>
              <p className="text-xs text-gray-500">Heritage Portal</p>
            </div>
          </div>

          {/* Navigation */}
         <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium">Trang chủ</Link>
            <Link to="/DiscoveryPage" className="text-gray-700 hover:text-purple-600 font-medium">Khám phá</Link>
            <Link to="/VRToursPage" className="text-gray-700 hover:text-purple-600 font-medium">VR Tours</Link>
            <Link to="/LearningPage" className="text-gray-700 hover:text-purple-600 font-medium">Học tập</Link>
            <Link to="/CommunityPage" className="text-gray-700 hover:text-purple-600 font-medium">Cộng đồng</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors relative">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-4">
            <Link to="/" className="block text-gray-700 hover:text-purple-600">Trang chủ</Link>
            <Link to="/explore" className="block text-gray-700 hover:text-purple-600">Khám phá</Link>
            <Link to="/vr-tours" className="block text-gray-700 hover:text-purple-600">VR Tours</Link>
            <Link to="/learning" className="block text-gray-700 hover:text-purple-600">Học tập</Link>
            <Link to="/community" className="block text-gray-700 hover:text-purple-600">Cộng đồng</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;