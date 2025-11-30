import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu,
  X,
  Bell,
  LogIn,
  User,
  HelpCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import VTFPLogo from "./VTFP_Logo.png";
import HeaderTour from './HeaderTour'; 

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const navigate = useNavigate();

  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();

  // Định nghĩa các bước hướng dẫn
  const tourSteps = [
    {
      target: '[data-tour="logo"]',
      title: 'Chào mừng đến với VTFP!',
      description: 'Đây là logo của chúng tôi. Click vào đây để quay về trang chủ bất cứ lúc nào.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="nav-home"]',
      title: 'Trang chủ 🏠',
      description: 'Khám phá trang chủ với các nội dung nổi bật và tin tức mới nhất về di sản văn hóa Việt Nam.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="nav-discovery"]',
      title: 'Khám phá di sản',
      description: 'Khám phá các di sản văn hóa Việt Nam với thông tin chi tiết, hình ảnh đẹp và câu chuyện lịch sử đầy thú vị.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="nav-vr"]',
      title: 'Trải nghiệm VR 360°',
      description: 'Tham quan các di tích lịch sử bằng công nghệ thực tế ảo hiện đại, như thể bạn đang có mặt tại đó!',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="nav-ai"]',
      title: 'Trải nghiệm AI nhận diện ảnh',
      description: 'Khám phá các di sản văn hóa Việt Nam bằng những bức ảnh mà bạn muốn thông qua nhận diện AI',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="nav-quiz"]',
      title: 'Học tập qua trò chơi',
      description: 'Kiểm tra kiến thức của bạn về văn hóa Việt Nam qua các câu đố vui và thử thách thú vị.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="nav-community"]',
      title: 'Cộng đồng sôi động',
      description: 'Kết nối với những người yêu thích văn hóa, chia sẻ câu chuyện và trải nghiệm của bạn với cộng đồng.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="nav-contributions"]',
      title: 'Bài viết đóng góp',
      description: 'Đọc và chia sẻ các bài viết, câu chuyện về di sản văn hóa từ cộng đồng người dùng.',
      position: 'bottom' as const,
    },
    // {
    //   target: '[data-tour="search"]',
    //   title: 'Tìm kiếm nhanh',
    //   description: 'Tìm kiếm bất kỳ di sản, bài viết hay thông tin nào bạn muốn khám phá một cách nhanh chóng.',
    //   position: 'bottom' as const,
    // },
    {
      target: '[data-tour="notifications"]',
      title: 'Thông báo',
      description: 'Nhận thông báo về các hoạt động mới, bình luận và cập nhật quan trọng từ cộng đồng.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="login"]',
      title: 'Đăng nhập ngay!',
      description: 'Đăng nhập để lưu tiến trình học tập, tham gia cộng đồng và trải nghiệm đầy đủ các tính năng!',
      position: 'bottom' as const,
    },
  ];

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    authLogout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleStartTour = () => {
    setIsDropdownOpen(false); // Đóng dropdown nếu đang mở
    setIsMenuOpen(false); // Đóng mobile menu nếu đang mở
    setIsTourOpen(true);
  };

  const handleCloseTour = () => {
    setIsTourOpen(false);
    // Lưu vào localStorage để không hiện lại tự động
    localStorage.setItem('vtfp-tour-seen', 'true');
  };

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-start tour lần đầu (optional - có thể bỏ nếu không muốn)
  useEffect(() => {
    const tourSeen = localStorage.getItem('vtfp-tour-seen');
    if (!tourSeen) {
      // Delay 1.5s để user có thời gian nhìn trang
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white ${
        isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center space-x-3" data-tour="logo">  
              <Link to="/" className="relative w-28 h-28 hover:opacity-90 transition">
                <img
                  src={VTFPLogo}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8 gap-8">
              {[
                { label: 'Trang chủ', path: '/', tourId: 'nav-home' },
                { label: 'Khám phá', path: '/DiscoveryPage', tourId: 'nav-discovery' },
                { label: 'VR Tours', path: '/VRToursPage', tourId: 'nav-vr' },
                { label: 'Quét Ảnh', path: '/AIPredictLensPage', tourId: 'nav-ai' },
                { label: 'Trò chơi', path: '/QuizzPage', tourId: 'nav-quiz' },
                { label: 'Cộng đồng', path: '/CommunityPage', tourId: 'nav-community' },     
                { label: 'Bài viết', path: '/contributions', tourId: 'nav-contributions' }        
              ].map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  data-tour={item.tourId}
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
              {/* <button 
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors relative"
                data-tour="search"
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>
               */}
              <button 
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors relative"
                data-tour="notifications"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Help button - Mở tour */}
              <button 
                onClick={handleStartTour}
                className="p-2 text-gray-600 hover:text-yellow-600 transition-colors relative"
                title="Hướng dẫn sử dụng"
                aria-label="Hướng dẫn sử dụng"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* Login / Profile Dropdown */}
              {!isLoggedIn ? (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-yellow-800 to-yellow-600 text-white px-6 py-2 rounded-xl 
                    hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  data-tour="login"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={handleProfileClick}
                    className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-yellow-600 transition"
                    aria-label="Menu người dùng"
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

                      {/* Nút hướng dẫn trong dropdown */}
                      <button
                        onClick={handleStartTour}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Hướng dẫn sử dụng
                      </button>

                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-gray-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
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
              <Link 
                to="/" 
                className="block text-black hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link 
                to="/DiscoveryPage" 
                className="block text-black hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Khám phá
              </Link>
              <Link 
                to="/VRToursPage" 
                className="block text-black hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                VR Tours
              </Link>
              <Link 
                to="/AIPredictLensPage" 
                className="block text-black hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Quét ảnh
              </Link>
              <Link 
                to="/QuizzPage" 
                className="block text-black hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Học tập
              </Link>
              <Link 
                to="/CommunityPage" 
                className="block text-black hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Cộng đồng
              </Link>
              <Link 
                to="/contributions" 
                className="block text-black hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Bài viết
              </Link>
              
              {/* Nút hướng dẫn trong mobile menu */}
              <button 
                onClick={handleStartTour}
                className="w-full text-left text-black hover:text-purple-600 flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Hướng dẫn sử dụng
              </button>

              {isLoggedIn ? (
                <>
                  <Link 
                    to="/view-profile" 
                    className="block text-black hover:text-purple-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left text-black hover:text-purple-600"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="block text-black hover:text-purple-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Tour Component */}
      <HeaderTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        steps={tourSteps}
      />
    </>
  );
};

export default Header;