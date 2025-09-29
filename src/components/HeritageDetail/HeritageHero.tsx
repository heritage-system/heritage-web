import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  Bookmark,
  Share2,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { HeritageSearchResponse } from "../../types/heritage";
import FavoriteButton from "../Heritage/FavoriteButton";

interface Props {
  heritage: HeritageSearchResponse;
  liked: boolean;
  bookmarked: boolean;
  heroImage?: string;
  onBack?: () => void;
  onLike: () => void;
  onBookmark: () => void;
}

const calendarLabel: Record<string, string> = {
  SOLAR: "Dương lịch",
  LUNAR: "Âm lịch",
};

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-gray-700">
    {children}
  </span>
);

export const HeritageHero: React.FC<Props> = ({
  heritage,
  liked,
  bookmarked,
  heroImage,
  onBack,
  onLike,
  onBookmark,
}) => {
  const firstOcc = heritage.heritageOccurrences?.[0];
  const firstLoc = heritage.heritageLocations?.[0];

  // helper để build địa chỉ
  const formatLocation = (loc?: {
    province?: string;
    district?: string;
    ward?: string;
    addressDetail?: string;
  }) => {
    if (!loc) return "Không xác định";

    const parts = [
      loc.province,
      loc.district,
      loc.ward,
      loc.addressDetail,
    ].filter((x) => x && x.trim() !== "");

    return parts.length > 0 ? parts.join(", ") : "Không xác định";
  };

  return (
    <div className="relative">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 pointer-events-none rounded-b-3xl"/> */}
      <div className=" md:h-[360px] w-full overflow-hidden rounded-b-3xl">
        {heroImage ? (
          <img
            src={heroImage}
            alt={heritage.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>

      {/* Top bar */}
      {/* <div className="absolute top-4 inset-x-0">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 hover:bg-white px-3 py-1.5 text-gray-700 shadow-sm backdrop-blur"
          >
            <ChevronLeft className="w-4 h-4"/>
            Quay lại
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={onBookmark}
              className={`rounded-full bg-white/80 hover:bg-white p-2 shadow-sm backdrop-blur ${bookmarked?"text-yellow-600":"text-gray-700"}`}
            >
              <Bookmark className="w-5 h-5"/>
            </button>
            <button className="rounded-full bg-white/80 hover:bg-white p-2 text-gray-700 shadow-sm backdrop-blur">
              <Share2 className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </div> */}

      {/* Title block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="-mt-16 md:-mt-12 relative"
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {heritage.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  {firstLoc && (
                    <Pill>
                      <MapPin className="w-4 h-4" /> {formatLocation(firstLoc)}
                    </Pill>
                  )}
                  {firstOcc && (
                    <Pill>
                      <Calendar className="w-4 h-4" />
                      {firstOcc.startDay}/{firstOcc.startMonth} (
                      {calendarLabel[firstOcc.calendarTypeName] ||
                        firstOcc.calendarTypeName}
                      )
                    </Pill>
                  )}
                  <Pill>
                    <Users className="w-4 h-4" />{" "}
                    {heritage.categoryName || "Danh mục"}
                  </Pill>
                  {heritage.isFeatured && <Pill>⭐ Nổi bật</Pill>}
                </div>

                {/* Tags */}
                {heritage.heritageTags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {heritage.heritageTags.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full border border-yellow-100"
                      >
                        <Tag className="w-3 h-3" /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <FavoriteButton heritageId={heritage.id} size="md" />
            </div>

            {/* Quick intro */}
            {heritage.description && (
              <p className="mt-3 text-gray-700 leading-relaxed">{heritage.description}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
