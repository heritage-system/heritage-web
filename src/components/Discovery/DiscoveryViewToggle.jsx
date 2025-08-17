import {  Map} from 'lucide-react';

// View Toggle Component
const DiscoveryViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'grid' 
            ? 'bg-white text-purple-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Lưới
      </button>
      <button
        onClick={() => onViewChange('map')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'map' 
            ? 'bg-white text-purple-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Map className="w-4 h-4 inline mr-1" />
        Bản đồ
      </button>
    </div>
  );
};

export default DiscoveryViewToggle;