import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, MapPin, Tag, Image, Clock, Video, Calendar, Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { HeritageAdmin } from "../../../../types/heritage";
import { getHeritageById } from "../../../../services/heritageService";
import { toast } from "react-toastify";

interface HeritageDetailProps {
  heritageId: number;
  onBack: () => void;
  onEdit: (heritage: HeritageAdmin) => void;
}

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
    return "/default-vimeo-thumb.jpg";
  }
  return null;
};

type Combined = { url: string; description?: string; kind: "image" | "video"; id: any };

const HeritageDetail: React.FC<HeritageDetailProps> = ({
  heritageId,
  onBack,
  onEdit,
}) => {
  const [heritage, setHeritage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "content" | "media" | "location">("info");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const generateThumbnail = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous"; 
    video.muted = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      video.currentTime = 0.1; 
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg"));
      } else {
        reject(new Error("Cannot get canvas context"));
      }
      video.remove();
    };

    video.onerror = (err) => {
      console.error("Video load error:", err);
      toast.error("Không thể tải video để tạo thumbnail.");
      reject(err);
      video.remove(); 
    };
  });
};

  useEffect(() => {
  const loadHeritage = async () => {
    try {
      setLoading(true);
      const response = await getHeritageById(heritageId);
      
      if (response.code === 200 && response.result) {
        let parsedResult = response.result;
        
        if (typeof parsedResult.content === 'string') {
          try {
            const contentObj = JSON.parse(parsedResult.content);
            const contentBlocks: any[] = [];
            
            ['History', 'Rituals', 'Values', 'Preservation'].forEach(section => {
              if (contentObj[section] && Array.isArray(contentObj[section])) {
                contentObj[section].forEach((block: any) => {
                  contentBlocks.push({
                    section: section,
                    type: block.Type || block.type,
                    content: block.Content || block.content,
                    items: block.Items || block.items
                  });
                });
              }
            });
            
            parsedResult.contentBlocks = contentBlocks;
          } catch (e) {
            console.warn('Could not parse content as JSON:', e);
          }
        }

        setHeritage(parsedResult);

        // Generate thumbnails for uploaded videos
        const videos = parsedResult.media?.filter((m: any) => 
          m.mediaType?.toUpperCase() === "VIDEO") || [];
        const initialThumbs = new Array(videos.length).fill(null);
        await Promise.all(
          videos.map(async (v: any, i: number) => {
            if (v.url && !isYouTube(v.url) && !isVimeo(v.url)) {
              try {
                initialThumbs[i] = await generateThumbnail(v.url);
              } catch (err) {
                console.error(`Error generating thumbnail for video ${i}:`, err);
                initialThumbs[i] = "/default-video-thumb.jpg";
              }
            }
          })
        );
        setThumbnails(initialThumbs);
      } else {
        toast.error("Không thể tải thông tin di sản");
        onBack();
      }
    } catch (error) {
      console.error("Error loading heritage:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin di sản");
      onBack();
    } finally {
      setLoading(false);
    }
  };

  loadHeritage();
}, [heritageId, onBack]);

  const renderContentBlocks = (blocks: any[]) => {
    if (!blocks || blocks.length === 0) {
      return <p className="text-gray-500 italic text-sm">Chưa có nội dung</p>;
    }

    return (
      <div className="space-y-4">
        {blocks.map((block, idx) => {
          const blockType = block.Type || block.type;
          const blockContent = block.Content || block.content;
          const blockItems = block.Items || block.items;

          if (blockType === "paragraph") {
            return (
              <p key={idx} className="text-gray-700 leading-relaxed text-[15px]">
                {blockContent}
              </p>
            );
          } else if (blockType === "list" && blockItems) {
            return (
              <ul key={idx} className="space-y-2 ml-4">
                {blockItems.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700 leading-relaxed text-[15px] flex gap-2">
                    <span className="text-blue-600 mt-1.5">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const getOccurrenceTypeName = (type: string | number) => {
    if (typeof type === 'number') {
      const types = ["Ngày cụ thể", "Khoảng thời gian", "Quy tắc lặp lại", "Khoảng thời gian", "Không xác định"];
      return types[type] || "Không xác định";
    }
    const typeMap: Record<string, string> = {
      'EXACTDATE': 'Ngày cụ thể',
      'RANGE': 'Khoảng thời gian',
      'RECURRINGRULE': 'Quy tắc lặp lại',
      'APPROXIMATE': 'Khoảng thời gian',
      'UNKNOWN': 'Không xác định'
    };
    return typeMap[type] || type;
  };

  const getCalendarTypeName = (type: string | number) => {
    if (typeof type === 'number') {
      const types = ["Dương lịch", "Âm lịch", "Cả hai"];
      return types[type] || "Không xác định";
    }
    const typeMap: Record<string, string> = {
      'SOLAR': 'Dương lịch',
      'LUNAR': 'Âm lịch',
      'BOTH': 'Cả hai',
      '0': 'Dương lịch',
      '1': 'Âm lịch',
      '2': 'Cả hai'
    };
    return typeMap[type] || type;
  };

  const getFrequencyName = (freq: string | number) => {
    if (typeof freq === 'number') {
      const frequencies = ["Một lần", "Hàng năm", "Theo mùa", "Hàng tháng"];
      return frequencies[freq] || "Không xác định";
    }
    const freqMap: Record<string, string> = {
      'ONETIME': 'Một lần',
      'ANNUAL': 'Hàng năm',
      'SEASONAL': 'Theo mùa',
      'MONTHLY': 'Hàng tháng'
    };
    return freqMap[freq] || freq;
  };

  const getMediaByType = (type: string) => {
    if (!heritage?.media) return [];
    return heritage.media.filter((m: any) => {
      const mediaType = m.mediaType || '';
      return mediaType.toUpperCase() === type.toUpperCase();
    });
  };

  const images = getMediaByType("IMAGE");
  const videos = getMediaByType("VIDEO");

  const mediaList: Combined[] = [
    ...images.map((m: any) => ({ ...m, kind: "image" as const })),
    ...videos.map((m: any) => ({ ...m, kind: "video" as const }))
  ];

  const openAt = (i: number) => {
    setPopupIndex(i);
    setPopupOpen(true);
  };

  const closePopup = () => setPopupOpen(false);

  const next = React.useCallback(() => {
    if (!mediaList.length) return;
    setPopupIndex((i) => (i + 1) % mediaList.length);
  }, [mediaList.length]);

  const prev = React.useCallback(() => {
    if (!mediaList.length) return;
    setPopupIndex((i) => (i - 1 + mediaList.length) % mediaList.length);
  }, [mediaList.length]);

  React.useEffect(() => {
    if (!popupOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popupOpen, next, prev]);

  const renderPlayer = (item?: Combined) => {
    if (!item) return null;
    if (item.kind === "video") {
      const url = item.url;
      if (isYouTube(url)) {
        return (
          <iframe
            className="w-full h-full rounded-xl"
            src={`${toYouTubeEmbed(url)}?autoplay=1&rel=0`}
            title={item.description || heritage.name || "Video"}
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
            title={item.description || heritage.name || "Video"}
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
    return (
      <div className="aspect-video w-full max-w-4xl flex items-center justify-center backdrop-blur-sm opacity-100 rounded-xl">
        <img
          src={item.url}
          alt={item.description || heritage.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  };

  const current = mediaList[popupIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin di sản...</p>
        </div>
      </div>
    );
  }

  if (!heritage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{heritage.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">Chi tiết di sản văn hóa</p>
              </div>
            </div>
            <button
              onClick={() => onEdit(heritage)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex border-b overflow-x-auto">
            {[
              { key: "info", label: "Thông tin cơ bản" },
              { key: "content", label: "Nội dung chi tiết" },
              { key: "media", label: "Media" },
              { key: "location", label: "Địa điểm & Thời gian" }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3.5 font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "info" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tên di sản
                    </label>
                    <p className="text-gray-900 font-medium text-base">{heritage.name}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Danh mục
                    </label>
                    <p className="text-gray-900 text-base">{heritage.categoryName || "—"}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Ngày tạo
                    </label>
                    <p className="text-gray-900 text-base">
                      {new Date(heritage.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  {heritage.updatedAt && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Cập nhật lần cuối
                      </label>
                      <p className="text-gray-900 text-base">
                        {new Date(heritage.updatedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {heritage.tags && heritage.tags.length > 0 ? (
                      heritage.tags.map((tag: any) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100"
                        >
                          <Tag size={14} />
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm italic">Chưa có tag</span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Mô tả
                  </label>
                  <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border text-[15px] whitespace-pre-wrap">
                    {heritage.description || "Chưa có mô tả"}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="space-y-8">
                {(() => {
                  const contentBlocks = heritage?.contentBlocks || [];

                  if (contentBlocks.length === 0) {
                    return (
                      <p className="text-gray-500 italic text-sm text-center py-8">
                        Chưa có nội dung
                      </p>
                    );
                  }

                  const labels: Record<string, string> = {
                    History: "Lịch sử",
                    Rituals: "Nghi lễ",
                    Values: "Giá trị",
                    Preservation: "Bảo tồn",
                  };

                  const grouped: Record<string, any[]> = {};
                  for (const block of contentBlocks) {
                    const section = block.section || "Other";
                    if (!grouped[section]) grouped[section] = [];
                    grouped[section].push(block);
                  }

                  return Object.entries(labels).map(([sectionKey, sectionLabel]) => (
                    <div key={sectionKey} className="border-b pb-6 last:border-b-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                        {sectionLabel}
                      </h3>
                      <div className="pl-3">
                        {grouped[sectionKey]?.length ? (
                          renderContentBlocks(grouped[sectionKey])
                        ) : (
                          <p className="text-gray-500 italic text-sm">Chưa có nội dung</p>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-8">
                {images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Image size={20} className="text-blue-600" />
                      Hình ảnh
                      <span className="text-sm font-normal text-gray-500">({images.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {images.map((media: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openAt(idx)}
                          className="relative group overflow-hidden rounded-xl border h-36"
                          title="Xem ảnh"
                        >
                          <img
                            src={media.url}
                            alt={media.description || heritage.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {videos.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <Video size={20} className="text-purple-600" />
      Video
      <span className="text-sm font-normal text-gray-500">({videos.length})</span>
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {videos.map((v: any, j: number) => {
        const overallIndex = images.length + j;
        const thumb = thumbnails[j] || getVideoThumbnail(v.url) || "/default-video-thumb.jpg";

        return (
          <button
            key={j}
            type="button"
            onClick={() => openAt(overallIndex)}
            className="relative overflow-hidden rounded-xl border h-36 group"
            title="Xem video"
          >
            <img
              src={thumb}
              alt={v.description || heritage.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/40 rounded-full p-3 transition-transform group-hover:scale-110">
                <Play className="w-8 h-8 text-white" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
)}

                {images.length === 0 && videos.length === 0 && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Image size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 italic">Chưa có media nào</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "location" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-red-600" />
                    Địa điểm
                  </h3>
                  {heritage.locations && heritage.locations.length > 0 ? (
                    <div className="space-y-4">
                      {heritage.locations.map((loc: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-5 rounded-lg border hover:border-gray-300 transition-colors">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tỉnh/Thành phố</p>
                              <p className="text-gray-900 text-sm font-medium">
                                {loc.province || "—"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Quận/Huyện</p>
                              <p className="text-gray-900 text-sm font-medium">
                                {loc.district || "—"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phường/Xã</p>
                              <p className="text-gray-900 text-sm font-medium">
                                {loc.ward || "—"}
                              </p>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Địa chỉ chi tiết</p>
                              <p className="text-gray-900 text-sm font-medium">
                                {loc.addressDetail || "—"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tọa độ</p>
                              <p className="text-gray-900 text-sm font-medium font-mono bg-white px-2 py-1 rounded border inline-block">
                                {loc.latitude}, {loc.longitude}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border">
                      <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 italic text-sm">Chưa có thông tin địa điểm</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-green-600" />
                    Thời gian diễn ra
                  </h3>
                  {heritage.occurrences && heritage.occurrences.length > 0 ? (
                    <div className="space-y-4">
                      {heritage.occurrences.map((occ: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-5 rounded-lg border hover:border-gray-300 transition-colors">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Loại thời gian</p>
                              <p className="text-gray-900 text-sm font-medium">
                                {getOccurrenceTypeName(occ.occurrenceType)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Loại lịch</p>
                              <p className="text-gray-900 text-sm font-medium">
                                {getCalendarTypeName(occ.calendarType)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tần suất</p>
                              <p className="text-gray-900 text-sm font-medium">
                                {getFrequencyName(occ.frequency)}
                              </p>
                            </div>
                            {occ.startDay && occ.startMonth && (
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ngày bắt đầu</p>
                                <p className="text-gray-900 text-sm font-medium">
                                  {occ.startDay}/{occ.startMonth}
                                </p>
                              </div>
                            )}
                            {occ.endDay && occ.endMonth && (
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ngày kết thúc</p>
                                <p className="text-gray-900 text-sm font-medium">
                                  {occ.endDay}/{occ.endMonth}
                                </p>
                              </div>
                            )}
                            {occ.recurrenceRule && occ.recurrenceRule !== "null" && (
                              <div className="md:col-span-3 space-y-1">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Quy tắc lặp lại</p>
                                <p className="text-gray-900 text-sm bg-white px-3 py-2 rounded border">
                                  {occ.recurrenceRule}
                                </p>
                              </div>
                            )}
                            {occ.description && occ.description !== "null" && (
                              <div className="md:col-span-3 space-y-1">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mô tả</p>
                                <p className="text-gray-700 text-sm leading-relaxed bg-white px-3 py-2 rounded border">
                                  {occ.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border">
                      <Calendar size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 italic text-sm">
                        Chưa có thông tin thời gian diễn ra
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup Lightbox */}
      {popupOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          <div
            className="relative w-[min(90vw,1000px)] max-h-[85vh] flex items-center justify-center px-12 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Đóng */}
            <button
              onClick={closePopup}
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
              {current?.description && (
                <p className="text-sm text-gray-200 bg-black/40 px-4 py-1.5 rounded-lg inline-block mb-2">
                  {current.description}
                </p>
              )}
              <p className="text-xs text-gray-300">
                {popupIndex + 1} / {mediaList.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeritageDetail;