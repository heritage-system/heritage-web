import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu,
  X,
  Bell,
  LogIn,
  User,
  HelpCircle,
  Award
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserPoint } from '../../services/userService'; // Import hàm getUserPoint
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
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
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
      title: 'Trang chủ',
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
    {
      target: '[data-tour="nav-premium"]',
      title: 'Các gói thành viên',
      description: 'Nâng cấp lên gói thành viên để được sử dụng các tính năng thú vị hơn',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="login"]',
      title: 'Đăng nhập ngay!',
      description: 'Đăng nhập để lưu tiến trình học tập, tham gia cộng đồng và trải nghiệm đầy đủ các tính năng!',
      position: 'bottom' as const,
    },
  ];

  // Hàm lấy điểm người dùng
  const fetchUserPoints = async () => {
    if (!isLoggedIn) return;
    
    setIsLoadingPoints(true);
    try {
      const response = await getUserPoint();
      if (response.code === 200 && response.result) {
        setUserPoints(response.result.totalPoints || 0);
      }
    } catch (error) {
      console.error('Lỗi khi lấy điểm người dùng:', error);
      setUserPoints(null);
    } finally {
      setIsLoadingPoints(false);
    }
  };

  const handleProfileClick = async () => {
    setIsDropdownOpen(!isDropdownOpen);
    
    // Nếu đang mở dropdown và chưa có điểm, gọi API lấy điểm
    if (!isDropdownOpen && isLoggedIn) {
      await fetchUserPoints();
    }
  };

  const handleLogout = () => {
    authLogout();
    setIsDropdownOpen(false);
    setUserPoints(null); // Reset điểm khi đăng xuất
    navigate('/');
  };

  const handleStartTour = () => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    setIsTourOpen(true);
  };

  const handleCloseTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('vtfp-tour-seen', 'true');
  };

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-start tour lần đầu
  useEffect(() => {
    const tourSeen = localStorage.getItem('vtfp-tour-seen');
    if (!tourSeen) {
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
                { label: 'Trò chơi', path: '/QuizzPage', tourId: 'nav-quiz' },
                { label: 'Cộng đồng', path: '/CommunityPage', tourId: 'nav-community' },     
                { label: 'Bài viết', path: '/contributions', tourId: 'nav-contributions' }, 
                { label: 'Gói Premium', path: '/premium-packages', tourId: 'nav-premium' }      
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
              {/* Help button */}
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
                    <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                      {/* Header mini info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {avatarUrl && avatarUrl !== "undefined" ? (
                            <img
                              src={avatarUrl}
                              alt={userName || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                              {userName || "Người dùng"}
                            </p>
                          </div>
                        </div>
                        
                        {/* Hiển thị điểm */}
<div className="mt-3 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg px-2 py-2">

  <div className="flex items-center gap-2">
    {/* <Award className="w-4 h-4 text-yellow-600" /> */}
    {/* Icon dấu hỏi + tooltip */}
      <div className="relative group">
        <HelpCircle className="w-4 h-4 text-yellow-600 cursor-pointer" />

        {/* Tooltip */}
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg px-3 py-2
                          text-xs text-gray-700 border border-gray-200 opacity-0 group-hover:opacity-100
                          pointer-events-none transition-opacity duration-150 z-20">
            <p className="font-semibold text-gray-900">Điểm linh hội</p>
            <ul className="list-disc ml-4 mt-1">
              <li>Nhận khi đăng bài hoặc thắng người khác trong trò chơi.</li>
              <li>Dùng để mở khóa quyền lợi cao hơn.</li>        
            </ul>
          </div>
        </div>
        {/* Chữ gradient từ vàng đến đỏ */}
    
        <span className="text-xs font-bold text-yellow-700 ">
          Điểm Linh Hội:
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold bg-gradient-to-r from-yellow-700 to-red-700 bg-clip-text text-transparent">
          {isLoadingPoints ? (
            <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse"></span>
          ) : (
            userPoints !== null ? userPoints.toLocaleString() : '---'
          )}
        </span>
      </div>
</div>

                      </div>

                      {/* Menu */}
                      <div className="py-1">
                        <Link
                          to="/view-profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Hồ sơ
                        </Link>                                            
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100 mt-1"
                        >
                          Đăng xuất
                        </button>
                         <button
                          onClick={handleStartTour}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          <HelpCircle className="w-4 h-4" />
                          Hướng dẫn sử dụng
                        </button>

                      </div>
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
              {/* Hiển thị điểm trong mobile menu nếu đã login */}
              {isLoggedIn && (
                <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Điểm của bạn</span>
                  </div>
                  <span className="text-base font-bold text-yellow-600">
                    {userPoints !== null ? userPoints.toLocaleString() : '---'}
                  </span>
                </div>
              )}

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
              <Link 
                to="/premium-packages" 
                className="block text-black hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Gói Premium
              </Link>
              
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