import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HeritageLocationResponse } from "../../types/heritageLocation";

// Fix icon lỗi khi dùng leaflet với webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface DiscoveryGoogleMapsViewProps {
  heritages: HeritageLocationResponse[];
}

const defaultCenter: [number, number] = [16.047079, 108.206230];

const DiscoveryGoogleMapsView: React.FC<DiscoveryGoogleMapsViewProps> = ({ heritages }) => {
  const firstValidHeritage = heritages.find(h => h.coordinates && h.coordinates.length > 0);
  const center: [number, number] = firstValidHeritage
    ? [firstValidHeritage.coordinates[0].latitude, firstValidHeritage.coordinates[0].longitude]
    : defaultCenter;

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="h-96 bg-gradient-to-br from-yellow-100 to-red-100 relative">
        <MapContainer
          center={center}
          zoom={7}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "0.75rem",
            zIndex: 1,
          }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {heritages.map((heritage) => 
            heritage.coordinates.map((coord, idx) => (
              <Marker 
                key={`${heritage.heritageId}-${idx}`} 
                position={[coord.latitude, coord.longitude]}
              >
                <Popup>
                  <div>
                    <strong>{heritage.name}</strong>
                    <p>{heritage.description}</p>
                    {heritage.locations.map(loc => (
                      <p key={loc.locationId} className="text-gray-500">{loc.name}</p>
                    ))}
                  </div>
                </Popup>
              </Marker>
            ))
          )}
        </MapContainer>

        {/* Map controls UI */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 z-[1000]">
          <button className="block w-8 h-8 text-gray-600 hover:bg-gray-100 rounded mb-1">+</button>
          <button className="block w-8 h-8 text-gray-600 hover:bg-gray-100 rounded">-</button>
        </div>
      </div>
      {/* Map Legend */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
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
          <button className="text-purple-600 text-sm hover:underline">
            Xem danh sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryGoogleMapsView;