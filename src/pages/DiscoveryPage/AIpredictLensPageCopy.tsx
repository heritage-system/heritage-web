import React, { useEffect, useRef, useState } from "react";
import { predictHeritage, PredictJsonService, mapPredictToHeritage } from "../../services/AIpredictService";
import LensCanvas from "../../components/Discovery/LensCanvas";
import { PredictApiPayload, PredictResponse } from "../../types/AIpredict";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { HeritageSearchResponse} from "../../types/heritage";

interface Props {
  fetchHeritagesAi: (heritages: HeritageSearchResponse[]) => void;
}


const AIpredictLensPage: React.FC<Props> = ({fetchHeritagesAi}) => {
  const navigate = useNavigate();
  type Rect01 = { x: number; y: number; w: number; h: number };

  const [lastCrop, setLastCrop] = useState<Rect01 | null>(null);
  const [payload, setPayload] = useState<PredictApiPayload | null>(null);
  const [AiUrl, setAiUrl] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [fullImgUrl, setFullImgUrl] = useState<string | null>(null);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
  const savedPayload = sessionStorage.getItem("ai-lens-payload");
  if (savedPayload) {
    try {
      const parsed = JSON.parse(savedPayload) as PredictApiPayload;
      setPayload(parsed);

      // update matches lên ngoài nếu cần
      const heritages = mapPredictToHeritage(parsed);
      fetchHeritagesAi(heritages);
    } catch (e) {
      console.error("Cannot parse saved payload", e);
    }
  }
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
    (p && "matches" in p && Array.isArray((p as any).matches)
      ? (p as any).matches
      : []) as PredictResponse["matches"];

  const getError = (p: PredictApiPayload | null) =>
    p && "error" in (p as any) ? (p as any).error : null;

  const ErrorCard: React.FC<{ err: any }> = ({ err }) => {
    const isStringErr = typeof err === "string";
    const code = isStringErr ? err : err?.code;
    const label = !isStringErr ? err?.label : undefined;
    const confidence = !isStringErr ? err?.confidence : undefined;
    const size = !isStringErr ? err?.size : undefined;

    const fallbackMessage =
      code === "BLUR_EARLY_DROP"
        ? "Ảnh quá mờ nên bị từ chối ngay từ đầu."
        : code === "BLUR_AFTER_ENHANCE"
        ? "Ảnh vẫn mờ sau khi xử lý tăng chất lượng."
        : code === "INVALID_IMAGE"
        ? "Không thể đọc ảnh. Vui lòng tải PNG/JPG/WebP hợp lệ."
        : undefined;

    const message = (isStringErr ? null : err?.message) ?? fallbackMessage;

    
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        <div className="font-semibold mb-1">Không thể trả kết quả tìm kiếm</div>
        <div className="flex flex-col gap-1">
          {/* <div>
            <span className="font-medium">Mã lỗi:</span> {code}
          </div> */}

          {label && (
            <div>
              <span className="font-medium">Phân loại:</span> {label}
              {typeof confidence === "number"
                ? ` (~${Math.round(confidence * 100)}%)`
                : ""}
            </div>
          )}

          {Array.isArray(size) && size.length === 2 && (
            <div>
              <span className="font-medium">Kích thước ảnh:</span>{" "}
              {size[0]}×{size[1]} px
            </div>
          )}

          {message && <div>{message}</div>}

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

  // const runPredictFile = async (file: File) => {
  //   try {
  //     const res = await predictHeritage(file, {
  //       top_k: 20,
  //       results: 5,
  //       threshold: 0.65,
  //     });
  //     setPayload(res.result ?? null);
  //   } catch (e) {
  //     console.error(e);
  //     setPayload(null);
  //   }
  // };
  const runPredictFile = async (file: File) => {
  try {
    setLoading(true); // bật loading

    const formData = new FormData();
    formData.append("file", file);

    //const res = await PredictJsonService.loadFromUrlRandomPost(url, 5, formData);
    const res = await PredictJsonService.loadFromUrlPost(AiUrl!, formData);
    setPayload(res ?? null);

    const heritages = mapPredictToHeritage(res ?? null);
    fetchHeritagesAi(heritages);

    console.log("Heritages:", heritages);
  } catch (e) {
    console.error(e);
    setPayload(null);
    fetchHeritagesAi([]);
  } finally {
    setLoading(false); // tắt loading
  }
};

  const runPredictBlob = async (blob: Blob) => {
  setLoading(true);
  try {
    const file = new File([blob], `lens-crop-${Date.now()}.png`, {
      type: "image/png",
    });
    const url = URL.createObjectURL(blob);
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setCropUrl(url);
    await runPredictFile(file);
  } finally {
    setLoading(false);
  }
};


  const getInputDescription = (payload: PredictApiPayload | null): string | null => {
      if (!payload) return null;

      // kiểm tra payload có field inputDescription → nghĩa là PredictResponse
      if ("inputDescription" in payload) {
        return payload.inputDescription || null;
      }
      return null;
    }

useEffect(() => {
  if (!payload) {
    sessionStorage.removeItem("ai-lens-payload");
    return;
  }
  try {
    sessionStorage.setItem("ai-lens-payload", JSON.stringify(payload));
  } catch (e) {
    console.error("Cannot save payload to sessionStorage", e);
  }
}, [payload]);
  return (
    <div className=" bg-gray-50">
      <main className="mx-auto w-full sm:px-6s">       
        {/* ONLY CANVAS */}
        <section className="rounded-2xl border shadow bg-white/70 backdrop-blur-sm overflow-hidden min-h-[20vh]">
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
              await runPredictFile(file); // auto-search
            }}
            onCropPreview={(url) => {
              if (cropUrl) URL.revokeObjectURL(cropUrl);
              setCropUrl(url);
            }}
            onCropConfirm={runPredictBlob}
            onStatus={() => {}}
          />
        </section>

       
        <section className="w-full mt-2">
          <div className="rounded-2xl border bg-white shadow p-4">
           <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Kết quả</h4>
            
            <button
              onClick={() => setCollapsed((x) => !x)}
              className="text-sm px-3 py-1 rounded-lg border bg-gray-50 hover:bg-gray-100 transition flex items-center gap-1"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  collapsed ? "-rotate-90" : "rotate-0"
                }`}
              />
              {collapsed ? "Mở rộng" : "Thu gọn"}
            </button>

          </div>

          {!collapsed && (
            <>
            {loading ? (
  <div className="flex items-center gap-2 text-blue-600 text-sm mt-3">
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    Đang nhận diện ảnh...
  </div>
) : (
  <>
              {!payload ? (
                <div className="text-sm text-gray-600">
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"                   
                      value={AiUrl ?? ""}
                      onChange={(e) => setAiUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />

                    <button
                      onClick={() => {                      
                        // cập nhật ảnh chính                    
                        setAiUrl(AiUrl);                     
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              ) : getError(payload) ? (
                <ErrorCard err={getError(payload)} />
              ) : getMatches(payload).length === 0 ? (
                <div className="text-sm text-gray-500">Không tìm thấy kết quả phù hợp.</div>
              ) : (
                <div className="text-sm text-gray-700">
                  {getInputDescription(payload) && (
                    <p className="mt-2">
                      <span className="font-medium text-gray-800">Mô tả ảnh:</span>{" "}
                      {getInputDescription(payload)}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
 </>
)}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AIpredictLensPage;
