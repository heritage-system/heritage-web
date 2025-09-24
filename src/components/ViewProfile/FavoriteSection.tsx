import React from 'react';
import FavoriteHeritageList from "../Auth/FavoriteHeritageList";
import { 
  User, 
  Heart, 
  Calendar, 
  FileText, 
  Send, 
  Users 
} from 'lucide-react';

const FavoriteSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-black mb-3 flex items-center gap-3">
            <Heart className="w-10 h-10 text-red-500" />
            Di sản yêu thích
          </h2>
          <p className="text-gray-700 text-lg">Những di sản văn hóa mà bạn đã yêu thích</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-yellow-300/50 shadow-lg">
          <div className="text-3xl font-bold text-yellow-700">12</div>
          <div className="text-sm text-yellow-600 font-medium">Di sản yêu thích</div>
        </div>
      </div>
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-yellow-200">
        <FavoriteHeritageList />
      </div>
    </div>
  );
};

export default FavoriteSection;