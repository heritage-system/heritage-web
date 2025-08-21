import { MapPin, Star, Eye, MessageSquare, Calendar, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Thêm dòng này
import { Heritage } from "../../types/heritage";

interface DiscoveryHeritageCardProps {
  heritage: Heritage;
}

const DiscoveryHeritageCard: React.FC<DiscoveryHeritageCardProps> = ({ heritage }) => {
  const navigate = useNavigate(); // Thêm dòng này

const handleCardClick = () => {
    navigate('/heritagedetail'); 
  };

  return (
   <div
  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow group cursor-pointer"
  onClick={handleCardClick}
>
  <div className="relative">
    <img
      src={heritage.image}
      alt={heritage.name}
      className="w-full h-48 object-cover rounded-t-xl"
    />
    <div className="absolute top-3 left-3 flex gap-2">
      {heritage.hasVR && (
        <span className="bg-yellow-700 text-white px-2 py-1 rounded-full text-xs font-medium">
          VR
        </span>
      )}
      {heritage.isHot && (
        <span className="bg-red-700 text-white px-2 py-1 rounded-full text-xs font-medium">
          Hot
        </span>
      )}
    </div>
    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-yellow-50 transition-colors">
      <Heart className="w-4 h-4 text-gray-400 hover:text-red-700" />
    </button>
  </div>

  <div className="p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-500 flex items-center">
        <Calendar className="w-3 h-3 mr-1" />
        {heritage.date}
      </span>
      <div className="flex items-center">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-sm font-medium text-gray-700 ml-1">{heritage.rating}</span>
      </div>
    </div>

    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
      {heritage.name}
    </h3>

    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
      {heritage.description}
    </p>

    <div className="flex items-center justify-between">
      <div className="flex items-center text-sm text-gray-500">
        <MapPin className="w-4 h-4 mr-1" />
        {heritage.location}
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span className="flex items-center">
          <Eye className="w-4 h-4 mr-1" />
          {heritage.views}
        </span>
        <span className="flex items-center">
          <MessageSquare className="w-4 h-4 mr-1" />
          {heritage.comments}
        </span>
      </div>
    </div>
  </div>
</div>
  );
};

export default DiscoveryHeritageCard;