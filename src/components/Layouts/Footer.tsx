import { 
  MapPin, 
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
} from 'lucide-react';

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-700 to-red-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                  VTFP
                </h3>
                <p className="text-xs text-gray-400">Heritage Portal</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Nền tảng số bảo tồn và truyền bá di sản văn hóa truyền thống Việt Nam
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-6 h-6 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
              <Twitter className="w-6 h-6 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
              <Instagram className="w-6 h-6 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
              <Youtube className="w-6 h-6 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="/Discovery" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Khám phá
                </a>
              </li>
              <li>
                <a href="/VRToursPage" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  VR Tours
                </a>
              </li>
              <li>
                <a href="/QuizzPage" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Trò chơi
                </a>
              </li>
              <li>
                <a href="/CommunityPage" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Cộng đồng
                </a>
              </li>
              <li>
                <a href="/contributions" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Bài viết
                </a>
              </li>            
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              {['Hỏi đáp', 'Điều khoản', 'Chính sách riêng tư', 'Liên hệ'].map((item, index) => (
                <li key={index}>
                  <a href="/term" className="text-gray-400 hover:text-yellow-500 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Đà Nẵng, Việt Nam</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>+84 077 546 7093</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>vtfp.portal@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
