import React from "react";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import PortalModal from "../Layouts/ModalLayouts/PortalModal";
import {HeritageMedia} from "../../types/heritage";

interface Props {
  images: HeritageMedia[];
  videos: HeritageMedia[];
  heritageName: string;
}

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }>
  = ({ title, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border p-5">
    <header className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {right}
    </header>
    <div>{children}</div>
  </section>
);

/** Helpers */
const isYouTube = (url: string) => /youtube\.com|youtu\.be/.test(url);
const isVimeo = (url: string) => /vimeo\.com/.test(url);

const toYouTubeEmbed = (url: string) => {
  const idMatch =
    url.match(/youtu\.be\/([^?&]+)/)?.[1] ||
    url.match(/[?&]v=([^?&]+)/)?.[1] ||
    "";
  return idMatch ? `https://www.youtube.com/embed/${idMatch}` : url;
};

const toVimeoEmbed = (url: string) => {
  const idMatch = url.match(/vimeo\.com\/(\d+)/)?.[1] || "";
  return idMatch ? `https://player.vimeo.com/video/${idMatch}` : url;
};

const getVideoThumbnail = (url: string) => {
  if (isYouTube(url)) {
    const idMatch =
      url.match(/youtu\.be\/([^?&]+)/)?.[1] ||
      url.match(/[?&]v=([^?&]+)/)?.[1];
    if (idMatch) return `https://img.youtube.com/vi/${idMatch}/hqdefault.jpg`;
  }
  if (isVimeo(url)) {
    // TODO: call API hoặc backend trả thumbnail
    return "/default-vimeo-thumb.jpg";
  }
  return null;
};

type Combined = (HeritageMedia & { kind: "image" | "video" });

export const HeritageMediaGallery: React.FC<Props> = ({
  images,
  videos,
  heritageName,
}) => {
  // Chỉ hiển thị tối đa như layout cũ (5 ảnh + 2 video) – muốn all thì bỏ slice().
  const visibleImages = images.slice(0, 5).map<Combined>((m) => ({ ...m, kind: "image" }));
  const visibleVideos = videos.slice(0, 2).map<Combined>((m) => ({ ...m, kind: "video" }));
  const mediaList: Combined[] = [...visibleImages, ...visibleVideos];

  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState<number>(0);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const next = React.useCallback(() => {
    if (!mediaList.length) return;
    setIndex((i) => (i + 1) % mediaList.length);
  }, [mediaList.length]);

  const prev = React.useCallback(() => {
    if (!mediaList.length) return;
    setIndex((i) => (i - 1 + mediaList.length) % mediaList.length);
  }, [mediaList.length]);

  // Keyboard: ← →
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  const renderPlayer = (item?: Combined) => {
    if (!item) return null;
    if (item.kind === "video") {
      const url = item.url;
      if (isYouTube(url)) {
        return (
          <iframe
            className="w-full h-full rounded-xl"
            src={`${toYouTubeEmbed(url)}?autoplay=1&rel=0`}
            title={item.description || heritageName || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        );
      }
      if (isVimeo(url)) {
        return (
          <iframe
            className="w-full h-full rounded-xl"
            src={`${toVimeoEmbed(url)}?autoplay=1`}
            title={item.description || heritageName || "Video"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
      return (
        <video
          className="w-full h-full rounded-xl bg-black"
          src={item.url}
          controls
          autoPlay
        />
      );
    }
    // Ảnh
    return (
  <div className="aspect-video w-full max-w-4xl flex items-center justify-center backdrop-blur-sm opacity-100 rounded-xl scrollbar-hide">
    <img
      src={item.url}
      alt={item.description || heritageName}
      className="max-h-full max-w-full object-contain scrollbar-hide"
    />
  </div>


    );
  };

  const current = mediaList[index];

  return (
    <SectionCard
      title="Thư viện"
      right={
        <span className="text-sm text-gray-500">
          {images.length} ảnh · {videos.length} video
        </span>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Ảnh */}
        {visibleImages.map((m, i) => (
          <button
            key={`img-${m.id}`}
            type="button"
            onClick={() => openAt(i)}
            className="relative group overflow-hidden rounded-xl border h-36"
            title="Xem ảnh"
          >
            <img
              src={m.url}
              alt={m.description || heritageName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </button>
        ))}

        {/* Video */}
        {visibleVideos.map((v, j) => {
  const overallIndex = visibleImages.length + j;
  const thumb = getVideoThumbnail(v.url);

  return (
    <button
    key={`vid-${v.id}`}
    type="button"
    onClick={() => openAt(overallIndex)}
    className="relative overflow-hidden rounded-xl border h-36 group"
    title="Xem video"
  >
    {thumb ? (
      <img
        src={thumb}
        alt={v.description || heritageName}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
    ) : (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
        <Play className="w-8 h-8" />
      </div>
    )}

    {/* Nút Play overlay luôn hiển thị */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-black/40 rounded-full p-3 transition-transform group-hover:scale-110">
        <Play className="w-8 h-8 text-white" />
      </div>
    </div>
  </button>
  );
})}


        {images.length === 0 && videos.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            Chưa có media để hiển thị.
          </div>
        )}
      </div>

      {/* Lightbox: nhỏ gọn + điều hướng */}
      <PortalModal
        open={open}
        onClose={close}
        size="lg"
        maxWidth="min(90vw, 1000px)"
        maxHeight="85vh"
        fullScreenOnMobile
        contentClassName="rounded-2xl bg-black p-0"
      >
       <div className="relative w-[min(90vw,1000px)] max-h-[85vh] flex items-center justify-center px-12 sm:px-16">
  {/* Đóng */}
  <button
    onClick={close}
    className="absolute top-3 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white p-2"
    aria-label="Đóng"
    title="Đóng"
  >
    <X className="w-5 h-5" />
  </button>

  {/* Prev */}
  {mediaList.length > 1 && (
    <button
      onClick={prev}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 p-2 text-white"
      aria-label="Trước"
      title="Trước"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  )}

  {/* Nội dung */}
  <div className="w-full flex items-center justify-center px-4 py-8">
    {current?.kind === "video" ? (
      <div className="aspect-video w-full max-h-[80vh]">{renderPlayer(current)}</div>
    ) : (
      <div className="w-full flex items-center justify-center">
        {renderPlayer(current)}
      </div>
    )}
  </div>

  {/* Next */}
  {mediaList.length > 1 && (
    <button
      onClick={next}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 p-2 text-white"
      aria-label="Tiếp"
      title="Tiếp"
    >
      <ChevronRight className="w-6 h-6" />
    </button>
  )}

  {/* Caption + index */}
  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/80 text-xs px-2 py-1 rounded bg-black/40">
    {index + 1} / {mediaList.length}
    {current?.description ? ` • ${current.description}` : ""}
  </div>
</div>

      </PortalModal>
    </SectionCard>
  );
};
