import { MapPin, Play, Eye, Star } from 'lucide-react';
import { useState } from 'react';
import { PanoramaTourSearchResponse } from "../../types/panoramaTour";

interface Props {
  tour: PanoramaTourSearchResponse;
  onStartTour: (id: number) => void;
}

const VRTourCard: React.FC<Props> = ({ tour, onStartTour }) => {
  const [expanded, setExpanded] = useState(false);

  const formatLocation = (loc?: {
    province?: string;
    district?: string;
    ward?: string;
    addressDetail?: string;
  }) => {
    if (!loc) return "Không xác định";

    const parts = [
      loc.province,
      loc.district,
      loc.ward,
      loc.addressDetail,
    ].filter((x) => x && x.trim() !== "");

    return parts.length > 0 ? parts.join(", ") : "Không xác định";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      
      {/* Image */}
      <div className="relative">
        <img
          src={tour.thumbnailUrl}
          alt={tour.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* VR Badge */}
        <div className="absolute top-4 left-4">      
           {/* HERITAGE TAG */}
          <span className="
            bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white text-sm px-3 py-1 rounded-full 
            flex items-center gap-1
          ">
            <Eye className="w-4 h-4" />
             +{tour.numberOfScenes} Cảnh
          </span>
  
        </div>
        {/* Hot Badge */}
        {tour.premiumType === 1 && (
          <div className="absolute top-4 right-4">
           <span className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Premium
            </span>
          </div>
        )}
        {/* Play Button */}
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={() => onStartTour(tour.id)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all"
          >
            <Play className="w-5 h-5 text-yellow-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
          {tour.name}
        </h3>

        {/* Description with expand */}
        <div className="text-gray-600 text-sm">
          <p className={`${expanded ? "" : "line-clamp-2"} transition-all`}>
            {tour.description}
          </p>

          {/* Toggle button */}
          {tour.description.length > 80 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-yellow-700 mt-1 text-sm font-medium hover:underline"
            >
              {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
            </button>
          )}
        </div>

        {/* Location */}
        {tour.heritageLocations[0] && (
          <div className="flex items-center text-sm text-gray-500 mt-3">          
            <MapPin className="w-4 h-4 mr-1" /> {formatLocation(tour.heritageLocations[0])}                 
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex items-center justify-between mt-5">

         
          {/* Explore Button */}
          <button
            onClick={() => onStartTour(tour.id)}
            className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Khám phá
          </button>
        </div>
      </div>
    </div>
  );
};

export default VRTourCard;
