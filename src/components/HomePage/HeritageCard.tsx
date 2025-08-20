import { 
  MapPin, 
  Play, 
  Heart, 
  Star,
  Eye,
  Share2,
  TrendingUp,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { Heritage } from "../../types/heritage";


interface HeritageCardProps {
  item: Heritage;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
}

// Heritage Card Component
const HeritageCard: React.FC<HeritageCardProps> = ({ item, favorites, toggleFavorite }) => {
  return (
    <div className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
      <div className="relative overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => toggleFavorite(item.id)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              favorites.has(item.id) 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full hover:bg-white transition-all duration-300">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {item.hasVR && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>VR</span>
            </div>
          )}
          {item.trending && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Hot</span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="flex-1 bg-white/90 backdrop-blur-sm text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-white transition-all duration-300 flex items-center justify-center space-x-2">
            <Play className="w-4 h-4" />
            <span>Xem chi tiết</span>
          </button>
          {item.hasVR && (
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Trải nghiệm VR</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{item.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{item.rating}</span>
          </div>
        </div>

        <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
          {item.name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{item.location}</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{item.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{item.comments || 12}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritageCard;