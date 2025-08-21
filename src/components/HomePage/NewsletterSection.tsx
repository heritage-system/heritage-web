import { 
  Mail,
} from 'lucide-react';

// Newsletter Section
const NewsletterSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-900">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Đăng ký nhận tin
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Cập nhật những thông tin mới nhất về di sản văn hóa và các tính năng mới
          </p>
          
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 px-6 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-yellow-300 outline-none bg-yellow-100"
            />
            <button className="bg-gradient-to-r from-yellow-600 to-red-700 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Đăng ký</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
