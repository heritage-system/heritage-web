import { useState } from "react";
import { MapPin, Calendar, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeritageSearchResponse, HeritageLocation, HeritageOccurrence } from "../../types/heritage";

interface DiscoveryHeritageCardProps {
  heritage: HeritageSearchResponse;
}

const DEFAULT_IMAGE = "https://placehold.co/600x400?text=No+Image";

const DiscoveryHeritageCard: React.FC<DiscoveryHeritageCardProps> = ({ heritage }) => {
  const navigate = useNavigate();
  const [showAllLocations, setShowAllLocations] = useState(false);

  const handleCardClick = () => {
    navigate(`/heritagedetail/${heritage.id}`);
  };

  const imageUrl = heritage.media?.[0]?.url || DEFAULT_IMAGE;

  const formatLocation = (loc: HeritageLocation) => {
    return [loc.province, loc.district, loc.ward, loc.addressDetail]
      .filter(Boolean)
      .join(", ");
  };

  const locationNames = heritage.heritageLocations?.length
    ? heritage.heritageLocations.map(formatLocation)
    : ["Chưa rõ địa điểm"];

  const displayLocation = showAllLocations ? (
  <div className="flex flex-col space-y-1">
    {locationNames.map((loc, i) => (
      <span key={i} className="truncate max-w-[220px]">
        {loc}
      </span>
    ))}
    {locationNames.length > 1 && (
      <button
        className="text-blue-600 text-xs mt-1 hover:underline self-start"
        onClick={(e) => {
          e.stopPropagation();
          setShowAllLocations(false);
        }}
      >
        Thu gọn
      </button>
    )}
  </div>
) : (
  <div className="flex flex-col">
    <span className="truncate max-w-[200px] inline-block align-bottom">
      {locationNames[0]}
    </span>
    {locationNames.length > 1 && (
      <button
        className="text-blue-600 font-medium whitespace-nowrap text-xs hover:underline mt-1 text-left"
        onClick={(e) => {
          e.stopPropagation();
          setShowAllLocations(true);
        }}
      >
        +{locationNames.length - 1} địa điểm khác
      </button>
    )}
  </div>
);


  const occurrence: HeritageOccurrence | undefined = heritage.heritageOccurrences?.[0];

  const calendarLabelMap: Record<string, string> = {
    SOLAR: "Dương lịch",
    LUNAR: "Âm lịch",
  };

  const dateLabel = occurrence
    ? `${occurrence.startDay}/${occurrence.startMonth} (${calendarLabelMap[occurrence.calendarTypeName] || occurrence.calendarTypeName})`
    : "Không xác định";

  return (
    <div
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={heritage.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-yellow-50 transition-colors">
          <Heart className="w-4 h-4 text-gray-400 hover:text-red-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Date */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {dateLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
          {heritage.name}
        </h3>

        {/* Category & Tags */}
        <p className="text-xs text-gray-500 mb-1">
          <strong>Danh mục:</strong> {heritage.categoryName || "Chưa rõ danh mục"}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          <strong>Tags:</strong> {heritage.heritageTags.length ? heritage.heritageTags.join(", ") : "Chưa có tag"}
        </p>

        {/* Footer */}  
        <div className="flex items-start text-sm text-gray-500 overflow-hidden">
          <MapPin className="w-4 h-4 mr-1 shrink-0 mt-1" />
          {displayLocation}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryHeritageCard;
