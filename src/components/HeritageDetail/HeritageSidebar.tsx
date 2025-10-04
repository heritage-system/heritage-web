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
import { HeritageDetailResponse } from "../../types/heritage";
import ReportModal from "./ReportModal";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PortalModal from "../Layouts/ModalLayouts/PortalModal";
import toast from "react-hot-toast";

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
  heritage: HeritageDetailResponse;
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
  const [showShare, setShowShare] = useState(false);

  const handleShare = (platform: string) => {
    const url = window.location.origin + `/heritagedetail/${heritage.id}`;
    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);   
        toast.success("Đã sao chép link!"); 
        break;
    }
    setShowShare(false);
  };

const handleReportClick = () => {
    console.log("isLoggedIn =", isLoggedIn); // debug
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }
    setOpenReport(true);
  };

const formatOccurrenceDate = (occ: any) => {
  if (!occ) return "Không xác định";

  const calendar = calendarLabel[occ.calendarTypeName] || occ.calendarTypeName;

  // Nếu EXACTDATE -> chỉ hiển thị start
  if (occ.occurrenceTypeName === "EXACTDATE") {
    return `${occ.startDay}/${occ.startMonth} (${calendar})`;
  }

  // Ngược lại có start + end
  return `${occ.startDay}/${occ.startMonth}${
    occ.endDay && occ.endMonth ? ` - ${occ.endDay}/${occ.endMonth}` : ""
  } (${calendar})`;
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
    {heritage.heritageOccurrences?.length ? (
      heritage.heritageOccurrences.map((occ) => (
        <li key={occ.id} className="flex items-start gap-2">
          <Calendar className="w-4 h-4 mt-0.5" />
          <span>
            <b>{formatOccurrenceDate(occ)}</b>
          </span>
        </li>
      ))
    ) : (
      <li className="flex items-start gap-2">
        <Calendar className="w-4 h-4 mt-0.5" />
        <span>Không có dữ liệu ngày tổ chức</span>
      </li>
    )}

    <li className="flex items-start gap-2">
      <Clock className="w-4 h-4 mt-0.5" />
      <span>
        Tần suất: {frequencyLabel[heritage.heritageOccurrences?.[0]?.frequencyName] || "—"}
      </span>
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
          <div className="relative">
            <button  
              onClick={(e) => {
                  e.preventDefault();
                  setShowShare((prev) => !prev);
                }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
              <Share2 className="w-4 h-4" /> Chia sẻ
            </button>                                
            {showShare && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 flex items-center justify-around w-40">
              <button 
                onClick={() => handleShare('facebook')} 
                className="p-2 rounded-full hover:bg-blue-50 text-blue-600"
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </button>

              <button 
                onClick={() => handleShare('twitter')} 
                className="p-2 rounded-full hover:bg-blue-50 text-sky-500"
                title="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.86 1.09A4.52 4.52 0 0016.11 0c-2.63 0-4.77 2.13-4.77 4.76 0 .37.04.73.12 1.07C7.69 5.67 4.07 3.75 1.64.96a4.77 4.77 0 00-.65 2.39c0 1.65.84 3.1 2.12 3.95a4.52 4.52 0 01-2.16-.6v.06c0 2.3 1.65 4.22 3.84 4.65a4.5 4.5 0 01-2.14.08c.6 1.86 2.34 3.22 4.4 3.26A9.05 9.05 0 010 19.54a12.79 12.79 0 006.92 2.03c8.3 0 12.84-6.88 12.84-12.84 0-.2 0-.41-.01-.61A9.18 9.18 0 0023 3z"/>
                </svg>
              </button>

              <button 
                onClick={() => handleShare('copy')} 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                title="Sao chép link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 007.54 4.54l3.36-3.36a5 5 0 00-7.07-7.07l-.88.88"/>
                  <path d="M14 11a5 5 0 00-7.54-4.54L3.1 9.82a5 5 0 007.07 7.07l.88-.88"/>
                </svg>
              </button>
            </div>
            )}
          </div>
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
