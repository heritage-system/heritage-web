import React, { useState, useEffect } from "react";
import { X, Eye, ChevronDown, ChevronUp, Star } from "lucide-react";
import { PanoramaTourDetailResponse } from "../../types/panoramaTour";
import { useNavigate } from "react-router-dom";
type Scene = {
  title: string;
  description: string;
  image: string;
  duration: string;
  viewerUrl: string;
};

type VRTourPopupProps = {
  tour: PanoramaTourDetailResponse;
  onClose: () => void;
  onHandleUnlock: (id: number) => void;
  unlockLoading: boolean
};

const VRTourPopup: React.FC<VRTourPopupProps> = ({ tour, onClose, onHandleUnlock, unlockLoading }) => {
  const navigate = useNavigate();
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  const scenes: Scene[] = [
    {
      title: "Phố Cổ Hội An",
      description:
        "Khám phá vẻ đẹp cổ kính của phố cổ Hội An với những ngôi nhà vàng đặc trưng",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=400&fit=crop",
      duration: "3 phút",
      viewerUrl:
        "https://www.theasys.io/viewer/KEMqGSMOpDkL2ixdx8zWrAqTSPNAHz",
    },
    {
      title: "Vịnh Hạ Long",
      description:
        "Ngắm nhìn những khối đá vôi kỳ thú và làn nước xanh biếc của Vịnh Hạ Long",
      image:
        "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=400&fit=crop",
      duration: "4 phút",
      viewerUrl:
        "https://www.theasys.io/viewer/KEMqGSMOpDkL2ixdx8zWrAqTSPNAHz",
    },
    {
      title: "Cung đình Huế",
      description:
        "Trải nghiệm không gian hoàng gia trong Đại Nội Huế cổ kính",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=400&fit=crop",
      duration: "5 phút",
      viewerUrl:
        "https://www.theasys.io/viewer/KEMqGSMOpDkL2ixdx8zWrAqTSPNAHz",
    },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timeout);
  }, []);

  const handleChangeScene = (index: number) => {
    setCurrentScene(index);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="
          bg-white rounded-2xl max-w-6xl w-full mx-2 
          overflow-hidden shadow-2xl relative 
          max-h-[95vh]   /* popup không bao giờ vượt quá màn */
          flex flex-col   /* cho VR + drawer thành 2 khu */
        ">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white p-2 flex justify-between items-center">
          <div className="flex items-center">
            <Eye className="w-6 h-6 mx-3" />
            <h2 className="text-lg font-bold">Trải nghiệm 360 - {tour.scenes[currentScene].sceneName}</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="h-[85vh] flex flex-col items-center justify-center bg-gray-900">
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
            <div className="relative h-[85vh] bg-gray-900 overflow-hidden flex-shrink-0 pb-[32px]">

  {/* PREMIUM LOCKED MODE */}
  {!tour.scenes[currentScene].panoramaUrl ? (
    <div className="w-full h-full relative">

      {/* Thumbnail */}
      <img
        src={tour.scenes[currentScene].sceneThumbnail}
        className="w-full h-full object-cover opacity-60"
      />

      {/* Overlay Lock */}
      <div className="
        absolute inset-0 bg-black/60 backdrop-blur-sm
        flex flex-col items-center justify-center 
        text-white
      ">
        {/* Lock Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-white drop-shadow-2xl"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <rect x="3" y="10" width="18" height="12" rx="2" ry="2" />
          <path d="M7 10V7a5 5 0 0110 0v3" />
          <circle cx="12" cy="16" r="2" />
        </svg>

        {/* Message */}
        <p className="text-lg font-semibold text-center my-2">
          Nội dung dành cho thành viên
        </p>

        {/* Remaining usage */}
      {tour.subscription ? (
        <p className="text-base font-medium text-yellow-300 mb-4">
          Số lượt mở còn lại: {tour.subscription.used}/{tour.subscription.total}
        </p>
      ) : (
        <p className="text-base font-medium text-yellow-300 mb-4">
          Bạn chưa có gói Premium
        </p>
      )}

      {/* Unlock Button */}
{tour.subscription ? (
  tour.subscription.used < tour.subscription.total ? (
    <button
      disabled={unlockLoading}
      className={`
        px-6 py-3 rounded-full shadow-lg text-white font-semibold
        bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700
        hover:opacity-90 transition-all
        ${unlockLoading ? "opacity-60 cursor-not-allowed animate-none" : "animate-bounce"}
      `}
      onClick={() => onHandleUnlock(tour.scenes[currentScene].id)}
    >
      {unlockLoading ? "Đang mở khóa..." : "Mở khóa để xem"}
    </button>
  ) : (
    <button
      className="
        bg-gray-700 px-6 py-3 rounded-full 
        text-gray-300 cursor-not-allowed
      "
      disabled
    >
      Đã hết lượt mở
    </button>
  )
) : (
  <button
    disabled={unlockLoading}
    className={`
      px-6 py-3 rounded-full shadow-lg text-white font-semibold
      bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700
      hover:opacity-90 transition-all
      ${unlockLoading ? "opacity-60 cursor-not-allowed animate-none" : "animate-bounce"}
    `}
    onClick={() => navigate("/premium-packages")}
  >
    {unlockLoading ? "Đang mở khóa..." : "Đăng kí gói Premium"}
  </button>
)}

      </div>
    </div>
  ) : (
    /* NORMAL MODE — SHOW IFRAME */
    <iframe
      key={currentScene}
      src={tour.scenes[currentScene].panoramaUrl}
      allowFullScreen
      frameBorder="0"
      scrolling="no"
      allow="fullscreen; vr; accelerometer; gyroscope; magnetometer"
      style={{ width: "100%", height: "100%" }}
    />
  )}

  {/* INFO OVERLAY */}
  <div className="absolute left-4 top-4 text-white max-w-[60%] z-20">
    <button
      onClick={() => setIsInfoOpen(!isInfoOpen)}
      className="mb-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm text-xs flex items-center gap-1"
    >
      {isInfoOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      {isInfoOpen ? "Thu gọn" : "Mở thông tin"}
    </button>

    {isInfoOpen && (
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3">
        <h3 className="text-lg font-semibold mb-1">
          {tour.scenes[currentScene].sceneName}
        </h3>
        <p className="text-xs opacity-90 line-clamp-2">
          {tour.scenes[currentScene].description}
        </p>
      </div>
    )}
  </div>
</div>

             </>
        )}

            {/* DRAWER — nằm NGOÀI VR, chỉ chồng lên khi mở */}
            <div className="
              absolute bottom-0 left-0 right-0 
              bg-black/70 backdrop-blur-lg text-white 
              transition-all duration-300
              z-30
              max-h-[31svh]   /* drawer không bao giờ chiếm quá 35% màn */
              overflow-hidden
              
              flex flex-col
              "      
              style={{height: isDrawerOpen ? "35vh" : "32px" }}
            >

             {/* Handle */}
              <div
                className="
                  w-full flex justify-center 
                  py-2    
                  cursor-pointer 
                  z-50
                  touch-manipulation   
                "
                onClick={() => setIsDrawerOpen((prev) => !prev)}
              >
                <div className="w-12 h-1 bg-white/60 rounded-full"></div>
              </div>


              {/* DRAWER CONTENT */}
              {isDrawerOpen && (
                <div className="px-4 pb-4">
                                  
                  <h3 className="text-sm font-semibold mb-3 opacity-90">
                    Các điểm tham quan
                  </h3>

                  {/* Scene List */}
                  <div 
                    className="
                      flex gap-4 overflow-x-auto overflow-y-hidden 
                      scrollbar-thin scrollbar-thumb-gray-500/40 scrollbar-track-transparent
                      py-1
                    "
                  >
                    {tour.scenes.map((scene, index) => {
                      const isLocked = scene.panoramaUrl ? false: true;

                      return (
                        <button
                          key={index}
                          onClick={() => handleChangeScene(index)}
                          //disabled={isLocked}
                          className={`
                            group relative flex-shrink-0 
                            w-60 rounded-xl overflow-hidden border-[3px] transition-all
                            ${currentScene === index 
                              ? "border-yellow-400 shadow-lg" 
                              : "border-white/30 hover:border-yellow-300"
                            }
                            
                          `}
                        >
                          {/* Thumbnail */}
                          <div className="relative w-full h-28 overflow-hidden">
                            <img
                              src={scene.sceneThumbnail}
                              className="w-full h-full object-cover"
                            />

                            {/* ⭐ PREMIUM STAR ICON (Lucide) */}
{scene.premiumType !== "FREE" && (
  <div className="absolute top-2 right-2 group">
    <div
      className="
        bg-black/60 backdrop-blur-sm
        p-1.5 rounded-full 
        shadow-lg border border-white/20
      "
    >
      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
    </div>

    {/* Tooltip */}
    <div
      className="
        absolute right-0 mt-2
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300

        bg-black/80 text-white text-xs 
        px-2 py-1 rounded-md shadow-lg
        whitespace-nowrap

        pointer-events-none
      "
    >
      Nội dung Premium
    </div>
  </div>
)}

  
                            {/* 🔒 LOCK OVERLAY */}
                            {isLocked && (
                              <div className="
                                absolute inset-0 bg-black/50 backdrop-blur-sm
                                flex items-center justify-center
                              ">
                                <div className="relative flex flex-col items-center">
                                  
                                  {/* LOCK ICON */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-white drop-shadow-xl"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.7}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <rect x="3" y="10" width="18" height="12" rx="2" ry="2" />
                                    <path d="M7 10V7a5 5 0 0110 0v3" />
                                    <circle cx="12" cy="16" r="2" />
                                  </svg>

                                  {/* Tooltip */}
                                  <div
                                    className="
                                      absolute top-full mt-2
                                      opacity-0 group-hover:opacity-100
                                      transition-opacity duration-300
                                      bg-black/80 text-white text-xs px-3 py-1 rounded-full
                                      whitespace-nowrap pointer-events-none
                                    "
                                  >
                                    Nội dung dành cho hội viên
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <div className="bg-black/40 text-center text-xs py-1 px-2 line-clamp-1">
                            {scene.sceneName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>         
      </div>
    </div>
  );
};

export default VRTourPopup;
