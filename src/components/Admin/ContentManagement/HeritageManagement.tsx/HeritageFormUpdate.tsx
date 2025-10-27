import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import {
  HeritageUpdateRequest,
  MediaRequest,
  LocationRequest,
  OccurrenceRequest,
  ContentBlock,
  HeritageContentRequest,
  HeritageResponse,
} from "../../../../types/heritage";
import {
  CalendarType,
  OccurrenceType,
  MediaType,
  FestivalFrequency,
} from "../../../../types/enum";
import { Category } from "../../../../types/category";
import { Tags } from "../../../../types/tag";
import {
  updateHeritage,
  getHeritageById,
} from "../../../../services/heritageService";
import { uploadImage, uploadVideo } from "../../../../services/uploadService";
import { fetchCategories } from "../../../../services/categoryService";
import { fetchTags } from "../../../../services/tagService";
import toast from "react-hot-toast";

// Helpers để xử lý URL video
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
    return "/default-video-thumb.jpg";
  }
  if (isVimeo(url)) {
    return "/default-vimeo-thumb.jpg";
  }
  return "/default-video-thumb.jpg";
};

// Mapping labels tiếng Việt
const OccurrenceTypeLabels: Record<string, string> = {
  EXACTDATE: "Ngày cụ thể",
  RANGE: "Khoảng thời gian",
  RECURRINGRULE: "Quy tắc lặp lại",
  APPROXIMATE: "Khoảng thời gian",
  UNKNOWN: "Không xác định",
};

const CalendarTypeLabels: Record<string, string> = {
  SOLAR: "Dương lịch",
  LUNAR: "Âm lịch",
  BOTH: "Cả hai",
};

const FestivalFrequencyLabels: Record<string, string> = {
  ONETIME: "Một lần",
  ANNUAL: "Hàng năm",
  SEASONAL: "Theo mùa",
  MONTHLY: "Hàng tháng",
};

const MediaTypeLabels: Record<string, string> = {
  IMAGE: "Hình ảnh",
  VIDEO: "Video",
};

const emptyParagraph = (): ContentBlock => ({ type: "paragraph", content: "" });
const emptyList = (): ContentBlock => ({ type: "list", items: [] });

type Combined = { url: string; description?: string; kind: "image" | "video"; id: any };

interface HeritageFormUpdateProps {
  heritageId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const HeritageFormUpdate: React.FC<HeritageFormUpdateProps> = ({
  heritageId,
  onCancel,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tags[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tempTagIds, setTempTagIds] = useState<number[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
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
      reject(err);
      video.remove(); 
    };
  });
};

  const [heritage, setHeritage] = useState<HeritageUpdateRequest>({
    id: heritageId,
    name: "",
    description: "",
    content: {
      history: [emptyParagraph()],
      rituals: [],
      values: [],
      preservation: [],
    },
    categoryId: 0,
    media: [{ url: "", mediaType: MediaType.IMAGE, description: "" }],
    tagIds: [],
    locations: [
      {
        province: "",
        district: "",
        ward: "",
        addressDetail: "",
        latitude: 0,
        longitude: 0,
      },
    ],
    occurrences: [
      {
        occurrenceType: OccurrenceType.EXACTDATE,
        calendarType: CalendarType.SOLAR,
        frequency: FestivalFrequency.ONETIME,
        startDay: 1,
        startMonth: 1,
      },
    ],
  });

  const [files, setFiles] = useState<(File | null)[]>([null]);

  useEffect(() => {
  const loadData = async () => {
    try {
      setInitialLoading(true);

      const [categoryRes, tagRes] = await Promise.all([
        fetchCategories(),
        fetchTags(),
      ]);
      setCategories(categoryRes.result || []);
      setTags(tagRes.result || []);

      const heritageRes = await getHeritageById(heritageId);
      if (heritageRes.code === 200 && heritageRes.result) {
        const data: HeritageResponse = heritageRes.result;

        let parsedContent: HeritageContentRequest = {
          history: [emptyParagraph()],
          rituals: [],
          values: [],
          preservation: [],
        };
        if (typeof data.content === "string" && data.content.trim()) {
          try {
            const contentObj = JSON.parse(data.content);
            const contentBlocks: any[] = [];

            ['History', 'Rituals', 'Values', 'Preservation'].forEach(section => {
              if (contentObj[section] && Array.isArray(contentObj[section])) {
                contentObj[section].forEach((block: any) => {
                  contentBlocks.push({
                    section: section,
                    type: block.Type || block.type || "paragraph",
                    content: block.Content || block.content || "",
                    items: block.Items || block.items || []
                  });
                });
              }
            });

            const grouped: Record<string, ContentBlock[]> = {
              History: [],
              Rituals: [],
              Values: [],
              Preservation: [],
            };
            contentBlocks.forEach((block) => {
              if (grouped[block.section]) {
                grouped[block.section].push({
                  type: block.type,
                  content: block.content,
                  items: block.items,
                });
              }
            });

            parsedContent = {
              history: grouped.History.length > 0 ? grouped.History : [emptyParagraph()],
              rituals: grouped.Rituals,
              values: grouped.Values,
              preservation: grouped.Preservation,
            };
          } catch (e) {
            console.warn('Could not parse content as JSON:', e);
            toast.error("Không thể phân tích nội dung chi tiết. Sử dụng giá trị mặc định.");
          }
        }

        const tagIds = data.tags?.map((tag) => tag.id) || [];
        const media = data.media?.map((m) => ({
          url: m.url || "",
          mediaType: ((m as any).mediaType || 'IMAGE').toUpperCase() === "VIDEO" ? MediaType.VIDEO : MediaType.IMAGE,
          description: m.description || "",
        })) || [{ url: "", mediaType: MediaType.IMAGE, description: "" }];

        setHeritage({
          id: heritageId,
          name: data.name || "",
          description: data.description || "",
          content: parsedContent,
          categoryId: data.categoryId || 0,
          media,
          tagIds: tagIds,
          locations:
            data.locations?.map((loc) => ({
              province: loc.province || "",
              district: loc.district || "",
              ward: loc.ward || "",
              addressDetail: loc.addressDetail || "",
              latitude: loc.latitude || 0,
              longitude: loc.longitude || 0,
            })) || [
            {
              province: "",
              district: "",
              ward: "",
              addressDetail: "",
              latitude: 0,
              longitude: 0,
            },
          ],
          occurrences:
            data.occurrences?.map((occ) => ({
              occurrenceType:
                typeof occ.occurrenceTypeName === "string"
                  ? (OccurrenceType[occ.occurrenceTypeName as keyof typeof OccurrenceType] ||
                    OccurrenceType.UNKNOWN)
                  : OccurrenceType.UNKNOWN,
              calendarType:
                typeof occ.calendarTypeName === "string"
                  ? (CalendarType[occ.calendarTypeName as keyof typeof CalendarType] || CalendarType.SOLAR)
                  : CalendarType.SOLAR,
              frequency:
                typeof occ.frequencyName === "string"
                  ? (FestivalFrequency[occ.frequencyName as keyof typeof FestivalFrequency] ||
                    FestivalFrequency.ONETIME)
                  : FestivalFrequency.ONETIME,
              startDay: occ.startDay,
              startMonth: occ.startMonth,
              endDay: occ.endDay,
              endMonth: occ.endMonth,
              description: occ.description,
              recurrenceRule: undefined,
            })) || [
            {
              occurrenceType: OccurrenceType.EXACTDATE,
              calendarType: CalendarType.SOLAR,
              frequency: FestivalFrequency.ONETIME,
              startDay: 1,
              startMonth: 1,
            },
          ],
        });
        setTempTagIds(tagIds);
        setFiles(new Array(data.media?.length || 1).fill(null));

        // Generate thumbnails for existing videos
        const initialThumbs = new Array(media.length).fill("");
        await Promise.all(
          media.map(async (m, i) => {
            if (m.mediaType === MediaType.VIDEO && m.url && !isYouTube(m.url) && !isVimeo(m.url)) {
              try {
                initialThumbs[i] = await generateThumbnail(m.url);
              } catch (err) {
                console.error(`Error generating thumbnail for video ${i}:`, err);
                initialThumbs[i] = "/default-video-thumb.jpg";
              }
            }
          })
        );
        setThumbnails(initialThumbs);
      } else {
        throw new Error("Không thể tải thông tin di sản");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải thông tin di sản");
      onCancel();
    } finally {
      setInitialLoading(false);
    }
  };

  loadData();
}, [heritageId, onCancel]);

  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, heritage.media.length);
  }, [heritage.media.length]);

  useEffect(() => {
    heritage.media.forEach((_, index) => {
      if (videoRefs.current[index] && files[index]) {
        const video = videoRefs.current[index]!;
        video.src = URL.createObjectURL(files[index]!);
        video.load();
        video.onloadeddata = () => {
          if (video.readyState >= 2) {
            video.currentTime = 0.1; 
            video.play().catch(() => {}); 
            video.pause();
          }
        };
      }
    });
  }, [files, heritage.media]);

  const mediaList: Combined[] = heritage.media.map((m, index) => ({
    url: files[index] ? URL.createObjectURL(files[index]!) : m.url,
    description: m.description,
    kind: m.mediaType === MediaType.IMAGE ? "image" : "video",
    id: index,
  }));

  const openAt = (i: number) => {
    setPopupIndex(i);
    setPopupOpen(true);
  };

  const closePopup = () => setPopupOpen(false);

  const next = () => {
    if (!mediaList.length) return;
    setPopupIndex((i) => (i + 1) % mediaList.length);
  };

  const prev = () => {
    if (!mediaList.length) return;
    setPopupIndex((i) => (i - 1 + mediaList.length) % mediaList.length);
  };

  useEffect(() => {
    if (!popupOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popupOpen]);

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
      // Handle locally uploaded video
      return (
        <video
          className="w-full h-full rounded-xl bg-black"
          src={url}
          controls
          autoPlay
          onError={() => {
            console.error("Video failed to load");
          }}
        >
          <source src={url} type="video/mp4" />
        </video>
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

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHeritage((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : value,
    }));
  };

  // Tag modal handlers
  const handleTagToggle = (tagId: number) => {
    setTempTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleApplyTags = () => {
    setHeritage((prev) => ({ ...prev, tagIds: tempTagIds }));
    setIsTagModalOpen(false);
  };

  const handleCancelTags = () => {
    setTempTagIds(heritage.tagIds ?? []);
    setIsTagModalOpen(false);
  };

  type DescKey = keyof HeritageContentRequest;

  const addDescBlock = (key: DescKey, type: "paragraph" | "list") => {
    setHeritage((prev) => {
      const section = [...prev.content[key]];
      section.push(type === "paragraph" ? emptyParagraph() : emptyList());
      return { ...prev, content: { ...prev.content, [key]: section } };
    });
  };

  const removeDescBlock = (key: DescKey, idx: number) => {
    setHeritage((prev) => {
      const section = [...prev.content[key]];
      section.splice(idx, 1);
      return { ...prev, content: { ...prev.content, [key]: section } };
    });
  };

  const updateDescBlock = (key: DescKey, idx: number, block: ContentBlock) => {
    setHeritage((prev) => {
      const section = [...prev.content[key]];
      section[idx] = block;
      return { ...prev, content: { ...prev.content, [key]: section } };
    });
  };

  const handleMediaChange = (index: number, field: keyof MediaRequest, value: any) => {
    setHeritage((prev) => {
      const media = [...prev.media];
      media[index] = { ...media[index], [field]: value };
      return { ...prev, media };
    });
  };

  const handleFileSelect = (index: number, file: File | null) => {
    if (file && file.size > 50 * 1024 * 1024) {
      toast.error("File vượt quá kích thước tối đa 50MB!");
      return;
    }
    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    if (file) {
      if (file.type.startsWith("video/")) {
        handleMediaChange(index, "mediaType", MediaType.VIDEO);
        handleMediaChange(index, "url", "");
      } else if (file.type.startsWith("image/")) {
        handleMediaChange(index, "mediaType", MediaType.IMAGE);
        handleMediaChange(index, "url", "");
      }
    }
  };

  const addMedia = () => {
  setHeritage((prev) => ({
    ...prev,
    media: [...prev.media, { url: "", mediaType: MediaType.IMAGE, description: "" }],
  }));
  setFiles((prev) => [...prev, null]);
  setThumbnails((prev) => [...prev, ""]);
};

const removeMedia = (index: number) => {
  setHeritage((prev) => {
    const media = [...prev.media];
    media.splice(index, 1);
    return { ...prev, media };
  });
  setFiles((prev) => {
    const next = [...prev];
    next.splice(index, 1);
    return next;
  });
  setThumbnails((prev) => {
    const next = [...prev];
    next.splice(index, 1);
    return next;
  });
};

  const handleLocationChange = (
    index: number,
    field: keyof LocationRequest,
    value: any
  ) => {
    setHeritage((prev) => {
      const locations = [...(prev.locations ?? [])];
      locations[index] = { ...locations[index], [field]: value };
      return { ...prev, locations };
    });
  };

  const addLocation = () => {
    setHeritage((prev) => ({
      ...prev,
      locations: [
        ...(prev.locations ?? []),
        { province: "", district: "", ward: "", addressDetail: "", latitude: 0, longitude: 0 },
      ],
    }));
  };

  const removeLocation = (index: number) => {
    setHeritage((prev) => {
      const locations = [...(prev.locations ?? [])];
      locations.splice(index, 1);
      return { ...prev, locations };
    });
  };

  const handleOccurrenceChange = (
    index: number,
    field: keyof OccurrenceRequest,
    value: any
  ) => {
    setHeritage((prev) => {
      const occurrences = [...prev.occurrences];
      occurrences[index] = { ...occurrences[index], [field]: value };
      return { ...prev, occurrences };
    });
  };

  const handleOccurrenceTypeChange = (index: number, value: OccurrenceType) => {
    setHeritage((prev) => {
      const occurrences = [...prev.occurrences];
      const base: OccurrenceRequest = {
        occurrenceType: value,
        calendarType: occurrences[index].calendarType ?? CalendarType.SOLAR,
        frequency: occurrences[index].frequency ?? FestivalFrequency.ONETIME,
        description: occurrences[index].description,
        recurrenceRule: occurrences[index].recurrenceRule,
      };
      if (value === OccurrenceType.EXACTDATE) {
        occurrences[index] = {
          ...base,
          startDay: occurrences[index].startDay ?? 1,
          startMonth: occurrences[index].startMonth ?? 1,
          endDay: undefined,
          endMonth: undefined,
        };
      } else if (value === OccurrenceType.RANGE) {
        occurrences[index] = {
          ...base,
          startDay: occurrences[index].startDay ?? 1,
          startMonth: occurrences[index].startMonth ?? 1,
          endDay: occurrences[index].endDay ?? 2,
          endMonth: occurrences[index].endMonth ?? 1,
        };
      } else if (value === OccurrenceType.RECURRINGRULE) {
        occurrences[index] = {
          ...base,
          startDay: undefined,
          startMonth: undefined,
          endDay: undefined,
          endMonth: undefined,
        };
      } else {
        occurrences[index] = {
          ...base,
          startDay: undefined,
          startMonth: undefined,
          endDay: undefined,
          endMonth: undefined,
        };
      }
      return { ...prev, occurrences };
    });
  };

  const addOccurrence = () => {
    setHeritage((prev) => ({
      ...prev,
      occurrences: [
        ...prev.occurrences,
        {
          occurrenceType: OccurrenceType.EXACTDATE,
          calendarType: CalendarType.SOLAR,
          frequency: FestivalFrequency.ONETIME,
          startDay: 1,
          startMonth: 1,
        },
      ],
    }));
  };

  const removeOccurrence = (index: number) => {
    setHeritage((prev) => {
      const occurrences = [...prev.occurrences];
      occurrences.splice(index, 1);
      return { ...prev, occurrences };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (loading) return;

  if (!heritage.name || heritage.categoryId === 0) {
    toast.error("Vui lòng điền đầy đủ tên di sản và danh mục!");
    return;
  }

  if (heritage.media.length === 0) {
    toast.error("Vui lòng thêm ít nhất một media!");
    return;
  }

  for (let i = 0; i < heritage.media.length; i++) {
    const media = heritage.media[i];
    if (
      media.mediaType === MediaType.VIDEO &&
      media.url && // Only validate if URL exists
      !files[i] && // Skip if no new file is uploaded
      !isYouTube(media.url) &&
      !isVimeo(media.url) &&
      !media.url.startsWith("http") // Allow URLs that are likely from previous uploads
    ) {
      toast.error(`URL video thứ ${i + 1} không hợp lệ (chỉ hỗ trợ YouTube hoặc Vimeo)`);
      return;
    }
  }

  try {
    setLoading(true);
    const data: HeritageUpdateRequest = JSON.parse(JSON.stringify(heritage));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && data.media[i]) {
        if (data.media[i].mediaType === MediaType.IMAGE) {
          const res = await uploadImage(file);
          if (res.code === 200 && res.result) {
            data.media[i].url = res.result;
          } else {
            throw new Error(`Không thể tải lên hình ảnh thứ ${i + 1}`);
          }
        } else if (data.media[i].mediaType === MediaType.VIDEO) {
          const res = await uploadVideo(file);
          if (res.code === 200 && res.result) {
            data.media[i].url = res.result;
          } else {
            throw new Error(`Không thể tải lên video thứ ${i + 1}`);
          }
        }
      }
    }

    const res = await updateHeritage(data);
    if (res?.code === 200) {
      toast.success("Cập nhật di sản thành công!");
      onSuccess();
    } else {
      toast.error(res.message || "Cập nhật di sản thất bại!");
    }
  } catch (error: any) {
    console.error("Update heritage error:", error);
    toast.error(error.message || "Thao tác thất bại. Vui lòng thử lại!");
  } finally {
    setLoading(false);
  }
};

  const renderDescSection = (label: string, key: DescKey) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addDescBlock(key, "paragraph")}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition flex items-center gap-1"
          >
            <Plus size={14} />
            Đoạn văn
          </button>
          <button
            type="button"
            onClick={() => addDescBlock(key, "list")}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition flex items-center gap-1"
          >
            <Plus size={14} />
            Danh sách
          </button>
        </div>
      </div>

      {heritage.content[key].length === 0 && (
        <div className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded">
          Chưa có nội dung nào
        </div>
      )}

      <div className="space-y-3">
        {heritage.content[key].map((blk, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex gap-3 mb-3">
              <select
                value={blk.type}
                onChange={(e) =>
                  updateDescBlock(key, idx, {
                    ...blk,
                    type: e.target.value as ContentBlock["type"],
                    ...(e.target.value === "paragraph"
                      ? { content: blk.content ?? "", items: undefined }
                      : { items: blk.items ?? [], content: undefined }),
                  })
                }
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="paragraph">Đoạn văn</option>
                <option value="list">Danh sách</option>
              </select>

              <button
                type="button"
                onClick={() => removeDescBlock(key, idx)}
                className="ml-auto px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition flex items-center gap-1"
              >
                <Trash2 size={14} />
                Xóa
              </button>
            </div>

            {blk.type === "paragraph" ? (
              <textarea
                value={blk.content ?? ""}
                onChange={(e) => updateDescBlock(key, idx, { ...blk, content: e.target.value })}
                placeholder="Nhập nội dung đoạn văn..."
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            ) : (
              <textarea
                value={(blk.items ?? []).join("\n")}
                onChange={(e) =>
                  updateDescBlock(key, idx, {
                    ...blk,
                    items: e.target.value.split("\n").filter((s) => s.trim() !== ""),
                  })
                }
                placeholder="Mỗi dòng là một mục trong danh sách..."
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderOccurrenceFields = (occ: OccurrenceRequest, index: number) => {
    const commonTop = (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại thời gian</label>
          <select
            value={occ.occurrenceType}
            onChange={(e) =>
              handleOccurrenceTypeChange(index, Number(e.target.value) as OccurrenceType)
            }
            className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(OccurrenceType)
              .filter(([k]) => isNaN(Number(k)))
              .map(([k, v]) => (
                <option key={k} value={v}>
                  {OccurrenceTypeLabels[k] || k}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại lịch</label>
          <select
            value={occ.calendarType ?? ""}
            onChange={(e) =>
              handleOccurrenceChange(index, "calendarType", Number(e.target.value) as CalendarType)
            }
            className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(CalendarType)
              .filter(([k]) => isNaN(Number(k)))
              .map(([k, v]) => (
                <option key={k} value={v}>
                  {CalendarTypeLabels[k] || k}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tần suất</label>
          <select
            value={occ.frequency ?? ""}
            onChange={(e) =>
              handleOccurrenceChange(index, "frequency", Number(e.target.value) as FestivalFrequency)
            }
            className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(FestivalFrequency)
              .filter(([k]) => isNaN(Number(k)))
              .map(([k, v]) => (
                <option key={k} value={v}>
                  {FestivalFrequencyLabels[k] || k}
                </option>
              ))}
          </select>
        </div>
      </>
    );

    if (occ.occurrenceType === OccurrenceType.EXACTDATE) {
      return (
        <>
          {commonTop}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="number"
                min="1"
                max="31"
                value={occ.startDay ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "startDay", Number(e.target.value))}
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tháng bắt đầu</label>
              <input
                type="number"
                min="1"
                max="12"
                value={occ.startMonth ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "startMonth", Number(e.target.value))}
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </>
      );
    }

    if (occ.occurrenceType === OccurrenceType.RANGE) {
      return (
        <>
          {commonTop}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="number"
                min="1"
                max="31"
                value={occ.startDay ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "startDay", Number(e.target.value))}
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tháng bắt đầu</label>
              <input
                type="number"
                min="1"
                max="12"
                value={occ.startMonth ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "startMonth", Number(e.target.value))}
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="number"
                min="1"
                max="31"
                value={occ.endDay ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "endDay", Number(e.target.value))}
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tháng kết thúc</label>
              <input
                type="number"
                min="1"
                max="12"
                value={occ.endMonth ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "endMonth", Number(e.target.value))}
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        {commonTop}
      </>
    );
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin di sản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                disabled={loading}
                className="text-gray-600 hover:text-gray-900 disabled:opacity-50 transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cập Nhật Di Sản</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Chỉnh sửa thông tin chi tiết về di sản
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 transition flex items-center gap-2"
              >
                <X size={18} />
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition flex items-center gap-2"
              >
                <Save size={18} />
                {loading ? "Đang xử lý..." : "Cập nhật di sản"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên di sản <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={heritage.name}
                  onChange={handleBasicChange}
                  className="border border-gray-300 px-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Nhập tên di sản..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={heritage.categoryId}
                  onChange={handleBasicChange}
                  className="border border-gray-300 px-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                >
                  <option value={0}>-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả tổng quát</label>
                <textarea
                  name="description"
                  value={heritage.description}
                  onChange={handleBasicChange}
                  className="border border-gray-300 px-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Nhập mô tả tổng quát..."
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <button
                  type="button"
                  onClick={() => {
                    setTempTagIds(heritage.tagIds ?? []);
                    setIsTagModalOpen(true);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg w-full text-left flex items-center gap-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  aria-label="Select tags for heritage"
                >
                  <Tag size={16} />
                  {heritage.tagIds && heritage.tagIds.length > 0
                    ? `${heritage.tagIds.length} Tag`
                    : "Chọn Tags"}
                </button>
              </div>
            </div>
          </div>

          {/* Tag Selection Modal */}
          {isTagModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-4">Chọn Tags</h3>
                <div className="max-h-64 overflow-y-auto mb-4">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded"
                      aria-label={`Select tag ${tag.name}`}
                    >
                      <input
                        type="checkbox"
                        checked={tempTagIds.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span>{tag.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCancelTags}
                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleApplyTags}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Mô tả chi tiết</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderDescSection("Lịch sử", "history")}
              {renderDescSection("Nghi lễ", "rituals")}
              {renderDescSection("Giá trị", "values")}
              {renderDescSection("Bảo tồn", "preservation")}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Media</h2>
              <button
                type="button"
                onClick={addMedia}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Thêm Media
              </button>
            </div>

            <div className="space-y-4">
              {heritage.media.map((m, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại media
                      </label>
                      <select
                        value={m.mediaType}
                        onChange={(e) =>
                          handleMediaChange(index, "mediaType", Number(e.target.value) as MediaType)
                        }
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(MediaTypeLabels).map(([key, label]) => (
                          <option key={key} value={MediaType[key as keyof typeof MediaType]}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL (nếu có)
                      </label>
                      <input
                        value={m.url}
                        onChange={(e) => handleMediaChange(index, "url", e.target.value)}
                        placeholder={m.mediaType === MediaType.VIDEO ? "https://youtube.com/..." : "https://..."}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={files[index] !== null}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload file
                      </label>
                      <input
                        type="file"
                        accept={m.mediaType === MediaType.IMAGE ? "image/*" : "video/*"}
                        onChange={(e) => handleFileSelect(index, e.target.files?.[0] || null)}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full"
                      />
                    </div>
                  </div>

                  {(m.url || files[index]) && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xem trước
                      </label>
                      <button
                        type="button"
                        onClick={() => openAt(index)}
                        className="relative group overflow-hidden rounded-xl border h-36 w-48"
                        title="Xem media"
                      >
                        {m.mediaType === MediaType.IMAGE ? (
  <img
    src={files[index] ? URL.createObjectURL(files[index]!) : m.url}
    alt="Media preview"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
  />
) : (
  <>
    {files[index] ? (
      <div className="relative w-full h-full">
        <video
          ref={(el) => {
            if (el && !videoRefs.current[index]) {
              videoRefs.current[index] = el;
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          muted
          preload="metadata"
        >
          <source
            src={files[index] ? URL.createObjectURL(files[index]!) : ""}
            type={files[index]?.type || "video/mp4"}
          />
        </video>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/40 rounded-full p-3 transition-transform group-hover:scale-110">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    ) : (
      <img
        src={thumbnails[index] || getVideoThumbnail(m.url) || "/default-video-thumb.jpg"}
        alt="Video preview"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
    )}
  </>
)}
                      </button>
                    </div>
                  )}

                  {heritage.media.length > 1 && (
                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition flex items-center gap-1 ml-auto"
                      >
                        <Trash2 size={14} />
                        Xóa media
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Địa điểm</h2>
              <button
                type="button"
                onClick={addLocation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Thêm địa điểm
              </button>
            </div>

            <div className="space-y-4">
              {heritage.locations && heritage.locations.length > 0 ? (
                heritage.locations.map((loc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tỉnh/Thành phố
                        </label>
                        <input
                          value={loc.province ?? ""}
                          onChange={(e) => handleLocationChange(index, "province", e.target.value)}
                          placeholder="VD: Thừa Thiên Huế"
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quận/Huyện
                        </label>
                        <input
                          value={loc.district ?? ""}
                          onChange={(e) => handleLocationChange(index, "district", e.target.value)}
                          placeholder="VD: Thành phố Huế"
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phường/Xã
                        </label>
                        <input
                          value={loc.ward ?? ""}
                          onChange={(e) => handleLocationChange(index, "ward", e.target.value)}
                          placeholder="VD: Phường Phú Hội"
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ chi tiết
                        </label>
                        <input
                          value={loc.addressDetail ?? ""}
                          onChange={(e) => handleLocationChange(index, "addressDetail", e.target.value)}
                          placeholder="Số nhà, tên đường..."
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vĩ độ</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={loc.latitude}
                          onChange={(e) =>
                            handleLocationChange(index, "latitude", parseFloat(e.target.value))
                          }
                          placeholder="16.4637"
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kinh độ</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={loc.longitude}
                          onChange={(e) =>
                            handleLocationChange(index, "longitude", parseFloat(e.target.value))
                          }
                          placeholder="107.5909"
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    {heritage.locations && heritage.locations.length > 1 && (
                      <div className="mt-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition flex items-center gap-1 ml-auto"
                        >
                          <Trash2 size={14} />
                          Xóa địa điểm
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có địa điểm nào. Nhấn "Thêm địa điểm" để thêm mới.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Thời gian diễn ra</h2>
              <button
                type="button"
                onClick={addOccurrence}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Thêm thời gian
              </button>
            </div>

            <div className="space-y-4">
              {heritage.occurrences.map((occ, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <div className="grid md:grid-cols-3 gap-4">
                    {renderOccurrenceFields(occ, index)}
                  </div>
                  {heritage.occurrences.length > 1 && (
                    <div className="mt-4 pt-3 border-t text-right">
                      <button
                        type="button"
                        onClick={() => removeOccurrence(index)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition flex items-center gap-1 ml-auto"
                      >
                        <Trash2 size={14} />
                        Xóa thời gian
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      {popupOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          <div
            className="relative w-[min(90vw,1000px)] max-h-[85vh] flex items-center justify-center px-12 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopup}
              className="absolute top-3 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white p-2"
              aria-label="Đóng"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

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

            <div className="w-full flex items-center justify-center px-4 py-8">
              {current?.kind === "video" ? (
                <div className="aspect-video w-full max-h-[80vh]">{renderPlayer(current)}</div>
              ) : (
                <div className="w-full flex items-center justify-center">
                  {renderPlayer(current)}
                </div>
              )}
            </div>

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

export default HeritageFormUpdate;