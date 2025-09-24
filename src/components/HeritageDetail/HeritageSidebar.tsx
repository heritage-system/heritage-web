import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Share2,
  Flag
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HeritageSearchResponse } from "../../types/heritage";
import ReportModal from "./ReportModal";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PortalModal from "../Layouts/PortalModal";


// Fix icon marker khi bundle với webpack/vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  heritage: HeritageSearchResponse;
  liked: boolean;
  bookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  userId?: number; 
}

const formatLocation = (loc?: {
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
}) => {
  if (!loc) return "Không xác định";

  const parts = [loc.province, loc.district, loc.ward, loc.addressDetail].filter(
    (x) => x && x.trim() !== ""
  );

  return parts.length > 0 ? parts.join(", ") : "Không xác định";
};

const calendarLabel: Record<string, string> = {
  SOLAR: "Dương lịch",
  LUNAR: "Âm lịch",
};

const frequencyLabel: Record<string, string> = {
  ONETIME: "Một lần",
  ANNUAL: "Hằng năm",
  SEASONAL: "Theo mùa",
  MONTHLY: "Hằng tháng",
};

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> =
  ({ title, right, children }) => (
    <section className="bg-white rounded-2xl shadow-sm border p-5">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {right}
      </header>
      <div>{children}</div>
    </section>
  );

// Component để pan map khi chọn địa điểm
const FlyToLocation: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

export const HeritageSidebar: React.FC<Props> = ({
  heritage,
  liked,
  bookmarked,
  onLike,
  onBookmark,
  userId,
}) => {
  const firstOcc = heritage.heritageOccurrences?.[0];
  const firstLoc = heritage.heritageLocations?.[0];
  const [selectedLoc, setSelectedLoc] = useState(firstLoc ?? null);

  const [openReport, setOpenReport] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [openLoginModal, setOpenLoginModal] = useState(false);


const handleReportClick = () => {
    console.log("isLoggedIn =", isLoggedIn); // debug
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }
    setOpenReport(true);
  };


  // 🔧 Sync lại khi di sản/địa điểm đầu tiên thay đổi
  useEffect(() => {
    setSelectedLoc(firstLoc ?? null);
  }, [firstLoc?.id, heritage.id]);

  return (
    <div className="space-y-6">
      {/* Thông tin nhanh */}
      <SectionCard title="Thông tin nhanh">
        <ul className="text-sm text-gray-700 space-y-2">
          {firstOcc && (
            <li className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5" />
              <span>
                Bắt đầu: <b>{firstOcc.startDay}/{firstOcc.startMonth}</b> · {calendarLabel[firstOcc.calendarTypeName]}
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5" />
            <span>Tần suất: {frequencyLabel[firstOcc?.frequencyName] || "—"}</span>
          </li>
          <li className="flex items-start gap-2">
            <Users className="w-4 h-4 mt-0.5" />
            <span>Danh mục: {heritage.categoryName || "—"}</span>
          </li>
        </ul>
      </SectionCard>

      {/* Bản đồ */}
      <SectionCard title="Bản đồ & chỉ đường">
        <div className="relative z-0">
          {heritage.heritageLocations?.length ? (
            <div className="space-y-3">
              {/* Dropdown chọn địa điểm */}
              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={selectedLoc?.id}
                onChange={(e) =>
                  setSelectedLoc(
                    heritage.heritageLocations.find((l) => l.id === Number(e.target.value)) ||
                    firstLoc
                  )
                }
              >
                {heritage.heritageLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {formatLocation(loc)}
                  </option>
                ))}
              </select>

              {/* Hiển thị bản đồ */}
              {selectedLoc && (
                <MapContainer
                  center={[selectedLoc.latitude, selectedLoc.longitude]}
                  zoom={13}
                  style={{ height: "200px", width: "100%" }}
                  className="rounded-xl"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  <Marker position={[selectedLoc.latitude, selectedLoc.longitude]}>
                    <Popup>
                      {heritage.name}<br />
                      {formatLocation(selectedLoc)}
                    </Popup>
                  </Marker>
                  <FlyToLocation lat={selectedLoc.latitude} lng={selectedLoc.longitude} />
                </MapContainer>
              )}
            </div>
          ) : (
            <div className="h-48 w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
              Chưa có dữ liệu vị trí.
            </div>
          )}
        </div>
      </SectionCard>

      {/* Chia sẻ & Theo dõi */}
      <SectionCard title="Chia sẻ & Theo dõi">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Nút chia sẻ */}
          <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
            <Share2 className="w-4 h-4" /> Chia sẻ
          </button>
          {/* Nút nhắc lịch */}
          <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
            <Clock className="w-4 h-4" /> Nhắc lịch
          </button>

           {/* Nút Báo cáo */}
          <button
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 text-red-600 border-red-200"
            onClick={handleReportClick}
          >
            <Flag className="w-4 h-4" /> Báo cáo
          </button>
        </div>
      </SectionCard>

      {/* Modal báo cáo */}
      <ReportModal
        open={openReport}
        onClose={() => setOpenReport(false)}
        heritageId={heritage.id}
      />

     <PortalModal
      open={openLoginModal}
      onClose={() => setOpenLoginModal(false)}
    >
      <div className="p-6 text-center border-2 border-red-400 rounded-xl shadow-lg bg-white">
        <h2 className="text-lg font-semibold mb-3">Bạn cần đăng nhập</h2>
        <p className="text-gray-600 mb-4">
          Vui lòng đăng nhập để thực hiện báo cáo!
        </p>

        {/* Wrap button trong div flex justify-center */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-yellow-800 to-yellow-600 text-white px-6 py-2 rounded-xl
                      hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </PortalModal>




      {/* Nguồn tham khảo */}
      <SectionCard title="Nguồn tham khảo & Liên hệ">
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>Ban tổ chức lễ hội (số điện thoại, email)</li>
          <li>Tài liệu/website chính thức (nếu có)</li>
          <li>Liên hệ chính quyền địa phương</li>
        </ul>
      </SectionCard>

    </div>

    
  );
  
};
