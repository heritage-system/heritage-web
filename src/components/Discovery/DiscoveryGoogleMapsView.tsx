import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HeritageLocationResponse } from "../../types/heritageLocation";

// Fix icon khi bundle
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component để fit bounds và lưu map reference
const MapController: React.FC<{ 
  bounds: L.LatLngBoundsExpression; 
  mapRef: React.MutableRefObject<L.Map | null>; 
}> = ({ bounds, mapRef }) => {
  const map = useMap();
  
  useEffect(() => {
    mapRef.current = map;
    const timer = setTimeout(() => {
      map.fitBounds(bounds, {
        padding: [10, 10],
        maxZoom: 7
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [map, bounds, mapRef]);

  return null;
};

interface DiscoveryGoogleMapsViewProps {
  heritages: HeritageLocationResponse[];
}

// Giới hạn chính xác của Việt Nam (tọa độ thực tế)
const vietnamBounds: L.LatLngBoundsExpression = [
  [8.18, 102.14],   // Tây Nam: Cà Mau
  [23.39, 109.46],  // Đông Bắc: Hà Giang
];

const DiscoveryGoogleMapsView: React.FC<DiscoveryGoogleMapsViewProps> = ({ heritages }) => {
  const [showHeritageList, setShowHeritageList] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const list: HeritageLocationResponse[] = Array.isArray(heritages) ? heritages : [];

  const validHeritages = list.filter(heritage => {
    if (!Array.isArray(heritage.coordinates) || heritage.coordinates.length === 0) {
      return false;
    }
    return heritage.coordinates.some(coord => {
      const lat = coord.latitude;
      const lng = coord.longitude;
      return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat !== 0 &&
        lng !== 0 &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    });
  });

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="h-96 bg-gradient-to-br from-yellow-100 to-red-100 relative">
        <MapContainer
          bounds={vietnamBounds}
          boundsOptions={{ padding: [10, 10] }}
          zoom={7}
          minZoom={5}
          maxZoom={18}
          maxBounds={[
            [-90, -180],
            [90, 180]
          ]}
          maxBoundsViscosity={0.5}
          style={{ height: "384px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <MapController bounds={vietnamBounds} mapRef={mapRef} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
            tileSize={256}
            zoomOffset={0}
            detectRetina={true}
            subdomains={['a', 'b', 'c']}
          />
          
          {validHeritages.map((heritage) =>
            heritage.coordinates
              .filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude) && c.latitude !== 0 && c.longitude !== 0)
              .map((coord, idx) => (
                <Marker
                  key={`${heritage.heritageId}-${idx}`}
                  position={[coord.latitude, coord.longitude]}
                >
                  <Popup maxWidth={300} className="custom-popup">
                    <div className="p-2">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {heritage.name}
                      </h3>
                      {heritage.description && (
                        <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                          {heritage.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mb-2">
                        📍 {coord.latitude.toFixed(4)}, {coord.longitude.toFixed(4)}
                      </div>
                      {Array.isArray(heritage.locations) && heritage.locations.length > 0 && (
                        <div className="border-t pt-2">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Địa điểm:</p>
                          {heritage.locations.map((loc) => (
                            <p key={loc.id} className="text-xs text-gray-500">
                              📍 {loc.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))
          )}
        </MapContainer>

        {/* Nút hiển thị danh sách di sản */}
        <button
          onClick={() => setShowHeritageList(true)}
          className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 border border-gray-200 z-[1000]"
        >
          📋 Danh sách ({validHeritages.length})
        </button>

        {/* Nút reset view về Việt Nam */}
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.fitBounds(vietnamBounds, {
                padding: [10, 10],
                maxZoom: 7,
                animate: true,
                duration: 1
              });
            }
          }}
          className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 border border-gray-200 z-[1000]"
          title="Zoom về Việt Nam"
        >
          🇻🇳
        </button>
      </div>

      {/* Popup danh sách di sản */}
      {showHeritageList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                Danh sách Di sản trên bản đồ ({validHeritages.length})
              </h2>
              <button
                onClick={() => setShowHeritageList(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {validHeritages.length > 0 ? (
                <div className="space-y-4">
                  {validHeritages.map((heritage) => (
                    <div
                      key={heritage.heritageId}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {heritage.name}
                      </h3>
                      
                      {heritage.description && (
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          {heritage.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        {Array.isArray(heritage.locations) && heritage.locations.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{heritage.locations.map(loc => loc.name).join(", ")}</span>
                          </div>
                        )}
                        
                        {Array.isArray(heritage.coordinates) && heritage.coordinates.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>🗺️</span>
                            <span>{heritage.coordinates.length} điểm</span>
                            <span className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">
                              {heritage.coordinates.map(c => `${c.latitude.toFixed(2)},${c.longitude.toFixed(2)}`).join(' | ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Không có di sản nào được hiển thị trên bản đồ</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={() => setShowHeritageList(false)}
                className="w-full bg-gradient-to-r from-yellow-700 to-red-700 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-700 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Lễ hội</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-700 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Biểu diễn</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-700 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Thủ công</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📍 {validHeritages.length} di sản</span>
            <span>•</span>
            <span>🗺️ Markers: {validHeritages.reduce((acc, h) => acc + h.coordinates.length, 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryGoogleMapsView;
