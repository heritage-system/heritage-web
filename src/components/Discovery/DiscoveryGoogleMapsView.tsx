import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap ,Circle} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HeritageSearchResponse, HeritageLocation, HeritageSearchRequest } from "../../types/heritage";
import { mapViewStorage } from "../../utils/tokenStorage";
import DiscoveryHeritageCard from "./DiscoveryHeritageCard";
import { MapPin } from 'lucide-react';
import Spinner from "../../components/Layouts/LoadingLayouts/Spinner";
import MarkerClusterGroup from "react-leaflet-markercluster";
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-markercluster/styles'
interface DiscoveryGoogleMapsViewProps {
  heritages: HeritageSearchResponse[];
  userLocation?: { lat: number; lng: number } | null;
  onFiltersChange?: (changes: Partial<HeritageSearchRequest>) => void;
  loading?: boolean;
}

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const MapController: React.FC<{
  mapRef: React.MutableRefObject<L.Map | null>;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  activeMarkerId: string | null;
}> = ({ mapRef, onBoundsChange, activeMarkerId }) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;

    let timeout: NodeJS.Timeout;
    const handleMoveEnd = () => {
      if (activeMarkerId) return; // popup đang mở → skip update
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const bounds = map.getBounds();
        onBoundsChange(bounds);
      }, 150); // debounce 150ms
    };

    map.on("moveend", handleMoveEnd);
    return () => {
      clearTimeout(timeout);
      map.off("moveend", handleMoveEnd);
    };
  }, [map, mapRef, onBoundsChange, activeMarkerId]);

  return null;
};

const DiscoveryGoogleMapsView: React.FC<DiscoveryGoogleMapsViewProps> = ({
  heritages,
  userLocation: userLocationFromProps,
  onFiltersChange,
  loading
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [visibleBounds, setVisibleBounds] = useState<L.LatLngBounds | null>(null);
  const cachedRef = useRef<HeritageSearchResponse[]>([]);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Cập nhật cache nếu heritages thay đổi
  useEffect(() => {
    if (JSON.stringify(cachedRef.current) !== JSON.stringify(heritages)) {
      cachedRef.current = heritages;
      if (mapRef.current) setVisibleBounds(mapRef.current.getBounds());
    }
  }, [heritages]);

  const initialView = (() => {
    const saved = mapViewStorage.load();
    if (saved) return saved;
    if (userLocationFromProps) return { center: [userLocationFromProps.lat, userLocationFromProps.lng] as L.LatLngTuple, zoom: 8 };
    return { center: [14.0583, 108.2772] as L.LatLngTuple, zoom: 6 };
  })();

  const userLatLng = userLocationFromProps ? new L.LatLng(userLocationFromProps.lat, userLocationFromProps.lng) : null;

  const filteredHeritages = cachedRef.current.filter(h =>
    h.heritageLocations.some(loc => visibleBounds ? visibleBounds.contains([loc.latitude, loc.longitude]) : true)
  );

  const formatLocation = (loc: HeritageLocation) =>
    [loc.province, loc.district, loc.ward, loc.addressDetail].filter(Boolean).join(", ");

  const [showHeritageList, setShowHeritageList] = useState(false);
  const [expandedHeritageIds, setExpandedHeritageIds] = useState<number[]>([]);
  const toggleExpand = (id: number) =>
    setExpandedHeritageIds(prev => prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]);

  

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className=" z-0 h-96 relative">
        <MapContainer
          center={initialView.center}
          zoom={initialView.zoom}
          maxZoom={15}
          minZoom={5}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={0.5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          whenReady={() => {
            setMapReady(true);
            if (mapRef.current) setVisibleBounds(mapRef.current.getBounds());
          }}
        >
          <MapController mapRef={mapRef} onBoundsChange={setVisibleBounds} activeMarkerId={activeMarkerId} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />

   <MarkerClusterGroup
  key={filteredHeritages.map(h => h.id).join("-")} // mỗi lần filter thay đổi → cluster reset
>
  {filteredHeritages.map(h =>
    h.heritageLocations.map(loc => {
      const markerId = `${h.id}-${loc.id}`;
      return (
        <Marker
          key={markerId}
          position={[loc.latitude, loc.longitude]}
          ref={(ref) => {
            if (ref && activeMarkerId === markerId) {
              setTimeout(() => ref.openPopup(), 100); // đợi cluster zoom xong
            }
          }}
          eventHandlers={{
            popupopen: () => setActiveMarkerId(markerId),
            popupclose: () => setActiveMarkerId(null),
          }}
        >
          <Popup>
            <DiscoveryHeritageCard key={h.id} heritage={h} />
          </Popup>
        </Marker>
      );
    })
  )}
</MarkerClusterGroup>


          {mapReady && userLatLng && (
            <Marker position={[userLatLng.lat, userLatLng.lng]} icon={userIcon}>
              <Popup>Bạn đang ở đây</Popup>
            </Marker>
          )}
        </MapContainer>

          
        <button
          onClick={() => setShowHeritageList(true)}
          className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 border border-gray-200 z-[1000]"
        >
          Danh sách ({filteredHeritages.length})
        </button>

        {userLatLng && mapReady && (
          <button
            onClick={() => mapRef.current?.setView(userLatLng, 9)}
            className="absolute bottom-4 right-4 bg-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-xl hover:bg-gray-100 border z-[1000]"
          >
            <MapPin/>
          </button>
        )}

       {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[1000]">
            <Spinner size={34} thickness={4} className="" ariaLabel="Đang tải dữ liệu bản đồ" />
          </div>
        )}

      </div>



      {showHeritageList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                Danh sách Di sản ({filteredHeritages.length})
              </h2>
              <button
                onClick={() => setShowHeritageList(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
              {filteredHeritages.length > 0 ? (
                filteredHeritages.map(h => (
                  <div key={h.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-2">{h.name}</h3>
                    {h.description && <p className="text-sm text-gray-700 mb-3 leading-relaxed">{h.description}</p>}
                    {h.heritageLocations.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {(expandedHeritageIds.includes(h.id) ? h.heritageLocations : h.heritageLocations.slice(0, 1)).map((loc, idx) => (
                          <p key={idx} className="mb-1">📍 {formatLocation(loc)}</p>
                        ))}
                        {h.heritageLocations.length > 1 && (
                          <button className="text-blue-600 text-xs font-medium hover:underline" onClick={() => toggleExpand(h.id)}>
                            {expandedHeritageIds.includes(h.id) ? "Thu gọn" : "Xem thêm..."}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Không có di sản nào hiển thị</p>
              )}
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