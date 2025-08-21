import React, { useState } from 'react';
import { Video, Mic, Camera, Settings, Wifi } from 'lucide-react';

// Live Workshop Component
const LiveWorkshopPanel = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  return (
    <div className="bg-gradient-to-br from-yellow-600 via-red-700 to-amber-900 rounded-xl overflow-hidden shadow-lg">
      <div className="relative aspect-video flex items-center justify-center bg-white">
        <div className="text-center text-white">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-70" />
          <h3 className="text-lg font-semibold mb-2">Workshop: Làm gốm truyền thống</h3>
          <p className="text-sm opacity-90">Nghệ nhân Nguyễn Văn A - Bát Tràng</p>
        </div>
        
        {/* Live indicator */}
        <div className="absolute top-4 left-4 bg-red-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
          LIVE - 45 người tham gia
        </div>
        
        {/* Quality indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-40 text-white px-2 py-1 rounded text-xs flex items-center">
          <Wifi className="w-3 h-3 mr-1" />
          HD
        </div>
      </div>
      
      {/* Workshop controls */}
      <div className="bg-orange-950 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full ${isMuted ? 'bg-red-700' : 'bg-amber-700'} text-white hover:bg-opacity-80 transition-colors`}
            >
              <Mic className={`w-4 h-4 ${isMuted ? 'line-through' : ''}`} />
            </button>
            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-2 rounded-full ${isCameraOff ? 'bg-red-700' : 'bg-amber-700'} text-white hover:bg-opacity-80 transition-colors`}
            >
              <Camera className={`w-4 h-4 ${isCameraOff ? 'line-through' : ''}`} />
            </button>
            <button className="p-2 rounded-full bg-amber-600 text-white hover:bg-opacity-80 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-white text-sm">15:30 / 60:00</div>
            <button className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors">
              Rời khỏi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveWorkshopPanel;
