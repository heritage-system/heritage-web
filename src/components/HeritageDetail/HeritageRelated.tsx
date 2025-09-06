import React, { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeritageSearchResponse, HeritageLocation, HeritageMedia } from "../../types/heritage";

interface Props {
  relatedHeritages?: HeritageSearchResponse[];
  onClickItem?: (h: HeritageSearchResponse) => void;
}

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }>
  = ({ title, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border p-5 relative">
    <header className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {right}
    </header>
    <div>{children}</div>
  </section>
);

/** Chọn ảnh cover từ media */
const pickCover = (media: HeritageMedia[] = []) => {
  if (!media.length) return undefined;
  // ưu tiên mediaTypeName có chữ 'image' (không phân biệt hoa thường)
  const img = media.find(m => /image/i.test(m.mediaTypeName || "")) || media[0];
  return img.url;
};

/** Format địa điểm ngắn gọn */
const formatLocation = (loc?: HeritageLocation) => {
  if (!loc) return "Không xác định";
  const parts = [loc.addressDetail, loc.ward, loc.district, loc.province].filter(Boolean);
  return parts.length ? parts.join(", ") : "Không xác định";
};

export const HeritageRelated: React.FC<Props> = ({ relatedHeritages, onClickItem }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heritages = useMemo(() => relatedHeritages ?? [], [relatedHeritages]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const itemWidth = 260; // w-60 + gap
    containerRef.current.scrollBy({
      left: direction === "left" ? -itemWidth : itemWidth,
      behavior: "smooth",
    });
  };

  return (
    <SectionCard title="Di sản liên quan">
      {heritages.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có dữ liệu di sản liên quan.</div>
      ) : (
        <div className="relative">
          {/* Nút trái */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-10 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
            aria-label="Trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Danh sách */}
          <div
            ref={containerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth px-1 no-scrollbar"
            style={{ scrollbarWidth: "none" /* Firefox */ }}
          >
            {heritages.map((h) => {
              const cover = pickCover(h.media);
              const firstLoc = h.heritageLocations?.[0];
              return (
                <button
                  key={h.id}
                  onClick={() => onClickItem?.(h)}
                  className="flex-shrink-0 w-60 border rounded-xl p-3 hover:shadow-sm transition bg-white text-left"
                  title={h.name}
                >
                  <div className="h-28 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={h.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Không có ảnh
                      </div>
                    )}
                  </div>

                  <div className="font-medium text-gray-900 line-clamp-2">{h.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{h.categoryName || "—"}</div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {formatLocation(firstLoc)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nút phải */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-10 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
            aria-label="Tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </SectionCard>
  );
};
