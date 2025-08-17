import React, { useState } from 'react';
import { Users, Calendar, Clock, Heart, Share2, User, Star } from 'lucide-react';

// Workshop Card Component
const WorkshopCard = ({ workshop }) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinWorkshop = () => {
    setIsJoined(!isJoined);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={workshop.image}
          alt={workshop.title}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {workshop.isLive && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
              LIVE
            </span>
          )}
          {workshop.isVirtual && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              VR
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {workshop.duration}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
            {workshop.category}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            {workshop.participants}/{workshop.maxParticipants}
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors cursor-pointer">
          {workshop.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {workshop.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-1" />
            {workshop.instructor}
          </div>
          <div className="flex items-center text-sm text-yellow-500">
            <Star className="w-4 h-4 mr-1 fill-current" />
            {workshop.rating}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {workshop.date}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {workshop.time}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleJoinWorkshop}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isJoined
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isJoined ? '✓ Đã tham gia' : 'Tham gia'}
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;