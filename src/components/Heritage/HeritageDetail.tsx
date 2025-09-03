import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Heart,
  Share2,
  Clock,
  Users,
  ChevronLeft,
  Bookmark,
  Play,
  Image as ImageIcon,
  Compass,
  Tag,
  ChevronDown,
} from "lucide-react";
import { HeritageSearchResponse } from '../../types/heritage'; // <-- import interface từ file types

interface Props {
  heritage: HeritageSearchResponse;
  onBack?: () => void;
}

const calendarLabel: Record<string, string> = {
  SOLAR: "Dương lịch",
  LUNAR: "Âm lịch",
};

const frequencyLabel: Record<string, string> = {
  ONETIME: "Một lần",
  ANNUAL: "Hằng năm",
  SEASONAL: "Theo mùa",
  MONTHLY: "Hằng tháng"  
};

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }>
  = ({ title, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border p-5">
    <header className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {right}
    </header>
    <div>{children}</div>
  </section>
);

const Pill: React.FC<{ children: React.ReactNode }>=({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-gray-700">
    {children}
  </span>
);

const Divider: React.FC = () => <div className="h-px bg-gray-100"/>;

// Accordion siêu gọn
const QAItem: React.FC<{ q: string; a: string }>=({ q, a })=>{
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={()=>setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="font-medium text-gray-900">{q}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open?"rotate-180":""}`} />
      </button>
      {open && <p className="pb-4 text-gray-700 leading-relaxed">{a}</p>}
    </div>
  );
};

export const HeritageDetail: React.FC<Props> = ({ heritage, onBack }) => {
  const [tab, setTab] = useState<"history"|"rituals"|"values"|"preservation">("history");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const heroImage = useMemo(()=> heritage.media?.find(m=> m.mediaTypeName?.toLowerCase()==="image")?.url,
    [heritage.media]);
  const images = useMemo(()=> heritage.media?.filter(m=> m.mediaTypeName?.toLowerCase()==="image") || [], [heritage.media]);
  const videos = useMemo(()=> heritage.media?.filter(m=> m.mediaTypeName?.toLowerCase()==="video") || [], [heritage.media]);
  const firstOcc = heritage.heritageOccurrences?.[0];
  const firstLoc = heritage.heritageLocations?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER / HERO */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 pointer-events-none rounded-b-3xl"/>
        <div className="h-[280px] md:h-[360px] w-full overflow-hidden rounded-b-3xl">
          {heroImage ? (
            <img src={heroImage} alt={heritage.name}
                 className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-400"/>
            </div>
          )}
        </div>

        {/* Top bar */}
        <div className="absolute top-4 inset-x-0">
          <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 hover:bg-white px-3 py-1.5 text-gray-700 shadow-sm backdrop-blur"
            >
              <ChevronLeft className="w-4 h-4"/>
              Quay lại
            </button>
            <div className="flex items-center gap-2">
              <button onClick={()=>setBookmarked(!bookmarked)}
                      className={`rounded-full bg-white/80 hover:bg-white p-2 shadow-sm backdrop-blur ${bookmarked?"text-yellow-600":"text-gray-700"}`}>
                <Bookmark className="w-5 h-5"/>
              </button>
              <button className="rounded-full bg-white/80 hover:bg-white p-2 text-gray-700 shadow-sm backdrop-blur">
                <Share2 className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </div>

        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .4 }}
          className="-mt-16 md:-mt-12 relative"
        >
          <div className="mx-auto max-w-6xl px-4">
            <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{heritage.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                    {firstLoc && (
                      <Pill>
                        <MapPin className="w-4 h-4"/> {firstLoc.province}{firstLoc.district?`, ${firstLoc.district}`:""}
                      </Pill>
                    )}
                    {firstOcc && (
                      <Pill>
                        <Calendar className="w-4 h-4"/>
                        {firstOcc.startDay}/{firstOcc.startMonth} ({calendarLabel[firstOcc.calendarTypeName] || firstOcc.calendarTypeName})
                      </Pill>
                    )}
                    <Pill>
                      <Users className="w-4 h-4"/> {heritage.categoryName || "Danh mục"}
                    </Pill>
                    {heritage.isFeatured && <Pill>⭐ Nổi bật</Pill>}
                  </div>

                  {/* Tags */}
                  {heritage.heritageTags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {heritage.heritageTags.map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full border border-yellow-100">
                          <Tag className="w-3 h-3"/> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={()=>setLiked(!liked)}
                  className={`self-start inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${liked?"bg-red-50 border-red-200 text-red-600":"bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  <Heart className={`w-5 h-5 ${liked?"fill-current":""}`}/>
                  {liked?"Đã thích":"Yêu thích"}
                </button>
              </div>

              {/* Quick intro */}
              {heritage.description && (
                <p className="mt-3 text-gray-700 leading-relaxed">
                  {heritage.description}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* MAIN GRID */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs: Lịch sử | Nghi lễ | Giá trị | Bảo tồn */}
          <SectionCard
            title="Nội dung di sản"
            right={
              <div className="grid grid-cols-2 sm:flex gap-2 bg-gray-50 p-1 rounded-xl border">
                {([
                  { key: "history", label: "Lịch sử" },
                  { key: "rituals", label: "Nghi lễ" },
                  { key: "values", label: "Giá trị" },
                  { key: "preservation", label: "Bảo tồn" },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={()=>setTab(key)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition ${tab===key?"bg-white shadow-sm border":"text-gray-600 hover:text-gray-900"}`}
                  >{label}</button>
                ))}
              </div>
            }
          >
            <div className="prose max-w-none prose-p:leading-relaxed">
              {tab === "history" && (
                <p>
                  {/* Placeholder — nối API trường lịch sử nếu có */}
                  Phần lịch sử của di sản sẽ trình bày nguồn gốc hình thành, các mốc thời gian quan trọng, và bối cảnh văn hóa – xã hội.
                </p>
              )}
              {tab === "rituals" && (
                <p>
                  Mô tả nghi lễ chính, trình tự tiến hành, các nhân vật/đội hình tham gia, trang phục – đạo cụ và ý nghĩa biểu tượng.
                </p>
              )}
              {tab === "values" && (
                <p>
                  Trình bày giá trị văn hóa, lịch sử, tín ngưỡng, giáo dục và du lịch mà di sản đem lại cho cộng đồng.
                </p>
              )}
              {tab === "preservation" && (
                <p>
                  Các hoạt động bảo tồn, truyền dạy, công nhận, hồ sơ UNESCO (nếu có), thách thức và giải pháp bền vững.
                </p>
              )}
            </div>
          </SectionCard>

          {/* Media Gallery (Ảnh & Video) */}
          <SectionCard title="Media Gallery" right={<span className="text-sm text-gray-500">{images.length} ảnh · {videos.length} video</span>}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.slice(0, 5).map((m)=> (
                <figure key={`img-${m.id}`} className="relative group overflow-hidden rounded-xl border">
                  <img src={m.url} alt={m.description || heritage.name} className="w-full h-36 object-cover group-hover:scale-105 transition-transform"/>
                </figure>
              ))}
              {videos.slice(0, 2).map((v)=> (
                <a key={`vid-${v.id}`} href={v.url} target="_blank" rel="noreferrer"
                   className="relative overflow-hidden rounded-xl border h-36 flex items-center justify-center bg-black/80 text-white group">
                  <Play className="w-8 h-8"/>
                  <span className="sr-only">Xem video</span>
                </a>
              ))}
              {(images.length===0 && videos.length===0) && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  Chưa có media để hiển thị.
                </div>
              )}
            </div>
          </SectionCard>

          {/* FAQ + Reviews + Liên quan */}
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard title="FAQ (Hỏi đáp)">
              <div>
                <QAItem q="Lễ hội diễn ra vào thời gian nào?"
                        a="Thông thường bắt đầu vào ngày {startDay}/{startMonth} theo {lịch}, tùy từng năm có thể thay đổi."/>
                <QAItem q="Địa điểm tổ chức ở đâu?"
                        a="{địa điểm chi tiết} — kèm hướng dẫn di chuyển và gửi xe nếu có."/>
                <QAItem q="Có nên đặt lịch/đặt chỗ trước?" a="Khuyến nghị trong mùa cao điểm, nên xem thông báo của BTC."/>
              </div>
            </SectionCard>

            <SectionCard title="Đánh giá (Review)" right={<a href="#reviews" className="text-sm text-yellow-700 hover:underline">Xem tất cả</a>}>
              <div className="text-gray-600 text-sm">
                Tích hợp component ReviewList tại đây (gọi API riêng theo heritageId). Hiển thị 2–3 review mới nhất và rating tổng.
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Di sản liên quan">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Placeholder: map các heritage liên quan */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-xl p-3 hover:shadow-sm transition bg-white">
                  <div className="h-28 bg-gray-100 rounded-lg mb-2"/>
                  <div className="font-medium text-gray-900">Tên di sản liên quan {i+1}</div>
                  <div className="text-sm text-gray-500">Địa điểm • Thời gian</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <SectionCard title="Thông tin nhanh">
            <ul className="text-sm text-gray-700 space-y-2">
              {firstOcc && (
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5"/>
                  <span>
                    Bắt đầu: <b>{firstOcc.startDay}/{firstOcc.startMonth}</b> · {calendarLabel[firstOcc.calendarTypeName] || firstOcc.calendarTypeName}
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5"/> <span>Tần suất: {frequencyLabel[firstOcc?.frequencyName || "—"]}</span></li>
              <li className="flex items-start gap-2"><Users className="w-4 h-4 mt-0.5"/> <span>Danh mục: {heritage.categoryName || "—"}</span></li>
              {firstLoc && (
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5"/> <span>{firstLoc.addressDetail}, {firstLoc.ward}, {firstLoc.district}, {firstLoc.province}</span></li>
              )}
            </ul>
          </SectionCard>

          <SectionCard title="Bản đồ & chỉ đường" right={heritage.mapUrl && <a href={heritage.mapUrl} target="_blank" className="text-sm text-yellow-700 hover:underline" rel="noreferrer">Mở bản đồ</a>}>
            {heritage.mapUrl ? (
              <a href={heritage.mapUrl} target="_blank" rel="noreferrer" className="block">
                <div className="h-48 w-full bg-gray-100 rounded-xl flex items-center justify-center">
                  <Compass className="w-6 h-6 text-gray-500"/>
                  <span className="sr-only">Mở bản đồ</span>
                </div>
              </a>
            ) : (
              <div className="h-48 w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                Chưa có liên kết bản đồ.
              </div>
            )}
          </SectionCard>

          <SectionCard title="Chia sẻ & Theo dõi" right={null}>
            <div className="flex items-center gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
                <Share2 className="w-4 h-4"/> Chia sẻ
              </button>
              <button className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm ${liked?"bg-red-50 border-red-200 text-red-600":"hover:bg-gray-50"}`} onClick={()=>setLiked(!liked)}>
                <Heart className="w-4 h-4"/> {liked?"Đã thích":"Yêu thích"}
              </button>
              <button className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm ${bookmarked?"bg-yellow-50 border-yellow-200 text-yellow-700":"hover:bg-gray-50"}`} onClick={()=>setBookmarked(!bookmarked)}>
                <Bookmark className="w-4 h-4"/> Lưu
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Nguồn tham khảo & Liên hệ">
            <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
              <li>Ban tổ chức lễ hội (số điện thoại, email)</li>
              <li>Tài liệu/website chính thức (nếu có)</li>
              <li>Liên hệ chính quyền địa phương</li>
            </ul>
          </SectionCard>
        </div>
      </div>  
    </div>
  );
};

export default HeritageDetail;
