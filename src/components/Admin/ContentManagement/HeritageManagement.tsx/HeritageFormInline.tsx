import React, { useEffect, useState } from "react";
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
  HeritageCreateRequest,
  MediaRequest,
  LocationRequest,
  OccurrenceRequest,
  ContentBlock,
} from "../../../../types/heritage";
import {
  CalendarType,
  OccurrenceType,
  MediaType,
  FestivalFrequency,
} from "../../../../types/enum";
import { Category } from "../../../../types/category";
import { Tag as TagType } from "../../../../types/tag";
import { createHeritage } from "../../../../services/heritageService";
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
    return null;
  }
  if (isVimeo(url)) {
    return "/default-vimeo-thumb.jpg";
  }
  return null;
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

interface HeritageFormInlineProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const HeritageFormInline: React.FC<HeritageFormInlineProps> = ({
  onCancel,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tempTagIds, setTempTagIds] = useState<number[]>([]);

  const [heritage, setHeritage] = useState<HeritageCreateRequest>({
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.result || []);
      } catch (err) {
        console.error("Không thể tải categories:", err);
      }
    };

    const loadTags = async () => {
      try {
        const res = await fetchTags();
        setTags(res.result || []);
      } catch (err) {
        console.error("Không thể tải tags:", err);
      }
    };

    loadCategories();
    loadTags();
  }, []);

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  type DescKey = "history" | "rituals" | "values" | "preservation";

  const addDescBlock = (key: DescKey, type: "paragraph" | "list") => {
    setHeritage((prev) => {
      const arr = [...prev.content[key]];
      arr.push(type === "paragraph" ? emptyParagraph() : emptyList());
      return { ...prev, content: { ...prev.content, [key]: arr } };
    });
  };

  const removeDescBlock = (key: DescKey, idx: number) => {
    setHeritage((prev) => {
      const arr = [...prev.content[key]];
      arr.splice(idx, 1);
      return { ...prev, content: { ...prev.content, [key]: arr } };
    });
  };

  const updateDescBlock = (key: DescKey, idx: number, block: ContentBlock) => {
    setHeritage((prev) => {
      const arr = [...prev.content[key]];
      arr[idx] = block;
      return { ...prev, content: { ...prev.content, [key]: arr } };
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
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File vượt quá kích thước tối đa 5MB!");
      return;
    }
    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    if (file && file.type.startsWith("video/")) {
      handleMediaChange(index, "mediaType", MediaType.VIDEO);
      handleMediaChange(index, "url", "");
    } else if (file && file.type.startsWith("image/")) {
      handleMediaChange(index, "mediaType", MediaType.IMAGE);
      handleMediaChange(index, "url", "");
    }
  };

  const addMedia = () => {
    setHeritage((prev) => ({
      ...prev,
      media: [...prev.media, { url: "", mediaType: MediaType.IMAGE, description: "" }],
    }));
    setFiles((prev) => [...prev, null]);
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
  };

  const handleLocationChange = (index: number, field: keyof LocationRequest, value: any) => {
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

  const handleOccurrenceChange = (index: number, field: keyof OccurrenceRequest, value: any) => {
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
      };
      if (value === OccurrenceType.EXACTDATE) {
        occurrences[index] = { ...base, startDay: 1, startMonth: 1 };
      } else if (value === OccurrenceType.RANGE) {
        occurrences[index] = { ...base, startDay: 1, startMonth: 1, endDay: 2, endMonth: 1 };
      } else if (value === OccurrenceType.RECURRINGRULE) {
        occurrences[index] = { ...base, recurrenceRule: "" };
      } else {
        occurrences[index] = { ...base };
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
      if (media.mediaType === MediaType.VIDEO && media.url && !isYouTube(media.url) && !isVimeo(media.url)) {
        toast.error(`URL video thứ ${i + 1} không hợp lệ (chỉ hỗ trợ YouTube hoặc Vimeo)`);
        return;
      }
    }

    try {
      setLoading(true);
      const data: HeritageCreateRequest = JSON.parse(JSON.stringify(heritage));

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

      const res = await createHeritage(data);
      if (res?.code === 201 || res?.code === 200) {
        toast.success("Tạo di sản thành công!");
        onSuccess();
      } else {
        toast.error(res.message || "Tạo di sản thất bại!");
      }
    } catch (error: any) {
      console.error("Create heritage error:", error);
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

    if (occ.occurrenceType === OccurrenceType.RECURRINGRULE) {
      return (
        <>
          {commonTop}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quy tắc lặp lại</label>
            <input
              value={occ.recurrenceRule ?? ""}
              onChange={(e) => handleOccurrenceChange(index, "recurrenceRule", e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập quy tắc lặp lại..."
            />
          </div>
        </>
      );
    }

    return (
      <>
        {commonTop}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
          <textarea
            value={occ.description ?? ""}
            onChange={(e) => handleOccurrenceChange(index, "description", e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Nhập mô tả thời gian..."
          />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h1 className="text-2xl font-bold text-gray-900">Tạo Di Sản Mới</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Điền thông tin chi tiết về di sản văn hóa
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
                {loading ? "Đang xử lý..." : "Lưu di sản"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
                <textarea
                  name="description"
                  value={heritage.description}
                  onChange={handleBasicChange}
                  placeholder="Nhập mô tả ngắn gọn về di sản..."
                  className="border border-gray-300 px-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>

  {/* Danh sách tag đã chọn */}
  <div className="flex flex-wrap gap-2 mb-2">
    {(heritage.tagIds ?? []).map((id) => {
      const tag = tags.find((t) => t.id === id);
      if (!tag) return null;
      return (
        <span
          key={id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100"
        >
          {tag.name}
          <button
            type="button"
            onClick={() => {
              setHeritage((prev) => ({
                ...prev,
                tagIds: (prev.tagIds ?? []).filter((tid) => tid !== id),
              }));
            }}
            className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            aria-label={`Xóa tag ${tag.name}`}
          >
            <X size={14} />
          </button>
        </span>
      );
    })}
  </div>

  {/* Nút mở modal */}
  <button
    type="button"
    onClick={() => {
      setTempTagIds(heritage.tagIds ?? []);
      setIsTagModalOpen(true);
    }}
    className="px-4 py-2.5 border border-gray-300 rounded-lg w-full text-left flex items-center gap-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  >
    <Tag size={16} />
    {(heritage.tagIds?.length ?? 0) > 0
      ? `Đã chọn ${(heritage.tagIds?.length ?? 0)} tag`
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

          {/* Content Sections */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Nội dung chi tiết</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderDescSection("Lịch sử", "history")}
              {renderDescSection("Nghi lễ", "rituals")}
              {renderDescSection("Giá trị", "values")}
              {renderDescSection("Bảo tồn", "preservation")}
            </div>
          </div>

          {/* Media Section */}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại media</label>
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
                        URL
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
                        accept={m.mediaType === MediaType.IMAGE ? "image/*" : "image/*,video/*"}
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
                              <video
                                src={URL.createObjectURL(files[index]!)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <img
                                src={getVideoThumbnail(m.url) || "/default-video-thumb.jpg"}
                                alt="Video preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/40 rounded-full p-3 transition-transform group-hover:scale-110">
                                <Play className="w-8 h-8 text-white" />
                              </div>
                            </div>
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

          {/* Locations Section */}
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
              {heritage.locations?.map((loc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
                      <input
                        value={loc.province ?? ""}
                        onChange={(e) => handleLocationChange(index, "province", e.target.value)}
                        placeholder="VD: Thừa Thiên Huế"
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                      <input
                        value={loc.district ?? ""}
                        onChange={(e) => handleLocationChange(index, "district", e.target.value)}
                        placeholder="VD: Thành phố Huế"
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
                      <input
                        value={loc.ward ?? ""}
                        onChange={(e) => handleLocationChange(index, "ward", e.target.value)}
                        placeholder="VD: Phường Phú Hội"
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ chi tiết</label>
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
                        onChange={(e) => handleLocationChange(index, "latitude", parseFloat(e.target.value))}
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
                        onChange={(e) => handleLocationChange(index, "longitude", parseFloat(e.target.value))}
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
              ))}
            </div>
          </div>

          {/* Occurrences Section */}
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

      {/* Popup Lightbox for media preview */}
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

export default HeritageFormInline;