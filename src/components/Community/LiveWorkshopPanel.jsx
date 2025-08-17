import React, { useState } from 'react';
import { Video, Mic, Camera, Settings, Wifi } from 'lucide-react';

// Live Workshop Component
const LiveWorkshopPanel = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  return (
    <div className="bg-black rounded-xl overflow-hidden">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center">
        <div className="text-center text-white">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Workshop: Làm gốm truyền thống</h3>
          <p className="text-sm opacity-75">Nghệ nhân Nguyễn Văn A - Bát Tràng</p>
        </div>
        
        {/* Live indicator */}
        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
          LIVE - 45 người tham gia
        </div>
        
        {/* Quality indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
          <Wifi className="w-3 h-3 mr-1" />
          HD
        </div>
      </div>
      
      {/* Workshop controls */}
      <div className="bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'} text-white hover:bg-opacity-80 transition-colors`}
            >
              <Mic className={`w-4 h-4 ${isMuted ? 'line-through' : ''}`} />
            </button>
            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-2 rounded-full ${isCameraOff ? 'bg-red-600' : 'bg-gray-700'} text-white hover:bg-opacity-80 transition-colors`}
            >
              <Camera className={`w-4 h-4 ${isCameraOff ? 'line-through' : ''}`} />
            </button>
            <button className="p-2 rounded-full bg-gray-700 text-white hover:bg-opacity-80 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-white text-sm">15:30 / 60:00</div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Rời khỏi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveWorkshopPanel;