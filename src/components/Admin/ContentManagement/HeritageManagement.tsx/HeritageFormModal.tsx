import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
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
import { Tag } from "../../../../types/tag";
import { createHeritage } from "../../../../services/heritageService";
import { uploadImage } from "../../../../services/uploadService";
import { fetchCategories } from "../../../../services/categoryService";
import { fetchTags } from "../../../../services/tagService";
import toast from "react-hot-toast";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";

const emptyParagraph = (): ContentBlock => ({ type: "paragraph", content: "" });
const emptyList = (): ContentBlock => ({ type: "list", items: [] });

interface HeritageFormModalProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const HeritageFormModal: React.FC<HeritageFormModalProps> = ({
  open = true,
  onClose = () => {},
  onSuccess = () => {},
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

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

    if (open) {
      loadCategories();
      loadTags();
    }
  }, [open]);

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setHeritage((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : value,
    }));
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
    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
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

    try {
      setLoading(true);
      const data: HeritageCreateRequest = JSON.parse(JSON.stringify(heritage));

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && data.media[i]?.mediaType === MediaType.IMAGE) {
          const res = await uploadImage(file);
          if (res.code === 200 && res.result) {
            data.media[i].url = res.result;
          }
        }
      }

      const res = await createHeritage(data);
      if (res?.code === 201 || res?.code === 200) {
        toast.success("Tạo di sản thành công!");
        onSuccess();
        onClose();
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-gray-700">{label}</span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={() => addDescBlock(key, "paragraph")}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            + Đoạn văn
          </button>
          <button
            type="button"
            onClick={() => addDescBlock(key, "list")}
            className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
          >
            + Danh sách
          </button>
        </div>
      </div>

      {heritage.content[key].length === 0 && (
        <div className="text-sm text-gray-500 italic">Chưa có mục nào</div>
      )}

      {heritage.content[key].map((blk, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <div className="flex gap-2">
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
              className="border border-gray-300 p-2 rounded text-sm"
            >
              <option value="paragraph">Đoạn văn</option>
              <option value="list">Danh sách</option>
            </select>

            <button
              type="button"
              onClick={() => removeDescBlock(key, idx)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm ml-auto hover:bg-red-600"
            >
              Xóa
            </button>
          </div>

          {blk.type === "paragraph" ? (
            <textarea
              value={blk.content ?? ""}
              onChange={(e) => updateDescBlock(key, idx, { ...blk, content: e.target.value })}
              placeholder="Nội dung đoạn văn…"
              className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
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
              placeholder="Mỗi dòng là 1 mục"
              className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderOccurrenceFields = (occ: OccurrenceRequest, index: number) => {
    const commonTop = (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại thời gian</label>
          <select
            value={occ.occurrenceType}
            onChange={(e) =>
              handleOccurrenceTypeChange(index, Number(e.target.value) as OccurrenceType)
            }
            className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(OccurrenceType)
              .filter(([k]) => isNaN(Number(k)))
              .map(([k, v]) => (
                <option key={k} value={v}>
                  {k}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại lịch</label>
          <select
            value={occ.calendarType ?? ""}
            onChange={(e) =>
              handleOccurrenceChange(index, "calendarType", Number(e.target.value) as CalendarType)
            }
            className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(CalendarType)
              .filter(([k]) => isNaN(Number(k)))
              .map(([k, v]) => (
                <option key={k} value={v}>
                  {k}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tần suất</label>
          <select
            value={occ.frequency ?? ""}
            onChange={(e) =>
              handleOccurrenceChange(index, "frequency", Number(e.target.value) as FestivalFrequency)
            }
            className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(FestivalFrequency)
              .filter(([k]) => isNaN(Number(k)))
              .map(([k, v]) => (
                <option key={k} value={v}>
                  {k}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="number"
                value={occ.startDay ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "startDay", Number(e.target.value))}
                className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tháng bắt đầu</label>
              <input
                type="number"
                value={occ.startMonth ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "startMonth", Number(e.target.value))}
                className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="number"
                value={occ.startDay ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "startDay", Number(e.target.value))}
                className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tháng bắt đầu</label>
              <input
                type="number"
                value={occ.startMonth ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "startMonth", Number(e.target.value))}
                className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="number"
                value={occ.endDay ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "endDay", Number(e.target.value))}
                className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tháng kết thúc</label>
              <input
                type="number"
                value={occ.endMonth ?? ""}
                onChange={(e) => handleOccurrenceChange(index, "endMonth", Number(e.target.value))}
                className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Quy tắc lặp lại</label>
            <input
              value={occ.recurrenceRule ?? ""}
              onChange={(e) => handleOccurrenceChange(index, "recurrenceRule", e.target.value)}
              className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      );
    }

    return (
      <>
        {commonTop}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={occ.description ?? ""}
            onChange={(e) => handleOccurrenceChange(index, "description", e.target.value)}
            className="border border-gray-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
        </div>
      </>
    );
  };

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="xl"
      ariaLabel="Tạo di sản mới"
      centered
      contentClassName="bg-white rounded-2xl shadow-xl w-[90vw] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
    >
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b bg-white">
        <div>
          <h3 className="text-xl font-bold">Tạo Di Sản Mới</h3>
          <p className="text-gray-600 text-sm mt-1">
            Điền thông tin chi tiết về di sản văn hóa
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content - Scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên di sản <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={heritage.name}
                onChange={handleBasicChange}
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={heritage.categoryId}
                onChange={handleBasicChange}
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              name="description"
              value={heritage.description}
              onChange={handleBasicChange}
              placeholder="Nhập mô tả ngắn gọn về di sản..."
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <select
              multiple
              value={(heritage.tagIds ?? []).map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (o) => Number(o.value));
                setHeritage((prev) => ({ ...prev, tagIds: selected }));
              }}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tags.map((tag) => (
                <option key={tag.id} value={String(tag.id)}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Sections */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Nội dung chi tiết</h4>
            <div className="grid md:grid-cols-2 gap-6">
              {renderDescSection("Lịch sử", "history")}
              {renderDescSection("Nghi lễ", "rituals")}
              {renderDescSection("Giá trị", "values")}
              {renderDescSection("Bảo tồn", "preservation")}
            </div>
          </div>

          {/* Media */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Media</label>
              <button
                type="button"
                onClick={addMedia}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                + Thêm Media
              </button>
            </div>

            {heritage.media.map((m, index) => (
              <div key={index} className="space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid md:grid-cols-3 gap-3">
                  <select
                    value={m.mediaType}
                    onChange={(e) =>
                      handleMediaChange(index, "mediaType", Number(e.target.value) as MediaType)
                    }
                    className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(MediaType)
                      .filter(([key]) => isNaN(Number(key)))
                      .map(([key, value]) => (
                        <option key={key} value={value}>
                          {key}
                        </option>
                      ))}
                  </select>

                  <input
                    value={m.url}
                    onChange={(e) => handleMediaChange(index, "url", e.target.value)}
                    placeholder="URL (nếu có)"
                    className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(index, e.target.files?.[0] || null)}
                    className="border border-gray-300 p-2 rounded-lg text-sm"
                  />
                </div>

                <input
                  value={m.description || ""}
                  onChange={(e) => handleMediaChange(index, "description", e.target.value)}
                  placeholder="Mô tả media"
                  className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {heritage.media.length > 1 && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
              <button
                type="button"
                onClick={addLocation}
                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                + Thêm địa điểm
              </button>
            </div>

            {heritage.locations?.map((loc, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <input
                  value={loc.province ?? ""}
                  onChange={(e) => handleLocationChange(index, "province", e.target.value)}
                  placeholder="Tỉnh/Thành phố"
                  className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={loc.district ?? ""}
                  onChange={(e) => handleLocationChange(index, "district", e.target.value)}
                  placeholder="Quận/Huyện"
                  className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={loc.ward ?? ""}
                  onChange={(e) => handleLocationChange(index, "ward", e.target.value)}
                  placeholder="Phường/Xã"
                  className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={loc.addressDetail ?? ""}
                  onChange={(e) => handleLocationChange(index, "addressDetail", e.target.value)}
                  placeholder="Địa chỉ chi tiết"
                  className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={loc.latitude}
                  onChange={(e) => handleLocationChange(index, "latitude", parseFloat(e.target.value))}
                  placeholder="Vĩ độ"
                  className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={loc.longitude}
                  onChange={(e) => handleLocationChange(index, "longitude", parseFloat(e.target.value))}
                  placeholder="Kinh độ"
                  className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {heritage.locations && heritage.locations.length > 1 && (
                  <div className="md:col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      Xóa địa điểm
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Occurrences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Thời gian diễn ra</label>
              <button
                type="button"
                onClick={addOccurrence}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                + Thêm thời gian
              </button>
            </div>

            {heritage.occurrences.map((occ, index) => (
              <div key={index} className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {renderOccurrenceFields(occ, index)}
                {heritage.occurrences.length > 1 && (
                  <div className="text-right pt-2">
                    <button
                      type="button"
                      onClick={() => removeOccurrence(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      Xóa thời gian
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* Footer - Fixed */}
      <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t bg-gray-50">
        <button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Đang xử lý..." : "Tạo di sản"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Hủy
        </button>
      </div>
    </PortalModal>
  );
};

export default HeritageFormModal;