import { MapPin, Clock, Users, Star, Play, Eye } from 'lucide-react';
import { Tour } from "../../types/tour";
interface Props {
  tour: Tour;
}

const VRTourCard: React.FC<Props> = ({ tour }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={tour.image}
          alt={tour.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            VR
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Hot
          </span>
        </div>
        <div className="absolute bottom-4 right-4">
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all">
            <Play className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {tour.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {tour.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {tour.location}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {tour.duration}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center text-yellow-400 mr-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-gray-900 ml-1">{tour.rating}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              {tour.participants}
            </div>
          </div>
          
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
            Khám phá
          </button>
        </div>
      </div>
    </div>
  );
};

export default VRTourCard;