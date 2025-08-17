import { Map } from 'lucide-react';

// Google Maps Component
const DiscoveryGoogleMapsView = ({ heritages }) => {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 relative">
        {/* Simulated Google Maps */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Google Maps Integration</p>
            <p className="text-sm text-gray-500">Hiển thị {heritages.length} địa điểm di sản</p>
          </div>
        </div>
        
        {/* Sample map markers */}
        <div className="absolute top-20 left-20 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-32 right-32 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute bottom-20 left-1/3 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        
        {/* Map controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2">
          <button className="block w-8 h-8 text-gray-600 hover:bg-gray-100 rounded mb-1">+</button>
          <button className="block w-8 h-8 text-gray-600 hover:bg-gray-100 rounded">-</button>
        </div>
      </div>
      
      {/* Map Legend */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Lễ hội</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Biểu diễn</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Thủ công</span>
            </div>
          </div>
          <button className="text-purple-600 text-sm hover:underline">
            Xem danh sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryGoogleMapsView;