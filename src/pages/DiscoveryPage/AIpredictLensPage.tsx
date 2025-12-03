import React, { useEffect, useRef, useState } from "react";
import { predictHeritage } from "../../services/AIpredictService";
import LensCanvas from "../../components/Discovery/LensCanvas";
import { PredictApiPayload, PredictResponse } from "../../types/AIpredict";
import AnimeGirlMascot, { GirlStatus } from "../../components/Mascot/AnimeGirlMascot";
import { useNavigate } from "react-router-dom";

const AIpredictLensPage: React.FC = () => {
  const navigate = useNavigate();
  type Rect01 = { x: number; y: number; w: number; h: number };

  const [lastCrop, setLastCrop] = useState<Rect01 | null>(null);
  const [payload, setPayload] = useState<PredictApiPayload | null>(null);
  const [status, setStatus] = useState<GirlStatus>("idle");

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [fullImgUrl, setFullImgUrl] = useState<string | null>(null);
  const [cropUrl, setCropUrl] = useState<string | null>(null);

  const mascotRef = useRef<HTMLDivElement | null>(null);
  const [pipVisible, setPipVisible] = useState(false);

  // PiP observe mascot visibility
  useEffect(() => {
    const el = mascotRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPipVisible(!entry.isIntersecting),
      { root: null, threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const setLastCropSafe = (r: Rect01 | null) =>
    setLastCrop((prev) => {
      if (!prev || !r) return r;
      const same =
        Math.abs(prev.x - r.x) < 1e-6 &&
        Math.abs(prev.y - r.y) < 1e-6 &&
        Math.abs(prev.w - r.w) < 1e-6 &&
        Math.abs(prev.h - r.h) < 1e-6;
      return same ? prev : r;
    });

  const getMatches = (p: PredictApiPayload | null) =>
    (p && "matches" in p && Array.isArray((p as any).matches) ? (p as any).matches : []) as PredictResponse["matches"];

  const getError = (p: PredictApiPayload | null) =>
    p && "error" in (p as any) ? (p as any).error : null;

  const ErrorCard: React.FC<{ err: any }> = ({ err }) => {
    const isStringErr = typeof err === "string";
    const code = isStringErr ? err : err?.code;
    const label = !isStringErr ? err?.label : undefined;
    const confidence = !isStringErr ? err?.confidence : undefined;
    const size = !isStringErr ? err?.size : undefined;
  const fallbackMessage =
  code === "BLUR_EARLY_DROP"      ? "Ảnh quá mờ nên bị từ chối ngay từ đầu."
: code === "BLUR_AFTER_ENHANCE"   ? "Ảnh vẫn mờ sau khi xử lý tăng chất lượng."
: code === "INVALID_IMAGE"        ? "Không thể đọc ảnh. Vui lòng tải PNG/JPG/WebP hợp lệ."
: undefined;

const message = (isStringErr ? null : err?.message) ?? fallbackMessage;


    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        <div className="font-semibold mb-1">Không thể trả kết quả tìm kiếm</div>
        <div className="flex flex-col gap-1">
          <div><span className="font-medium">Mã lỗi:</span> {code}</div>
          {label && (
            <div>
              <span className="font-medium">Phân loại:</span> {label}
              {typeof confidence === "number" ? ` (độ tin cậy ~ ${Math.round(confidence * 100)}%)` : ""}
            </div>
          )}
          {Array.isArray(size) && size.length === 2 && (
            <div><span className="font-medium">Kích thước ảnh:</span> {size[0]}×{size[1]} px</div>
          )}
          {message && <div className="mt-0.5">{message}</div>}

          {code === "NON_PHOTOGRAPHIC" && (
            <ul className="list-disc pl-5 mt-1">
              <li>Tải ảnh CHỤP thực tế (không phải anime/đồ hoạ/ảnh poster).</li>
              <li>Tránh ảnh màn hình, meme, banner gacha, key visual game…</li>
            </ul>
          )}
          {code === "IMAGE_TOO_SMALL" && (
            <ul className="list-disc pl-5 mt-1">
              <li>Dùng ảnh có cạnh dài ≥ 384 px (khuyến nghị ≥ 512 px).</li>
              <li>Chụp gần hơn hoặc chọn ảnh độ phân giải cao hơn.</li>
            </ul>
          )}
          {(code === "BLUR_EARLY_DROP" || code === "BLUR_AFTER_ENHANCE") && (
            <ul className="list-disc pl-5 mt-1">
              <li>Giữ máy chắc tay, đủ sáng; lau sạch ống kính.</li>
              <li>Chụp lại đối tượng chiếm ≥ 40–60% khung hình.</li>
            </ul>
          )}

          <details className="mt-1">
            <summary className="cursor-pointer">Chi tiết kỹ thuật</summary>
            <pre className="mt-2 max-h-64 overflow-auto text-xs text-red-900">
{JSON.stringify(err, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  };

  const runPredictFile = async (file: File) => {
    setStatus("loading");
    try {
      const res = await predictHeritage(file, { top_k: 20, results: 5, threshold: 0.65 });
      const data = res.result ?? null;

      setPayload(data);

      const err = getError(data);
      if (err) {
        setStatus("nodata");
        return;
      }

      const m = getMatches(data);
      if (m.length) setStatus("data");
      else setStatus("nodata");
    } catch (e) {
      console.error(e);
      setPayload(null);
      setStatus("idle");
    }
  }; // ✅ chỉ một dấu đóng cho hàm, không dư

  const runPredictBlob = async (blob: Blob) => {
    const file = new File([blob], `lens-crop-${Date.now()}.png`, { type: "image/png" });
    const url = URL.createObjectURL(blob);
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setCropUrl(url);
    await runPredictFile(file);
  };

  const wrapperClass =
    "min-h-screen bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50";
  const containerClass = "mx-auto w-[80%] px-4 sm:px-6 lg:px-8 py-6";

  return (
    <div className={wrapperClass}>
      <main className={containerClass}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Tìm kiếm bằng{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="text-gray-600">Chọn ảnh/kéo thả, vẽ vùng cần tìm</p>
        </div>

        {/* Canvas + mascot */}
        <section className="rounded-2xl border shadow bg-white/70 backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_320px] md:grid-cols-[1fr_360px] min-h-[60vh]">
            {/* LEFT: image canvas */}
            <div className="relative">
              <LensCanvas
                frameClassName="w-full h-full relative bg-neutral-900"
                imageUrl={imgUrl}
                initialCrop={lastCrop ?? "full"}
                onCropRectChange={setLastCropSafe}
                onImageSelected={async (file) => {
                  const url = URL.createObjectURL(file);
                  if (fullImgUrl) URL.revokeObjectURL(fullImgUrl);
                  setFullImgUrl(url);
                  setImgUrl(url);
                  if (cropUrl) {
                    URL.revokeObjectURL(cropUrl);
                    setCropUrl(null);
                  }
                  setLastCrop({ x: 0, y: 0, w: 1, h: 1 });
                  await runPredictFile(file); // auto-search on upload
                }}
                onCropPreview={(url) => {
                  if (cropUrl) URL.revokeObjectURL(cropUrl);
                  setCropUrl(url);
                }}
                onCropConfirm={runPredictBlob}
                onStatus={() => {}}
              />
            </div>

            {/* RIGHT: mascot */}
            <div className="relative bg-neutral-900">
              <div className="absolute left-0 top-0 h-full w-px bg-black/30" />
              <div className="h-full flex items-end px-4 pt-4 pb-0">
                <div
                  ref={mascotRef}
                  className="w-[240px] h-[60vh] max-h-[520px] mx-auto"
                >
                  <AnimeGirlMascot status={status} className="h-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kết quả */}
        <section className="w-full mt-4">
          <div className="rounded-2xl border bg-white shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Kết quả</h3>
            </div>

            {!payload ? (
              <div className="text-sm text-gray-600">...</div>
            ) : getError(payload) ? (
              <ErrorCard err={getError(payload)} />
            ) : getMatches(payload).length === 0 ? (
              <div className="text-sm text-gray-500">Không tìm thấy kết quả phù hợp.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getMatches(payload).map((m: PredictResponse["matches"][number]) => {
                  const thumbUrl =
                    m.media?.url ||
                    m.evidence.find((e) => !e.is_video)?.url ||
                    m.evidence[0]?.url ||
                    null;

                  return (
                    <article
                      key={m.id}
                      className="rounded-xl border bg-white p-4 hover:shadow transition cursor-pointer"
                      onClick={() => navigate(`/heritagedetail/${m.id}`)}
                      title={m.name ?? "Không rõ tên"}
                    >
                      {thumbUrl && (
                        <div className="mb-3 overflow-hidden rounded-md aspect-[4/3] bg-gray-100">
                          <img
                            src={thumbUrl}
                            alt={m.name ?? "thumbnail"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="font-semibold text-gray-900">
                        {m.name ?? "Không rõ tên"}
                      </div>
                      {m.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {m.description}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* PiP mini-mascot */}
        {pipVisible && (
          <button
            type="button"
            onClick={() =>
              mascotRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            className="fixed bottom-4 right-4 z-50"
            aria-label="Open mascot"
            title="Quay lại khu vực trợ lý"
          >
            <div className="rounded-xl shadow-lg border bg-white/90 backdrop-blur p-2 hover:scale-[1.02] transition">
              <div className="w-28 h-36 pointer-events-none">
                <AnimeGirlMascot status={status} />
              </div>
            </div>
          </button>
        )}
      </main>
    </div>
  );
};

export default AIpredictLensPage;
