import { MapPin, Eye, MessageSquare, Calendar, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeritageSearchResponse } from "../../types/heritage";

interface DiscoveryHeritageCardProps {
  heritage: HeritageSearchResponse;
}

const DiscoveryHeritageCard: React.FC<DiscoveryHeritageCardProps> = ({ heritage }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/heritagedetail/${heritage.id}`); // điều hướng chi tiết có id
  };

  // Lấy ảnh đầu tiên trong media (nếu có)
  const imageUrl = heritage.media?.[0]?.url || "https://placehold.co/600x400?text=No+Image";

  // Lấy địa điểm (nếu có)
  const locationName = heritage.heritageLocations?.[0]?.name || "Chưa rõ địa điểm";

  // Lấy thời gian từ occurrences (nếu có)
  const occurrence = heritage.heritageOccurrences?.[0];
  const dateLabel = occurrence
    ? `${occurrence.startDay}/${occurrence.startMonth} (${occurrence.calendarTypeName})`
    : "Không xác định";

  return (
    <div
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={heritage.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-yellow-50 transition-colors">
          <Heart className="w-4 h-4 text-gray-400 hover:text-red-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Date */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {dateLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
          {heritage.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {heritage.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            {locationName}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {heritage.isFeatured ? "Nổi bật" : "Thường"}
            </span>
            <span className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {heritage.heritageTags?.length || 0} tags
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryHeritageCard;
