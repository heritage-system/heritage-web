import React, { useEffect, useState } from "react";
import {
  HeritageCreateRequest,
  MediaRequest,
  LocationRequest,
  OccurrenceRequest,
  ContentBlock,
} from "../../types/heritage";
import {
  CalendarType,
  OccurrenceType,
  MediaType,
  FestivalFrequency,
} from "../../types/enum";
import { Category} from "../../types/category"; 
import { Tag } from "../../types/tag"; 
import { createHeritage } from "../../services/heritageService";
import { uploadImage } from "../../services/uploadService";
import { fetchCategories } from "../../services/categoryService";
import { fetchTags } from "../../services/tagService";

const emptyParagraph = (): ContentBlock => ({ type: "paragraph", content: "" });
const emptyList = (): ContentBlock => ({ type: "list", items: [] });

export const HeritageForm: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [heritage, setHeritage] = useState<HeritageCreateRequest>({
    name: "",
    description: {
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


  // ============ load categories + tags ============
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

  // ============ helpers ============
  const [files, setFiles] = useState<(File | null)[]>([null]);

  // ============ helpers set state ============
  const setField = (name: keyof HeritageCreateRequest, value: any) =>
    setHeritage(prev => ({ ...prev, [name]: value }));
  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setHeritage((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : value,
    }));
  };

  const toggleTag = (id: number) => {
    setHeritage((prev) => {
      const tagIds = new Set(prev.tagIds ?? []);
      if (tagIds.has(id)) tagIds.delete(id);
      else tagIds.add(id);
      return { ...prev, tagIds: Array.from(tagIds) };
    });
  };
  

 

  // ============ DESCRIPTION (4 mảng) ============
  type DescKey = "history" | "rituals" | "values" | "preservation";

  const addDescBlock = (key: DescKey, type: "paragraph" | "list") => {
    setHeritage(prev => {
      const arr = [...prev.description[key]];
      arr.push(type === "paragraph" ? emptyParagraph() : emptyList());
      return { ...prev, description: { ...prev.description, [key]: arr } };
    });
  };

  const removeDescBlock = (key: DescKey, idx: number) => {
    setHeritage(prev => {
      const arr = [...prev.description[key]];
      arr.splice(idx, 1);
      return { ...prev, description: { ...prev.description, [key]: arr } };
    });
  };

  const updateDescBlock = (key: DescKey, idx: number, block: ContentBlock) => {
    setHeritage(prev => {
      const arr = [...prev.description[key]];
      arr[idx] = block;
      return { ...prev, description: { ...prev.description, [key]: arr } };
    });
  };

  // ============ MEDIA ============
  const handleMediaChange = (index: number, field: keyof MediaRequest, value: any) => {
    setHeritage(prev => {
      const media = [...prev.media];
      media[index] = { ...media[index], [field]: value };
      return { ...prev, media };
    });
  };

  const handleFileSelect = (index: number, file: File | null) => {
    setFiles(prev => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const addMedia = () => {
    setHeritage(prev => ({ ...prev, media: [...prev.media, { url: "", mediaType: MediaType.IMAGE, description: "" }] }));
    setFiles(prev => [...prev, null]);
  };

  const removeMedia = (index: number) => {
    setHeritage(prev => {
      const media = [...prev.media];
      media.splice(index, 1);
      return { ...prev, media };
    });
    setFiles(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  // ============ LOCATIONS ============
  const handleLocationChange = (index: number, field: keyof LocationRequest, value: any) => {
    setHeritage(prev => {
      const locations = [...(prev.locations ?? [])];
      locations[index] = { ...locations[index], [field]: value };
      return { ...prev, locations };
    });
  };

  const addLocation = () => {
    setHeritage(prev => ({
      ...prev,
      locations: [
        ...(prev.locations ?? []),
        { province: "", district: "", ward: "", addressDetail: "", latitude: 0, longitude: 0 },
      ],
    }));
  };

  const removeLocation = (index: number) => {
    setHeritage(prev => {
      const locations = [...(prev.locations ?? [])];
      locations.splice(index, 1);
      return { ...prev, locations };
    });
  };

  // ============ OCCURRENCES ============
  const handleOccurrenceChange = (index: number, field: keyof OccurrenceRequest, value: any) => {
    setHeritage(prev => {
      const occurrences = [...prev.occurrences];
      occurrences[index] = { ...occurrences[index], [field]: value };
      return { ...prev, occurrences };
    });
  };

  const handleOccurrenceTypeChange = (index: number, value: OccurrenceType) => {
    setHeritage(prev => {
      const occurrences = [...prev.occurrences];
      const base: OccurrenceRequest = {
        occurrenceType: value,
        calendarType: occurrences[index].calendarType ?? CalendarType.SOLAR,
        frequency: occurrences[index].frequency ?? FestivalFrequency.ONETIME,
        description: occurrences[index].description,
      };
      // reset fields theo từng loại
      if (value === OccurrenceType.EXACTDATE) {
        occurrences[index] = { ...base, startDay: 1, startMonth: 1 };
      } else if (value === OccurrenceType.RANGE) {
        occurrences[index] = { ...base, startDay: 1, startMonth: 1, endDay: 2, endMonth: 1 };
      } else if (value === OccurrenceType.RECURRINGRULE) {
        occurrences[index] = { ...base, recurrenceRule: "" };
      } else {
        // APPROXIMATE / UNKNOWN: chỉ giữ description + calendar/frequency nếu anh muốn
        occurrences[index] = { ...base };
      }
      return { ...prev, occurrences };
    });
  };

  const addOccurrence = () => {
    setHeritage(prev => ({
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
    setHeritage(prev => {
      const occurrences = [...prev.occurrences];
      occurrences.splice(index, 1);
      return { ...prev, occurrences };
    });
  };

  // ============ SUBMIT ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: HeritageCreateRequest = JSON.parse(JSON.stringify(heritage));

    // upload các file ảnh (chỉ upload khi mediaType = IMAGE và có file)
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
    console.log("API response:", res);

    // // reset
    // setHeritage({
    //   name: "",
    //   description: {
    //     history: [emptyParagraph()],
    //     rituals: [],
    //     values: [],
    //     preservation: [],
    //   },
    //   categoryId: 0,
    //   media: [{ url: "", mediaType: MediaType.IMAGE, description: "" }],
    //   tagIds: [],
    //   locations: [{ province: "", district: "", ward: "", addressDetail: "", latitude: 0, longitude: 0 }],
    //   occurrences: [
    //     {
    //       occurrenceType: OccurrenceType.EXACTDATE,
    //       calendarType: CalendarType.SOLAR,
    //       frequency: FestivalFrequency.ONETIME,
    //       startDay: 1,
    //       startMonth: 1,
    //     },
    //   ],
    // });
    // setFiles([null]);
  };

  // ============ RENDER UI ============
  const renderDescSection = (label: string, key: DescKey) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block font-medium">{label}</span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={() => addDescBlock(key, "paragraph")}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
          >
            + Paragraph
          </button>
          <button
            type="button"
            onClick={() => addDescBlock(key, "list")}
            className="px-2 py-1 bg-emerald-600 text-white rounded text-sm"
          >
            + List
          </button>
        </div>
      </div>

      {heritage.description[key].length === 0 && (
        <div className="text-sm text-gray-500">Chưa có mục nào</div>
      )}

      {heritage.description[key].map((blk, idx) => (
        <div key={idx} className="border rounded p-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={blk.type}
              onChange={(e) =>
                updateDescBlock(key, idx, {
                  ...blk,
                  type: e.target.value as ContentBlock["type"],
                  // chuyển đổi dữ liệu khi đổi type
                  ...(e.target.value === "paragraph"
                    ? { content: blk.content ?? "", items: undefined }
                    : { items: blk.items ?? [], content: undefined }),
                })
              }
              className="border p-2 rounded"
            >
              <option value="paragraph">paragraph</option>
              <option value="list">list</option>
            </select>

            <button
              type="button"
              onClick={() => removeDescBlock(key, idx)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm ml-auto"
            >
              Xóa
            </button>
          </div>

          {blk.type === "paragraph" ? (
            <textarea
              value={blk.content ?? ""}
              onChange={(e) => updateDescBlock(key, idx, { ...blk, content: e.target.value })}
              placeholder="Nội dung đoạn văn…"
              className="border p-2 rounded w-full"
            />
          ) : (
            <textarea
              value={(blk.items ?? []).join("\n")}
              onChange={(e) => updateDescBlock(key, idx, { ...blk, items: e.target.value.split("\n").filter(s => s.trim() !== "") })}
              placeholder="Mỗi dòng là 1 mục"
              className="border p-2 rounded w-full"
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderOccurrenceFields = (occ: OccurrenceRequest, index: number) => {
  const commonTop = (
    <>
      {/* OccurrenceType */}
      <label className="block font-medium">Occurrence Type</label>
      <select
        value={occ.occurrenceType}
        onChange={(e) =>
          handleOccurrenceTypeChange(index, Number(e.target.value) as OccurrenceType)
        }
        className="border p-2 rounded w-full mb-2"
      >
        {Object.entries(OccurrenceType)
          .filter(([k]) => isNaN(Number(k)))
          .map(([k, v]) => (
            <option key={k} value={v}>
              {k}
            </option>
          ))}
      </select>

      {/* CalendarType */}
      <label className="block font-medium">Calendar Type</label>
      <select
        value={occ.calendarType ?? ""}
        onChange={(e) =>
          handleOccurrenceChange(index, "calendarType", Number(e.target.value) as CalendarType)
        }
        className="border p-2 rounded w-full mb-2"
      >
        {Object.entries(CalendarType)
          .filter(([k]) => isNaN(Number(k)))
          .map(([k, v]) => (
            <option key={k} value={v}>
              {k}
            </option>
          ))}
      </select>

      {/* Frequency */}
      <label className="block font-medium">Frequency</label>
      <select
        value={occ.frequency ?? ""}
        onChange={(e) =>
          handleOccurrenceChange(index, "frequency", Number(e.target.value) as FestivalFrequency)
        }
        className="border p-2 rounded w-full mb-2"
      >
        {Object.entries(FestivalFrequency)
          .filter(([k]) => isNaN(Number(k)))
          .map(([k, v]) => (
            <option key={k} value={v}>
              {k}
            </option>
          ))}
      </select>
    </>
  );

  if (occ.occurrenceType === OccurrenceType.EXACTDATE) {
    return (
      <>
        {commonTop}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-medium">Start Day</label>
            <input
              type="number"
              value={occ.startDay ?? ""}
              onChange={(e) => handleOccurrenceChange(index, "startDay", Number(e.target.value))}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Start Month</label>
            <input
              type="number"
              value={occ.startMonth ?? ""}
              onChange={(e) => handleOccurrenceChange(index, "startMonth", Number(e.target.value))}
              className="border p-2 rounded w-full"
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-medium">Start Day</label>
            <input
              type="number"
              value={occ.startDay ?? ""}
              onChange={(e) => handleOccurrenceChange(index, "startDay", Number(e.target.value))}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Start Month</label>
            <input
              type="number"
              value={occ.startMonth ?? ""}
              onChange={(e) => handleOccurrenceChange(index, "startMonth", Number(e.target.value))}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium">End Day</label>
            <input
              type="number"
              value={occ.endDay ?? ""}
              onChange={(e) => handleOccurrenceChange(index, "endDay", Number(e.target.value))}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium">End Month</label>
            <input
              type="number"
              value={occ.endMonth ?? ""}
              onChange={(e) => handleOccurrenceChange(index, "endMonth", Number(e.target.value))}
              className="border p-2 rounded w-full"
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
        <label className="block font-medium">Recurrence Rule</label>
        <input
          value={occ.recurrenceRule ?? ""}
          onChange={(e) => handleOccurrenceChange(index, "recurrenceRule", e.target.value)}
          className="border p-2 rounded w-full"
        />
      </>
    );
  }

  // APPROXIMATE / UNKNOWN
  return (
    <>
      {commonTop}
      <label className="block font-medium">Description</label>
      <textarea
        value={occ.description ?? ""}
        onChange={(e) => handleOccurrenceChange(index, "description", e.target.value)}
        className="border p-2 rounded w-full"
      />
    </>
  );
};


  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-4xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold">Tạo Heritage mới</h2>

      {/* Basic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Tên</label>
          <input
            name="name"
            value={heritage.name}
            onChange={handleBasicChange}
            className="border p-2 rounded w-full"
          />
        </div>
        {/* Category dropdown */}
        <div>
          <label className="block font-medium">Category</label>
          <select
            name="categoryId"
            value={heritage.categoryId}
            onChange={handleBasicChange}
            className="border p-2 rounded w-full"
          >
            <option value={0}>-- Chọn category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

     {/* Tags multi-select */}
      <select
        multiple
        value={(heritage.tagIds ?? []).map(String)} // ép sang string[]
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, (o) => Number(o.value));
          setHeritage((prev) => ({ ...prev, tagIds: selected }));
        }}
        className="border p-2 rounded w-full h-32"
      >
        {tags.map((tag) => (
          <option key={tag.id} value={String(tag.id)}>
            {tag.name}
          </option>
        ))}
      </select>



      {/* Description */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderDescSection("History", "history")}
        {renderDescSection("Rituals", "rituals")}
        {renderDescSection("Values", "values")}
        {renderDescSection("Preservation", "preservation")}
      </div>

      {/* Occurrences */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block font-medium">Occurrences</label>
          <button type="button" onClick={addOccurrence} className="px-3 py-1 bg-purple-600 text-white rounded">
            + Thêm Occurrence
          </button>
        </div>

        {heritage.occurrences.map((occ, index) => (
          <div key={index} className="space-y-3 mb-4 border p-3 rounded">
            {renderOccurrenceFields(occ, index)}
            {heritage.occurrences.length > 1 && (
              <div className="text-right">
                <button type="button" onClick={() => removeOccurrence(index)} className="px-3 py-1 bg-red-500 text-white rounded">
                  Xóa occurrence
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Media */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block font-medium">Media</label>
          <button type="button" onClick={addMedia} className="px-3 py-1 bg-blue-600 text-white rounded">
            + Thêm Media
          </button>
        </div>
        {heritage.media.map((m, index) => (
          <div key={index} className="space-y-2 mb-4 border p-3 rounded">
            <div className="grid md:grid-cols-3 gap-3">
              <select
  value={m.mediaType}
  onChange={(e) =>
    handleMediaChange(index, "mediaType", Number(e.target.value) as MediaType)
  }
>
  {Object.entries(MediaType)
    .filter(([key]) => isNaN(Number(key))) // bỏ key số
    .map(([key, value]) => (
      <option key={key} value={value}>
        {key}
      </option>
    ))}
</select>

              <input
                value={m.url}
                onChange={(e) => handleMediaChange(index, "url", e.target.value)}
                placeholder="Hoặc nhập URL trực tiếp"
                className="border p-2 rounded w-full"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(index, e.target.files?.[0] || null)}
                className="border p-2 rounded w-full"
              />
            </div>

            <input
              value={m.description || ""}
              onChange={(e) => handleMediaChange(index, "description", e.target.value)}
              placeholder="Mô tả"
              className="border p-2 rounded w-full"
            />

            {heritage.media.length > 1 && (
              <div className="text-right">
                <button type="button" onClick={() => removeMedia(index)} className="px-3 py-1 bg-red-500 text-white rounded">
                  Xóa media
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Locations */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block font-medium">Locations</label>
          <button type="button" onClick={addLocation} className="px-3 py-1 bg-green-600 text-white rounded">
            + Thêm Location
          </button>
        </div>

        {heritage.locations?.map((loc, index) => (
          <div key={index} className="grid md:grid-cols-2 gap-3 mb-3 border rounded p-3">
            <input
              value={loc.province ?? ""}
              onChange={(e) => handleLocationChange(index, "province", e.target.value)}
              placeholder="Province"
              className="border p-2 rounded"
            />
            <input
              value={loc.district ?? ""}
              onChange={(e) => handleLocationChange(index, "district", e.target.value)}
              placeholder="District"
              className="border p-2 rounded"
            />
            <input
              value={loc.ward ?? ""}
              onChange={(e) => handleLocationChange(index, "ward", e.target.value)}
              placeholder="Ward"
              className="border p-2 rounded"
            />
            <input
              value={loc.addressDetail ?? ""}
              onChange={(e) => handleLocationChange(index, "addressDetail", e.target.value)}
              placeholder="Address detail"
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="0.0001"
              value={loc.latitude}
              onChange={(e) => handleLocationChange(index, "latitude", parseFloat(e.target.value))}
              placeholder="Latitude"
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="0.0001"
              value={loc.longitude}
              onChange={(e) => handleLocationChange(index, "longitude", parseFloat(e.target.value))}
              placeholder="Longitude"
              className="border p-2 rounded"
            />
            {heritage.locations && heritage.locations.length > 1 && (
              <div className="md:col-span-2 text-right">
                <button type="button" onClick={() => removeLocation(index)} className="px-3 py-1 bg-red-500 text-white rounded">
                  Xóa location
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      

      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold">
          Tạo Heritage
        </button>
      </div>
    </form>
  );
};

export default HeritageForm;
