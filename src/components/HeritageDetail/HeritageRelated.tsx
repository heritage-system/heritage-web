import React, { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeritageRelatedResponse, HeritageMedia } from "../../types/heritage";

interface Props {
  relatedHeritages?: HeritageRelatedResponse[];
  onClickItem?: (h: HeritageRelatedResponse) => void;
}

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }>
  = ({ title, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border p-6 relative">
    <header className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {right}
    </header>
    <div>{children}</div>
  </section>
);

/** Chọn ảnh cover từ media */
const pickCover = (media: HeritageMedia[] = []) => {
  if (!media.length) return undefined;
  const img = media.find(m => /image/i.test(m.mediaTypeName || "")) || media[0];
  return img.url;
};

export const HeritageRelated: React.FC<Props> = ({ relatedHeritages, onClickItem }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heritages = useMemo(() => relatedHeritages ?? [], [relatedHeritages]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const itemWidth = 300; // rộng hơn cho card to
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
            className="absolute -left-10 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-3 shadow hover:bg-gray-50"
            aria-label="Trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Danh sách */}
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth px-1 no-scrollbar"
            style={{ scrollbarWidth: "none" }}
          >
            {heritages.map((h) => {         
              return (
                <button
                  key={h.id}
                  onClick={() => onClickItem?.(h)}
                  className="flex-shrink-0 w-72 border rounded-xl hover:shadow-md transition bg-white text-left overflow-hidden"
                  title={h.name}
                >
                  {/* Cover cố định 180px */}
                  <div className="h-44 bg-gray-100 overflow-hidden">
                    {h.media ? (
                      <img
                        src={h.media.url}
                        alt={h.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Không có ảnh
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-1 overflow-hidden relative">
                      <span
                        className="flex-1 whitespace-nowrap inline-block animate-marquee"
                        style={{ animationDuration: "8s" }}
                        title={h.name}
                      >
                        {h.name}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-2"><div className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">{h.categoryName || "—"}</div></div>
                    
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {h.description || "Không có mô tả"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nút phải */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-10 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-3 shadow hover:bg-gray-50"
            aria-label="Tiếp"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </SectionCard>
  );
};
