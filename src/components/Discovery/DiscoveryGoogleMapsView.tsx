import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HeritageSearchResponse, HeritageLocation, HeritageSearchRequest } from "../../types/heritage";

// Fix icon khi bundle
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapController: React.FC<{ 
  bounds: L.LatLngBoundsExpression; 
  mapRef: React.MutableRefObject<L.Map | null>;
}> = ({ bounds, mapRef }) => {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
};

interface DiscoveryGoogleMapsViewProps {
  heritages: HeritageSearchResponse[];
  onFiltersChange: (changes: Partial<HeritageSearchRequest>, resetPage?: boolean) => void;
  isLoading?: boolean;
}

let didFitBoundsGlobal = false;
const DiscoveryGoogleMapsView: React.FC<DiscoveryGoogleMapsViewProps> = ({
  heritages,
  onFiltersChange,
  isLoading
}) => {
  const [currentBounds, setCurrentBounds] = useState<L.LatLngBoundsExpression>([
    [8.18, 102.14],
    [23.39, 109.46],
  ]);

  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(false);

  // State vị trí người dùng
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [isWaitingForAPI, setIsWaitingForAPI] = useState(false);

  // Popup danh sách
  const [showHeritageList, setShowHeritageList] = useState(false);

  // Danh sách di sản hợp lệ
  const validHeritages = heritages.filter(h =>
    Array.isArray(h.heritageLocations) &&
    h.heritageLocations.some(c => Number.isFinite(c.latitude) && Number.isFinite(c.longitude))
  );

  const [expandedHeritageIds, setExpandedHeritageIds] = useState<number[]>([]);
  const toggleExpand = (id: number) => {
    setExpandedHeritageIds(prev =>
      prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]
    );
  };

  const formatLocation = (loc: HeritageLocation) =>
    [loc.province, loc.district, loc.ward, loc.addressDetail].filter(Boolean).join(", ");
/** 1️⃣ Nút "Vị trí + API + Zoom" */
const handleLocateAndCallAPI = async () => {
  if (!navigator.geolocation) {
    alert("Trình duyệt không hỗ trợ định vị GPS.");
    return;
  }

  setIsWaitingForAPI(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latlng = new L.LatLng(position.coords.latitude, position.coords.longitude);

      try {
        // 1️⃣ Lưu vị trí người dùng ngay
        setUserLocation(latlng);

        // 2️⃣ Gọi API với vị trí vừa lấy
        await onFiltersChange({ lat: latlng.lat, lng: latlng.lng, radius: 20 }, true);

        // 3️⃣ Zoom về vị trí hiện tại
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.setView(latlng, 13);
          }
        }, 5000);

      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      } finally {
        setIsWaitingForAPI(false);
      }
    },
    (err) => {
      console.error(err);
      alert("Không thể lấy vị trí. Vui lòng cho phép quyền truy cập GPS.");
      setIsWaitingForAPI(false);
    }
  );
};


  // Fit bounds lần đầu khi map ready
  useEffect(() => {
    if (!didFitBoundsGlobal && mapReady && mapRef.current) {
      mapRef.current.fitBounds(currentBounds, { padding: [10, 10], maxZoom: 15 });
      didFitBoundsGlobal = true;
    }
  }, [mapReady]);

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="h-96 bg-gradient-to-br from-yellow-100 to-red-100 relative">
        <MapContainer
          bounds={currentBounds}
          boundsOptions={{ padding: [10, 10] }}
          zoom={8}
          minZoom={5}
          maxZoom={18}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={0.5}
          style={{ height: "384px", width: "100%" }}
          scrollWheelZoom
          whenReady={() => setMapReady(true)}
        >
          <MapController bounds={currentBounds} mapRef={mapRef} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
            eventHandlers={{ load: () => setTilesLoaded(true) }}
          />

          {/* Markers di sản */}
          {validHeritages.map(h =>
            h.heritageLocations.map(loc => (
              <Marker key={`${h.id}-${loc.id}`} position={[loc.latitude, loc.longitude]}>
                <Popup>
                  <b>{h.name}</b><br />
                  {formatLocation(loc)}
                </Popup>
              </Marker>
            ))
          )}

          {/* Marker vị trí người dùng */}
          {mapReady && userLocation && (
            <Marker position={userLocation}>
              <Popup>Bạn đang ở đây 📍</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Nút danh sách */}
        <button
          onClick={() => setShowHeritageList(true)}
          className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 border border-gray-200 z-[1000]"
        >
          Danh sách ({validHeritages.length})
        </button>

        {/* Nút reset view */}
        <button
          onClick={() => {
            setUserLocation(null);
            setIsWaitingForAPI(false);
            mapRef.current?.fitBounds(currentBounds, { padding: [10, 10], maxZoom: 7 });
          }}
          className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 border border-gray-200 z-[1000]"
          title="Zoom về Việt Nam"
        >
          🇻🇳
        </button>

        {/* Nút lấy vị trí */}
{/* Nút gộp: lấy vị trí + gọi API + zoom */}
<button
  onClick={handleLocateAndCallAPI}
  disabled={isWaitingForAPI}
  className={`absolute bottom-4 right-4 bg-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-xl hover:bg-gray-100 border z-[1000] ${
    isWaitingForAPI ? 'opacity-50 cursor-not-allowed' : ''
  }`}
  title={isWaitingForAPI ? "Đang tải..." : "Vị trí + API + Zoom"}
>
  {isWaitingForAPI ? "⏳" : "📍"}
</button>

      </div>

      {/* Popup danh sách */}
      {showHeritageList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                Danh sách Di sản ({validHeritages.length})
              </h2>
              <button
                onClick={() => setShowHeritageList(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
              {validHeritages.length > 0 ? validHeritages.map(h => (
                <div key={h.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-2">{h.name}</h3>
                  {h.description && (
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{h.description}</p>
                  )}
                  {h.heritageLocations.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {(expandedHeritageIds.includes(h.id) 
                        ? h.heritageLocations 
                        : h.heritageLocations.slice(0, 1)
                      ).map((loc, idx) => (
                        <p key={idx} className="mb-1">
                          📍 {formatLocation(loc)}
                        </p>
                      ))}
                      {h.heritageLocations.length > 1 && (
                        <button
                          className="text-blue-600 text-xs font-medium hover:underline"
                          onClick={() => toggleExpand(h.id)}
                        >
                          {expandedHeritageIds.includes(h.id) ? "Thu gọn" : "Xem thêm..."}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )) : <p className="text-center text-gray-500 py-8">Không có di sản nào hiển thị</p>}
            </div>
            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={() => setShowHeritageList(false)}
                className="w-full bg-gradient-to-r from-yellow-700 to-red-700 text-white py-2 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryGoogleMapsView;
