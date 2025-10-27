import { Play, Eye } from 'lucide-react';

interface VRToursHeroProps {
  onStartTour: () => void;
}

const VRToursHero: React.FC<VRToursHeroProps> = ({ onStartTour }) => {
  return (
     <section className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    {/* Tag VR */}
    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 rounded-full shadow-sm mb-8">
      <Eye className="w-5 h-5 text-white mr-2" />
      <span className="text-white font-medium">Trải nghiệm VR Tours</span>
    </div>

    {/* Heading */}
    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
      Khám phá{' '}
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900">
        Di sản
      </span>
      <br />
      <span className="text-gray-900">Qua thực tế ảo</span>
    </h1>

    {/* Description */}
    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
      Hành trình khám phá di sản văn hóa Việt Nam với công nghệ VR tiên tiến, 
      mang đến trải nghiệm sống động và chân thực
    </p>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button
        onClick={onStartTour}
        className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-transform flex items-center"
      >
        <Play className="w-5 h-5 mr-2" />
        Bắt đầu tour VR
      </button>

      <button className="bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold border border-yellow-300 hover:shadow-lg hover:scale-105 transition-all flex items-center">
        <Eye className="w-5 h-5 mr-2" />
        Xem demo
      </button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-gray-900">
      <div className="text-center">
        <div className="text-3xl font-bold text-yellow-600">50+</div>
        <div className="text-gray-600">Tours VR</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-red-700">100K+</div>
        <div className="text-gray-600">Lượt trải nghiệm</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-amber-900">360°</div>
        <div className="text-gray-600">Góc nhìn</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-orange-900">4K</div>
        <div className="text-gray-600">Chất lượng</div>
      </div>
    </div>
  </div>
</section>

  );
};

export default VRToursHero;
