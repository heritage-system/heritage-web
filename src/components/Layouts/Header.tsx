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
import VTFPLogo from "./VTFP_Logo.png";

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();

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
          <div className="flex items-center space-x-3 ml-12">  
            <div className="relative w-28 h-28">              
              {/* Logo */}
              <img
                src={VTFPLogo}
                alt="Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 gap-8">
          {[
            { label: 'Trang chủ', path: '/' },
            { label: 'Khám phá', path: '/DiscoveryPage' },
            { label: 'VR Tours', path: '/VRToursPage' },
            { label: 'Học tập', path: '/QuizzPage' },
            { label: 'Cộng đồng', path: '/CommunityPage' },     
            { label: 'Bài viết', path: '/contributions' }        
            
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`font-medium transition duration-300 ${
                isScrolled ? 'text-black hover:text-yellow-700' : 'text-black hover:text-yellow-600'
              }`}
            >
              {item.label}
            </Link>

          ))}
        </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 mr-12">
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
    className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-yellow-600 transition"
  >
    {avatarUrl && avatarUrl !== "undefined" ? (
    <img
      src={avatarUrl}
      alt="User"
      className="w-full h-full object-cover"
    />
  ) : (
    <User className="w-5 h-5 text-gray-600" />
  )}
  </button>
  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>

  {isDropdownOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
      {/* Header mini info */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        {avatarUrl && avatarUrl !== "undefined" ? (
          <img
            src={avatarUrl}
            alt={userName || "User"}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {userName || "Người dùng"}
          </p>
          {/* <p className="text-xs text-gray-500">Xem hồ sơ</p> */}
        </div>
      </div>

      {/* Menu */}
      <Link
        to="/view-profile"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
        onClick={() => setIsDropdownOpen(false)}
      >
        Hồ sơ
      </Link>
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
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
            <Link to="/" className="block text-black hover:text-purple-600">Trang chủ</Link>
            <Link to="/DiscoveryPage" className="block text-black hover:text-purple-600">Khám phá</Link>
            <Link to="/VRToursPage" className="block text-black hover:text-purple-600">VR Tours</Link>
            <Link to="/QuizzPage" className="block text-black hover:text-purple-600">Học tập</Link>
            <Link to="/CommunityPage" className="block text-black hover:text-purple-600">Cộng đồng</Link>
            {isLoggedIn ? (
              <>
                <Link to="/view-profile" className="block text-black hover:text-purple-600">Hồ sơ</Link>
                <button onClick={handleLogout} className="w-full text-left text-black hover:text-purple-600">Đăng xuất</button>
              </>
            ) : (
              <Link to="/login" className="block text-black hover:text-purple-600">Đăng nhập</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;