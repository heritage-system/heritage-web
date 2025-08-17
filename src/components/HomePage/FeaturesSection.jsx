import { 
  MapPin, 
  Users, 
  Camera, 
  BookOpen,
  Eye,
  Download,
} from 'lucide-react';

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: Eye,
      title: "VR 360° Immersive",
      description: "Trải nghiệm không gian văn hóa với công nghệ thực tế ảo tiên tiến",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Camera,
      title: "AI Recognition",
      description: "Nhận diện tự động các yếu tố văn hóa bằng trí tuệ nhân tạo",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Học tập tương tác với game và quiz về văn hóa dân gian",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Community Hub",
      description: "Kết nối cộng đồng yêu thích văn hóa truyền thống",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: MapPin,
      title: "Smart Map",
      description: "Bản đồ thông minh hiển thị các địa điểm di sản",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Xuất dữ liệu di sản dưới nhiều định dạng khác nhau",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tính năng{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nổi bật
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Công nghệ hiện đại kết hợp với di sản truyền thống
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;