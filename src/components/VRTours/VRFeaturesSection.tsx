import { MapPin, Users, Star, Eye } from 'lucide-react';

const VRFeaturesSection = () => {
  const features = [
    {
      icon: Eye,
      title: "VR 360° Immersive",
      description: "Trải nghiệm không gian văn hóa với công nghệ thực tế ảo tiên tiến",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MapPin,
      title: "Định vị thông minh",
      description: "Khám phá từng góc khuất của di sản với bản đồ tương tác",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Trải nghiệm nhóm",
      description: "Tham gia cùng bạn bè trong không gian ảo chung",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Star,
      title: "AI Guide",
      description: "Hướng dẫn viên AI thông minh giải thích chi tiết từng di tích",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tính năng <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Đột phá</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Công nghệ hiện đại kết hợp với di sản truyền thống
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VRFeaturesSection;