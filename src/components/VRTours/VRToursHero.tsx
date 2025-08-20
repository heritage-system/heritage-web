import { Play, Eye } from 'lucide-react';


interface VRToursHeroProps {
  onStartTour: () => void;
}

const VRToursHero: React.FC<VRToursHeroProps> = ({ onStartTour }) => {
  return (
    <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-8">
          <Eye className="w-5 h-5 text-purple-600 mr-2" />
          <span className="text-purple-600 font-medium">Trải nghiệm VR Tours</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Khám phá <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Di sản</span>
          <br />
          <span className="text-gray-900">Qua thực tế ảo</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Hành trình khám phá di sản văn hóa Việt Nam với công nghệ VR tiên tiến, 
          mang đến trải nghiệm sống động và chân thực
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
         <button
            onClick={onStartTour}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center"
          >
            <Play className="w-5 h-5 mr-2" />
            Bắt đầu tour VR
          </button>
          <button className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border border-gray-200 hover:shadow-lg transition-all flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Xem demo
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">50+</div>
            <div className="text-gray-600">Tours VR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">100K+</div>
            <div className="text-gray-600">Lượt trải nghiệm</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">360°</div>
            <div className="text-gray-600">Góc nhìn</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">4K</div>
            <div className="text-gray-600">Chất lượng</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VRToursHero;