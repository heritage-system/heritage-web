import React, { useRef, useState } from "react";
import { predictHeritage } from "../../services/AIpredictService";
import LensCanvas from "../../components/Discovery/LensCanvas";
import DiscoveryAIUploader from "../../components/Discovery/DiscoveryAIUploader";
import { PredictResponse } from "../../types/AIpredict";
import AnimeGirlMascot, { GirlStatus } from "../../components/Mascot/AnimeGirlMascot";
import { useNavigate } from "react-router-dom";

type LayoutMode = "pre" | "post"; // pre: trước khi tìm; post: sau khi có kết quả

const AIpredictLensPage: React.FC = () => {
  const navigate = useNavigate();
   
const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutMode>("pre");
  const [status, setStatus] = useState<GirlStatus>("idle");
  const [expression, setExpression] = useState<string>("🙂 Sẵn sàng!");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [results, setResults] = useState<PredictResponse | null>(null);
const [fullImgUrl, setFullImgUrl] = useState<string | null>(null); // original image URL (never revoke until replaced)
const [cropUrl, setCropUrl] = useState<string | null>(null);       // latest crop preview URL (safe to revoke on replace)


  // Gửi file/ảnh đầy đủ
  const runPredictFile = async (file: File) => {
  setStatus("loading"); // 👈 LOADING while waiting
  setExpression("🔎 Đang nhận diện...");
  try {
    const res = await predictHeritage(file, { top_k: 20, results: 5, threshold: 0.65 });
    if (res.result) {
      setResults(res.result);
      setLayout("post");  // show POST layout

      // 👇 Mood = happy/unhappy depending on data
      if (res.result.matches.length) {
        setStatus("data");    // happy
        setExpression("🎉 Tìm thấy kết quả!");
      } else {
        setStatus("nodata");  // unhappy
        setExpression("😿 Không tìm thấy phù hợp");
      }
    } else {
      setStatus("idle");
      setExpression("⚠️ Không thể nhận diện ảnh");
    }
  } catch (e) {
    console.error(e);
    setStatus("idle");
    setExpression("⚠️ Lỗi khi gọi AI");
  }
};

const runPredictBlob = async (blob: Blob) => {
  const file = new File([blob], `lens-crop-${Date.now()}.png`, { type: "image/png" });

  // Create a NEW crop preview URL and replace the previous cropUrl only
  const url = URL.createObjectURL(blob);
  if (cropUrl) URL.revokeObjectURL(cropUrl);
  setCropUrl(url);
  setImgUrl(url);

  await runPredictFile(file); // this will setLayout("post")
};


  // Bố cục responsive theo yêu cầu:
  // - PRE: khu làm việc (canvas) 8/10; trong đó canvas (ảnh) 6/10 & model 2/10; sidebar phải 2/10.
  // - POST: trái 6/10 (trên ảnh, dưới model), phải 4/10 là kết quả.
  const wrapperClass = "min-h-screen bg-gray-50 mt-16";
  const containerClass = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6";

  return (
    <div className={wrapperClass}>
      <main className={containerClass}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Tìm kiếm bằng <span className="bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-gray-600">Chọn ảnh/kéo thả, vẽ vùng cần tìm </p>
        </div>

        {/* -------- PRE LAYOUT -------- */}
        {layout === "pre" && (
          <div className="flex gap-4">
            {/* Khu làm việc 8/10 */}
            <section className="w-4/5">
              <div className="flex gap-4">
                {/* Ảnh/canvas 6 phần */}
                <div className="basis-3/4">
           <LensCanvas
  imageUrl={imgUrl}
onImageSelected={(file) => {
  const url = URL.createObjectURL(file);
  if (fullImgUrl) URL.revokeObjectURL(fullImgUrl);
  setFullImgUrl(url);
  setImgUrl(url);
  if (cropUrl) { URL.revokeObjectURL(cropUrl); setCropUrl(null); }

  setResults(null);
  setLayout("pre");
  setStatus("idle"); // 👈 NORMAL in PRE
  setExpression("🖼️ Ảnh đã sẵn sàng, hãy khoanh vùng để tìm!");
}}

 onCropPreview={(url) => {
  // Replace the transient crop URL only
  if (cropUrl) URL.revokeObjectURL(cropUrl);
  setCropUrl(url);
  setImgUrl(url);  // show the crop preview now
}}

  onCropConfirm={runPredictBlob}
  onStatus={(s) => {
    if (s === "selecting") setExpression("📐 Đang chọn vùng...");
    else if (s === "ready") setExpression("✅ Vùng đã sẵn sàng, bấm Dự đoán!");
    else setExpression("🙂 Sẵn sàng!");
  }}
/>

                </div>

                {/* Model 2 phần (panel phải của khu làm việc) */}
                <aside className="basis-1/4">
                  <div className="h-[70vh] rounded-2xl border bg-white shadow flex flex-col">
                    <div className="p-3 border-b">
                      <h3 className="font-semibold">Model</h3>
                      <p className="text-xs text-gray-500">Placeholder biểu cảm & trạng thái</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <AnimeGirlMascot status={status} />
                    </div>
                    <div className="p-3 border-t text-sm">
                      <div className="font-medium mb-1">Trạng thái</div>
                      <div className="text-gray-700">{expression}</div>
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            {/* Sidebar phải 2/10 (gợi ý/trạng thái) */}
          {/* Sidebar phải 2/10: Gợi ý (chưa có kết quả) / Kết quả (sau khi search) */}
<aside className="w-1/5">
  <div className="h-[70vh] rounded-2xl border bg-white shadow p-3 overflow-auto">
    {!results ? (
      <>
        <div className="font-semibold mb-2">Gợi ý</div>
        <ul className="text-sm list-disc pl-4 space-y-1 text-gray-600">
          <li>Tải ảnh hoặc chụp ảnh</li>
          <li>Kéo để khoanh vùng cần nhận diện</li>
          <li>Bấm “Dự đoán vùng này” để gửi</li>
        </ul>
        <div className="mt-4 text-xs text-gray-500">
          Mẹo: Kéo khung nhỏ quanh đối tượng chính để tăng độ chính xác.
        </div>
      </>
    ) : results.matches.length === 0 ? (
      <>
        <div className="font-semibold mb-2">Kết quả</div>
        <div className="text-sm text-gray-500">Không tìm thấy kết quả phù hợp.</div>
      </>
    ) : (
      <>
        <div className="font-semibold mb-3">Kết quả</div>
        <div className="space-y-3">
          {results.matches.map((m) => (
            <div
              key={m.heritage_id}
              className="p-3 rounded-xl border hover:shadow cursor-pointer transition"
              onClick={() => navigate(`/heritage/${m.heritage_id}`)}
            >
              <div className="font-semibold text-gray-800">
                {m.name ?? "Không rõ tên"}
              </div>
              <div className="text-sm text-gray-600 line-clamp-3">
                {m.description ?? "—"}
              </div>
              {typeof m.score === "number" && (
                <div className="text-xs text-gray-500 mt-1">
                  Score: {m.score.toFixed(3)}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    )}
  </div>
</aside>

          </div>
        )}
{/* -------- POST LAYOUT: Left 2/10 (crop + model) | Right 6/10 (results) -------- */}
{layout === "post" && (
  <div className="flex gap-4">
    {/* Working area 8/10 */}
    <section className="w-4/5">
      <div className="flex gap-4">
        {/* LEFT = 1/4 of 8/10 = 2/10 */}
        <aside className="basis-1/4 flex flex-col gap-3">
          {/* Crop thumbnail */}
        <button
  type="button"
  onClick={() => {
    setLayout("pre");
    setImgUrl(fullImgUrl || imgUrl);
    setStatus("idle"); // 👈 back to NORMAL in PRE
    setExpression("🖼️ Ảnh đã sẵn sàng, hãy khoanh vùng để tìm!");
  }}
            className="rounded-2xl border bg-white shadow p-3 text-left hover:shadow-md transition"
            title="Chọn lại vùng hoặc ảnh mới"
          >
            <div className="text-sm font-medium mb-2">Vùng đã tra cứu</div>
            {imgUrl ? (
              <img
                src={imgUrl}
                alt="Crop"
                className="w-full h-36 object-contain rounded-lg bg-neutral-100"
              />
            ) : (
              <div className="w-full h-36 rounded-lg bg-neutral-100 grid place-items-center text-xs text-gray-500">
                Không có ảnh
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Nhấn để quay lại chọn vùng/ảnh như Google Lens
            </div>
          </button>

          {/* Model panel */}
          <div className="rounded-2xl border bg-white shadow flex-1 flex flex-col min-h-0">
    <div className="p-3 border-b">
      <h3 className="font-semibold">Model</h3>
      <p className="text-xs text-gray-500">Biểu cảm & trạng thái</p>
    </div>
    <div className="flex-1 min-h-0 flex items-center justify-center">
      <AnimeGirlMascot status={status} />
    </div>
    <div className="p-3 border-t text-sm">
      <div className="font-medium mb-1">Trạng thái</div>
      <div className="text-gray-700">{expression}</div>
    </div>
  </div>
        </aside>

     {/* RIGHT = 3/4 of 8/10 = 6/10 (Results, vertical list) */}
<aside className="basis-3/4 rounded-2xl border bg-white shadow p-4 h-[70vh] overflow-auto">
  <div className="font-semibold mb-4 text-lg">Kết quả</div>

  {!results ? (
    <div className="text-sm text-gray-500">Chưa có kết quả.</div>
  ) : results.matches.length === 0 ? (
    <div className="text-sm text-gray-500">Không tìm thấy kết quả phù hợp.</div>
  ) : (
    // 👇 one item per row, stacked vertically
    <div className="divide-y divide-gray-200">
      {results.matches.map((m) => (
        <button
          key={m.heritage_id}
          onClick={() => navigate(`/heritage/${m.heritage_id}`)}
          className="w-full text-left py-3 focus:outline-none hover:bg-gray-50 transition rounded-lg px-3 -mx-3"
          title={m.name ?? "Không rõ tên"}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {m.name ?? "Không rõ tên"}
              </div>
              {/* (optional) keep a tiny snippet; remove this block if you truly want names only) */}
              {m.description && (
                <div className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                  {m.description}
                </div>
              )}
            </div>
            {typeof m.score === "number" && (
              <div className="shrink-0 text-xs text-gray-500 mt-0.5">
                {m.score.toFixed(3)}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )}
</aside>

      </div>
    </section>

    {/* No right sidebar in post layout */}
    <div className="w-1/5" />
  </div>
)}


     
      </main>
    </div>
  );
};

export default AIpredictLensPage;
