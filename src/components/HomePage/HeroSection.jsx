import { 
  Eye,
  PlayCircle,
  Sparkles,
} from 'lucide-react';


// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* ✅ Video Background */}
  <video
  className="absolute inset-0 w-full h-full object-cover z-0"
  autoPlay
  muted
  loop
  playsInline
>
  <source
    src="https://res.cloudinary.com/dlsgtrtdl/video/upload/v1751090106/XINCHAOVIETNAM_nmyncl.mp4"
    type="video/mp4"
  />
  Trình duyệt của bạn không hỗ trợ video.
</video>

  {/* ✅ Lớp phủ mờ nhẹ để text dễ đọc */}
  <div className="absolute inset-0 bg-black opacity-10 z-0" />


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="flex justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
              <span className="text-purple-600 font-medium flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Khám phá di sản Việt Nam</span>
              </span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Hành trình{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Văn hóa
            </span>
            <br />
            Thời đại số
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
            Trải nghiệm di sản văn hóa Việt Nam qua công nghệ VR, AI và cộng đồng sáng tạo
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
              <PlayCircle className="w-6 h-6" />
              <span className="font-semibold">Bắt đầu khám phá</span>
            </button>
            <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
              <Eye className="w-6 h-6" />
              <span className="font-semibold">Trải nghiệm VR</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 max-w-2xl mx-auto">
            {[
              { number: '500+', label: 'Di sản văn hóa' },
              { number: '50+', label: 'Tours VR' },
              { number: '10K+', label: 'Người dùng' },
              { number: '98%', label: 'Hài lòng' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-300 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    
  );
};

export default HeroSection;