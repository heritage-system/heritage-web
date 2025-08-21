import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu,
  X,
  Bell,
  LogIn,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { isLoggedIn, logout: authLogout } = useAuth();

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    authLogout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white ${
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
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-500 bg-clip-text text-transparent">
                VTFP
              </h1>
              {/* <p className="text-xs text-white">Heritage Portal</p> */}
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 gap-8">
          {[
            { label: 'Trang chủ', path: '/' },
            { label: 'Khám phá', path: '/DiscoveryPage' },
            { label: 'VR Tours', path: '/VRToursPage' },
            { label: 'Học tập', path: '/QuizzPage' },
            { label: 'Cộng đồng', path: '/CommunityPage' }          
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`font-medium transition duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-yellow-700' : 'text-yellow-900 hover:text-yellow-600'
              }`}
            >
              {item.label}
            </Link>

          ))}
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
            {/* Login / Profile Dropdown */}
            {!isLoggedIn ? (
              <button
                onClick={() => navigate('/login')}
                 className="bg-gradient-to-r from-yellow-800 to-yellow-600 text-white px-6 py-2 rounded-xl 
             hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="bg-gray-100 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-gray-200 transition"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-xl overflow-hidden z-50">
                    <Link
                      to="/view-profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Hồ sơ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            
            {/* Mobile Menu Toggle */}
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
            <Link to="/DiscoveryPage" className="block text-gray-700 hover:text-purple-600">Khám phá</Link>
            <Link to="/VRToursPage" className="block text-gray-700 hover:text-purple-600">VR Tours</Link>
            <Link to="/QuizzPage" className="block text-gray-700 hover:text-purple-600">Học tập</Link>
            <Link to="/CommunityPage" className="block text-gray-700 hover:text-purple-600">Cộng đồng</Link>
            {isLoggedIn ? (
              <>
                <Link to="/view-profile" className="block text-gray-700 hover:text-purple-600">Hồ sơ</Link>
                <button onClick={handleLogout} className="w-full text-left text-gray-700 hover:text-purple-600">Đăng xuất</button>
              </>
            ) : (
              <Link to="/login" className="block text-gray-700 hover:text-purple-600">Đăng nhập</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;