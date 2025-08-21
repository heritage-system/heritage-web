import React, { useState, useEffect } from 'react';
import { X, Eye, Navigation, RotateCcw, Maximize2, Volume2 } from 'lucide-react';

type Scene = {
  title: string;
  description: string;
  image: string;
  duration: string;
};

type VRTourPopupProps = {
  onClose: () => void;
};

const VRTourPopup: React.FC<VRTourPopupProps> = ({ onClose }) => {
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);

  const scenes: Scene[] = [
    {
      title: "Phố Cổ Hội An",
      description: "Khám phá vẻ đẹp cổ kính của phố cổ Hội An với những ngôi nhà vàng đặc trưng",
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=400&fit=crop",
      duration: "3 phút"
    },
    {
      title: "Vịnh Hạ Long",
      description: "Ngắm nhìn những khối đá vôi kỳ thú và làn nước xanh biếc của Vịnh Hạ Long",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=400&fit=crop",
      duration: "4 phút"
    },
    {
      title: "Cung đình Huế",
      description: "Trải nghiệm không gian hoàng gia trong Đại Nội Huế cổ kính",
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=400&fit=crop",
      duration: "5 phút"
    }
  ];

  const nextScene = () => {
    setCurrentScene((prev) => (prev + 1) % scenes.length);
    setRotation((prev) => prev + 90);
  };

  const prevScene = () => {
    setCurrentScene((prev) => (prev - 1 + scenes.length) % scenes.length);
    setRotation((prev) => prev - 90);
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setRotation((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center">
            <Eye className="w-6 h-6 mr-3" />
            <h2 className="text-2xl font-bold">VR Tour - Di sản Việt Nam</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nội dung */}
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center bg-gray-900">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-20 h-20 border-4 border-red-700 border-b-transparent rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              ></div>
            </div>
            <p className="text-white mt-4 text-lg animate-pulse">Đang tải trải nghiệm VR...</p>
          </div>
        ) : (
          <>
            {/* VR Viewer */}
            <div className="relative h-96 bg-gray-900 overflow-hidden">
              <div
                className="absolute inset-0 transition-transform duration-500 ease-in-out"
                style={{ transform: `rotate(${rotation * 0.1}deg) scale(1.1)` }}
              >
                <img
                  src={scenes[currentScene].image}
                  alt={scenes[currentScene].title}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>

              {/* Thông tin scene */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{scenes[currentScene].title}</h3>
                <p className="text-sm opacity-90">{scenes[currentScene].description}</p>
              </div>

              {/* Nút điều hướng */}
              <button
                onClick={prevScene}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
              >
                <Navigation className="w-5 h-5 rotate-180" />
              </button>
              <button
                onClick={nextScene}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:shadow-lg px-4 py-2 rounded-lg transition-all">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset View</span>
                </button>
                <button className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:shadow-lg px-4 py-2 rounded-lg transition-all">
                  <Maximize2 className="w-4 h-4" />
                  <span>Toàn màn hình</span>
                </button>
                <button className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:shadow-lg px-4 py-2 rounded-lg transition-all">
                  <Volume2 className="w-4 h-4" />
                  <span>Âm thanh</span>
                </button>
              </div>
              <div className="text-sm text-gray-300">
                Thời lượng: {scenes[currentScene].duration}
              </div>
            </div>

            {/* Scene Selector */}
            <div className="bg-gray-100 p-4 flex space-x-4 overflow-x-auto">
              {scenes.map((scene, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentScene(index)}
                  className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentScene === index
                      ? 'border-yellow-600 shadow-lg'
                      : 'border-gray-300 hover:border-yellow-400'
                  }`}
                >
                  <img src={scene.image} alt={scene.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VRTourPopup;
