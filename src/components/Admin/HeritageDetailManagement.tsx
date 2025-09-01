// src/pages/Admin/HeritageDetailPage.tsx
import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Tag,
  CalendarDays,
  Image as ImageIcon,
  Star,
  ArrowLeft,
  ExternalLink,
  Trash2,
  Pencil,
} from "lucide-react";
import HeritageAdminPanel from "../../pages/AdminPage/AdminPage";
import { fetchHeritageDetail, deleteHeritage } from "../../services/heritageService";
import { HeritageDetail } from "../../types/heritage";

interface Occurrence {
  id: number;
  occurrenceType: string;
  calendarType: string;
  startDay: number;
  startMonth: number;
  frequency: string;
  description: string;
}

interface Props {
  occurrences: Occurrence[];
}


const safeParseDescription = (desc?: string) => {
  if (!desc) return null;
  try {
    return JSON.parse(desc);
  } catch (e) {
    // nếu không phải JSON thì trả về đoạn văn thô
    return { raw: desc };
  }
};

const SmallMeta: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-gray-600 dark:text-gray-300">{children}</div>
);

const Pill: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <span
    className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border ${
      color === "purple"
        ? "bg-purple-50 text-purple-700 border-purple-200"
        : color === "blue"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-gray-50 text-gray-700 border-gray-200"
    }`}
  >
    {children}
  </span>
);

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex gap-3 items-start">
    <div className="w-32 text-gray-500 dark:text-gray-300 font-medium">{label}</div>
    <div className="flex-1 text-gray-700 dark:text-gray-200">{value ?? <span className="italic text-gray-400">—</span>}</div>
  </div>
);

const HeritageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [heritage, setHeritage] = useState<HeritageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchHeritageDetail(Number(id));
        // resp could be ApiResponse<HeritageDetail> or direct; handle both
        const data = (resp as any).result ?? resp;
        if (mounted) setHeritage(data ?? null);
      } catch (err) {
        console.error("Error loading heritage:", err);
        if (mounted) setHeritage(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // const handleDelete = async () => {
  //   if (!heritage) return;
  //   const ok = window.confirm(`Bạn có chắc chắn muốn xoá di sản "${heritage.name}" (ID: ${heritage.id})?`);
  //   if (!ok) return;
  //   try {
  //     setDeleting(true);
  //     // deleteHeritage should use your fetchInterceptor and return ApiResponse or throw
  //     await deleteHeritage(heritage.id);
  //     alert("Xoá di sản thành công");
  //     navigate("/admin");
  //   } catch (err: any) {
  //     console.error(err);
  //     alert(err?.message || "Xoá di sản thất bại");
  //   } finally {
  //     setDeleting(false);
  //   }
  // };

  // const handleEdit = () => {
  //   if (!heritage) return;
  //   navigate(`/admin/heritage/edit/${heritage.id}`);
  // };

  if (loading)
    return (
      <HeritageAdminPanel>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </HeritageAdminPanel>
    );

  if (!heritage)
    return (
      <HeritageAdminPanel>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Không tìm thấy di sản</p>
            <button
              onClick={() => navigate("/admin")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              <ArrowLeft size={16} /> Quay về
            </button>
          </div>
        </div>
      </HeritageAdminPanel>
    );

  const descParsed = safeParseDescription(heritage.description);

  return (
    <HeritageAdminPanel>
      <div className="p-6 space-y-6">
        {/* Nav */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-900 hover:bg-gray-200"
            >
              <ArrowLeft size={16} /> Quay về
            </button>
            <h1 className="text-2xl font-bold">{heritage.name}</h1>
            {heritage.isFeatured && (
              <Pill color="blue">
                <Star className="w-4 h-4 text-yellow-500" /> Nổi bật
              </Pill>
            )}
          </div>

          {/* <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50"
            >
              <Pencil size={16} /> Sửa
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-3 py-2 rounded border border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              {deleting ? "Đang xoá..." : "Xoá"}
            </button>
          </div> */}
        </div>

        {/* Summary card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DetailRow label="Danh mục" value={<Pill color="purple">{heritage.categoryName}</Pill>} />
                <DetailRow label="ID" value={heritage.id} />
                <DetailRow label="Nổi bật" value={heritage.isFeatured ? "Có" : "Không"} />
                <DetailRow
                  label="Bản đồ"
                  value={
                    heritage.mapUrl ? (
                      <a
                        href={heritage.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        Mở bản đồ <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="italic text-gray-400">Không có</span>
                    )
                  }
                />
              </div>

              <div>
                <DetailRow label="Tạo" value={new Date(heritage.createdAt).toLocaleString()} />
                <DetailRow label="Cập nhật" value={new Date(heritage.updatedAt).toLocaleString()} />
                <DetailRow label="Số ảnh" value={heritage.media?.length ?? 0} />
                <DetailRow label="Số tag" value={heritage.tags?.length ?? 0} />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-base font-semibold mb-2">Mô tả</h3>
              {/* Nếu descParsed.raw là string hiển thị raw, nếu object hiển thị structured */}
              {descParsed == null ? (
                <div className="text-sm text-gray-500 italic">Không có mô tả</div>
              ) : (descParsed as any).raw ? (
                <div className="prose prose-sm dark:prose-invert">{(descParsed as any).raw}</div>
              ) : (
                <div className="space-y-4">
                  {["history", "rituals", "values", "preservation"].map((key) => {
                    const blocks = (descParsed as any)[key];
                    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;
                    return (
                      <section key={key}>
                        <h4 className="text-sm font-semibold capitalize mb-2">{key}</h4>
                        <div className="prose prose-sm dark:prose-invert">
                          {blocks.map((b: any, idx: number) =>
                            b.type === "paragraph" ? (
                              <p key={idx}>{b.content}</p>
                            ) : b.type === "list" ? (
                              <ul key={idx} className="list-disc pl-5">
                                {b.items?.map((it: string, i: number) => (
                                  <li key={i}>{it}</li>
                                ))}
                              </ul>
                            ) : null
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column: media + tags */}
          {/* Right column: media + tags + occurrences */}
        <aside className="space-y-4">
          {/* Media */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-500" />
                <h4 className="font-semibold">Media</h4>
              </div>
              <div className="text-sm text-gray-500">{heritage.media?.length ?? 0}</div>
            </div>
            {heritage.media && heritage.media.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {heritage.media.map((m) => (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded overflow-hidden border border-gray-100 dark:border-gray-700"
                  >
                    {m.mediaType?.toUpperCase() === "IMAGE" ? (
                      <img src={m.url} alt={m.mediaType || heritage.name} className="w-full h-36 object-cover" />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-500">
                        <PlayPlaceholder />
                      </div>
                    )}
                    <div className="p-2 text-xs text-gray-600 dark:text-gray-300">{m.url}</div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">Không có media</div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={18} className="text-purple-600" />
              <h4 className="font-semibold">Tags</h4>
            </div>
            {heritage.tags && heritage.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {heritage.tags.map((t) => (
                  <Pill key={t.id} color="purple">
                    #{t.name}
                  </Pill>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">Không có tag</div>
            )}
          </div>

          {/* Occurrences */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={18} className="text-orange-500" />
              <h3 className="font-semibold">Thời gian diễn ra</h3>
            </div>
            {heritage.occurrences && heritage.occurrences.length > 0 ? (
              <div className="grid grid-cols-1  gap-4">
                {heritage.occurrences.map((o) => (
                  <div
                    key={o.id}
                    className="border rounded-xl p-4 flex flex-col items-center text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-white dark:bg-gray-700 border shadow-md rounded-xl px-4 py-2">
                        <div className="text-3xl font-bold text-blue-600">{o.startDay}</div>
                        <div className="text-sm uppercase text-gray-500">Tháng {o.startMonth}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 font-semibold">
                      {o.occurrenceType === "EXACTDATE" ? "Ngày cố định" : o.occurrenceType}
                    </p>
                    <p className="text-sm text-gray-500">
                      {o.calendarType === "LUNAR" ? "Âm lịch" : "Dương lịch"}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {o.frequency === "ANNUAL" ? "Hằng năm" : o.frequency}
                    </p>
                    {o.description && (
                      <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">{o.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">Không có thông tin</div>
            )}
          </div>
        </aside>

        </div>

        {/* Locations */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-green-600" />
            <h3 className="font-semibold">Địa chỉ</h3>
          </div>
          {heritage.locations && heritage.locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heritage.locations.map((loc, i) => {
                const line = [loc.addressDetail, loc.ward, loc.district, loc.province].filter(Boolean).join(", ");
                const coords = loc.latitude && loc.longitude ? `${loc.latitude},${loc.longitude}` : null;
                const mapsHref = coords
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(line)}`;
                return (
                  <div key={i} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                    <div className="font-medium">{line || "—"}</div>
                    {coords && <div className="text-xs text-gray-500 mt-1">Lat: {loc.latitude}, Lng: {loc.longitude}</div>}
                    <a href={mapsHref} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:underline text-sm">
                      Mở trên bản đồ <ExternalLink size={14} />
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">Không có địa chỉ</div>
          )}
        </div>

        
      </div>
    </HeritageAdminPanel>
  );
};

export default HeritageDetailPage;

/* ---------- small helper ---------- */
function PlayPlaceholder() {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M14.5 12L8.5 15.5V8.5L14.5 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="text-xs">Video</div>
    </div>
  );
}
