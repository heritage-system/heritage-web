
 import React, { useEffect, useRef, useState } from "react";
 import { Upload, Image as ImageIcon } from "lucide-react";
/* ===================== Types & constants ===================== */

type Point = { x: number; y: number };
type Rect01 = { x: number; y: number; w: number; h: number };

type DragKind =
  | "none"
  | "new"
  | "move"
  | "esize" | "wsize" | "nsize" | "ssize"
  | "nesize" | "nwsize" | "sesize" | "swsize";

const DEFAULT_CROP_W = 0.70;
const DEFAULT_CROP_H = 0.70;
const HANDLE_PX = 14; // a bit larger; easier to grab
const AUTO_CONFIRM_DELAY = 500;


export interface LensCanvasProps {
  imageUrl?: string | null;
  frameClassName?: string;
  initialCrop?: Rect01 | "full";
  onCropRectChange?: (rect: Rect01 | null) => void;

  onImageSelected?: (file: File) => void;
  onCropPreview?: (url: string) => void;
  onCropConfirm?: (blob: Blob) => Promise<void> | void;
  onStatus?: (status: "idle" | "selecting" | "ready") => void;
}

/* ===================== Helpers ===================== */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Leave a small margin between the image and the canvas frame
const getDrawRect = (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
  const imgRatio = img.naturalWidth / img.naturalHeight;

  // ~2% of the shortest side, clamped to [8, 32] px
  const pad = Math.max(25, Math.min(32, Math.round(Math.min(canvas.width, canvas.height) * 0.02)));

  const innerW = Math.max(0, canvas.width  - pad * 2);
  const innerH = Math.max(0, canvas.height - pad * 2);

  let drawW = innerW;
  let drawH = Math.round(drawW / imgRatio);
  if (drawH > innerH) {
    drawH = innerH;
    drawW = Math.round(drawH * imgRatio);
  }

  // Center the image; thanks to inner box, offX/offY are >= pad
  const offX = Math.floor((canvas.width  - drawW) / 2);
  const offY = Math.floor((canvas.height - drawH) / 2);

  return { offX, offY, drawW, drawH };
};

const rect01ToPx = (canvas: HTMLCanvasElement, img: HTMLImageElement, r: Rect01) => {
  const { offX, offY, drawW, drawH } = getDrawRect(canvas, img);
  return {
    x: offX + Math.round(r.x * drawW),
    y: offY + Math.round(r.y * drawH),
    w: Math.round(r.w * drawW),
    h: Math.round(r.h * drawH),
  };
};
const cursorForKind = (k: DragKind) =>
  k === "move"   ? "move" :
  k === "esize"  ? "e-resize" :
  k === "wsize"  ? "w-resize" :
  k === "nsize"  ? "n-resize" :
  k === "ssize"  ? "s-resize" :
  k === "nesize" ? "ne-resize" :
  k === "nwsize" ? "nw-resize" :
  k === "sesize" ? "se-resize" :
  k === "swsize" ? "sw-resize" :
  "crosshair";
const makeDefaultCrop01 = (canvas: HTMLCanvasElement, img: HTMLImageElement): Rect01 => {
  const { drawW, drawH } = getDrawRect(canvas, img);
  const w = DEFAULT_CROP_W;
  const h = DEFAULT_CROP_H * (drawH / drawW);
  const cw = Math.min(0.95, Math.max(0.2, w));
  const ch = Math.min(0.95, Math.max(0.2, h));
  return { x: (1 - cw) / 2, y: (1 - ch) / 2, w: cw, h: ch };
};

const drawCorners = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) => {
  const L = 18;
  const lw = 3;

  // dim outside
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.38)";
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.rect(x, y, w, h);
  ctx.fill("evenodd");
  ctx.restore();

  // corners
  ctx.save();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = lw;
  const lines: [number, number, number, number][] = [
    [x, y + L, x, y], [x, y, x + L, y],
    [x + w - L, y, x + w, y], [x + w, y, x + w, y + L],
    [x, y + h - L, x, y + h], [x, y + h, x + L, y + h],
    [x + w - L, y + h, x + w, y + h], [x + w, y + h - L, x + w, y + h],
  ];
  ctx.beginPath();
  for (const [x1, y1, x2, y2] of lines) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
  ctx.stroke();
  ctx.restore();
};

const hitTest = (px: Point, rectPx: { x: number; y: number; w: number; h: number }): DragKind => {
  const { x, y, w, h } = rectPx;
  const r = HANDLE_PX;
  const inside = px.x >= x && px.x <= x + w && px.y >= y && px.y <= y + h;
  if (!inside) return "none";
  const left   = Math.abs(px.x - x) <= r;
  const right  = Math.abs(px.x - (x + w)) <= r;
  const top    = Math.abs(px.y - y) <= r;
  const bottom = Math.abs(px.y - (y + h)) <= r;
  if (left && top) return "nwsize";
  if (right && top) return "nesize";
  if (left && bottom) return "swsize";
  if (right && bottom) return "sesize";
  if (left) return "wsize";
  if (right) return "esize";
  if (top) return "nsize";
  if (bottom) return "ssize";
  return "move";
};

/* ===================== Component ===================== */

const LensCanvas: React.FC<LensCanvasProps> = ({
  imageUrl,
  frameClassName,
  initialCrop,
  onCropRectChange,
  onImageSelected,
  onCropPreview,
  onCropConfirm,
  onStatus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
const hoverKindRef = useRef<DragKind>("none");
  const [internalImageUrl, setInternalImageUrl] = useState<string | null>(imageUrl ?? null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
const seededForUrlRef = useRef<string | null>(null);
  const [crop01, setCrop01] = useState<Rect01 | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragKind, setDragKind] = useState<DragKind>("none");
  const dragStartRef = useRef<Point | null>(null);
  const startRect01Ref = useRef<Rect01 | null>(null);

  const [startPt, setStartPt] = useState<Point | null>(null);
  const [endPt, setEndPt] = useState<Point | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  const autoConfirmRef = useRef<number | null>(null);
  useEffect(() => {
  if (dragging) return; // đang kéo thì thôi

  if (!crop01) return;

  const t = setTimeout(() => confirmCrop(), 500);
  return () => clearTimeout(t);
}, [dragging]);


  /* seed crop */
 useEffect(() => {
  if (!imgLoaded || !internalImageUrl) return;
  if (seededForUrlRef.current === internalImageUrl) return;

  const canvas = canvasRef.current;
  const img = imgRef.current;
  if (!canvas || !img) return;

  let next: Rect01;
  if (initialCrop === "full") {
    next = { x: 0, y: 0, w: 1, h: 1 };
  } else if (initialCrop) {
    next = {
      x: clamp01(initialCrop.x),
      y: clamp01(initialCrop.y),
      w: clamp01(initialCrop.w),
      h: clamp01(initialCrop.h),
    };
  } else {
    next = makeDefaultCrop01(canvas, img);
  }

  setCrop01(next);                   // ✅ seed local state only
  seededForUrlRef.current = internalImageUrl;
}, [imgLoaded, internalImageUrl, initialCrop]);

  /* sync external imageUrl */
  useEffect(() => {
    if (imageUrl) {
      setInternalImageUrl(imageUrl);
      setImgLoaded(false);
      setHasSelection(false);
      setStartPt(null);
      setEndPt(null);
    }
  }, [imageUrl]);

  /* drawing */
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);

      const { offX, offY, drawW, drawH } = getDrawRect(canvas, img);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, offX, offY, drawW, drawH);

      if (crop01) {
        const { x, y, w, h } = rect01ToPx(canvas, img, crop01);
        drawCorners(ctx, x, y, w, h);
      }
      if (startPt && endPt) {
        const x = Math.min(startPt.x, endPt.x);
        const y = Math.min(startPt.y, endPt.y);
        const w = Math.abs(endPt.x - startPt.x);
        const h = Math.abs(endPt.y - startPt.y);
        drawCorners(ctx, x, y, w, h);
      }
    };

    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [imgLoaded, crop01, startPt, endPt]);

  /* file helpers */
  const pickNewImage = () => fileInputRef.current?.click();

  const loadFile = (f: File) => {
  const url = URL.createObjectURL(f);
  setOriginalFile(f);
  setImgLoaded(false);
  setHasSelection(false);
  setStartPt(null);
  setEndPt(null);
  onStatus?.("idle");

  setInternalImageUrlSafe(url);  // ✅ thay vì setInternalImageUrl trực tiếp
  onImageSelected?.(f);
};


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.target.value = "";
  };

  // drag & drop / paste
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = Array.from(e.dataTransfer.files || []).find((ff) => ff.type.startsWith("image/"));
    if (f) loadFile(f);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const it = Array.from(e.clipboardData.items || []).find((i) => i.type.startsWith("image/"));
    const f = it?.getAsFile();
    if (f) loadFile(f);
  };

  /* crop -> blob */
  const cropSelectionToBlob = async (rect?: Rect01): Promise<Blob | null> => {
    const r = rect ?? crop01;
    const img = imgRef.current;
    if (!img || !imgLoaded || !r) return null;

    const srcX = Math.floor(r.x * img.naturalWidth);
    const srcY = Math.floor(r.y * img.naturalHeight);
    const srcW = Math.max(1, Math.floor(r.w * img.naturalWidth));
    const srcH = Math.max(1, Math.floor(r.h * img.naturalHeight));

    const off = document.createElement("canvas");
    off.width = srcW; off.height = srcH;
    const offCtx = off.getContext("2d"); if (!offCtx) return null;
    offCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    return await new Promise((resolve) => off.toBlob((b) => resolve(b), "image/png", 0.95));
  };

  const getFullImageBlob = async (): Promise<Blob | null> => {
    if (originalFile) return originalFile;
    const img = imgRef.current; if (!img || !imgLoaded) return null;
    const off = document.createElement("canvas");
    off.width = img.naturalWidth; off.height = img.naturalHeight;
    const ctx = off.getContext("2d"); if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return await new Promise((resolve) => off.toBlob((b) => resolve(b), "image/png", 0.95));
  };

  /* pointer handlers */
  const getLocalPoint = (evt: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(evt.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(evt.clientY - rect.top, rect.height)),
    };
  };

 const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
  if (!internalImageUrl || !imgLoaded) return;

  const canvas = canvasRef.current!;
  const img = imgRef.current!;
  const pt = getLocalPoint(e);

  // take capture so we keep events even if the pointer leaves the canvas
  (e.target as Element).setPointerCapture?.(e.pointerId);

  dragStartRef.current = pt;

  // if we already have a crop, try to grab it
  if (crop01) {
    const rectPx = rect01ToPx(canvas, img, crop01);
    const kind = hitTest(pt, rectPx);
    if (kind !== "none") {
      setDragKind(kind);
      setDragging(true);
      startRect01Ref.current = { ...crop01 };

      // ensure rubber-band is cleared so it doesn't redraw over the crop
      setStartPt(null);
      setEndPt(null);

      onStatus?.("ready");
      return;
    }
  }

  // otherwise begin a new rubber-band selection
  setDragKind("new");
  setDragging(true);
  setStartPt(pt);
  setEndPt(pt);
  setHasSelection(false);
  onStatus?.("selecting");
};

const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current!, img = imgRef.current!;
  const pt = getLocalPoint(e);

  if (!dragging) {
    // hover feedback: update cursor over handles/edges/inside
    if (crop01 && imgLoaded) {
      const kind = hitTest(pt, rect01ToPx(canvas, img, crop01));
      hoverKindRef.current = kind;
      (canvas as HTMLCanvasElement).style.cursor = cursorForKind(kind);
    } else {
      (canvas as HTMLCanvasElement).style.cursor = "crosshair";
    }
    return;
  }

  if (dragKind === "new") { setEndPt(pt); return; }

    const startPtPx = dragStartRef.current!;
    const startRect = startRect01Ref.current!;
    const { drawW, drawH } = getDrawRect(canvas, img);
    const dx01 = (pt.x - startPtPx.x) / drawW;
    const dy01 = (pt.y - startPtPx.y) / drawH;

    let nx = startRect.x, ny = startRect.y, nw = startRect.w, nh = startRect.h;
    const clampRect = () => {
      nx = clamp01(nx); ny = clamp01(ny); nw = clamp01(nw); nh = clamp01(nh);
      const MIN = 1 / Math.max(drawW, drawH) * 8;
      nw = Math.max(nw, MIN); nh = Math.max(nh, MIN);
      if (nx + nw > 1) nx = 1 - nw;
      if (ny + nh > 1) ny = 1 - nh;
    };

    switch (dragKind) {
      case "move":  nx = startRect.x + dx01; ny = startRect.y + dy01; break;
      case "esize": nw = startRect.w + dx01; break;
      case "wsize": nx = startRect.x + dx01; nw = startRect.w - dx01; break;
      case "nsize": ny = startRect.y + dy01; nh = startRect.h - dy01; break;
      case "ssize": nh = startRect.h + dy01; break;
      case "nesize": ny = startRect.y + dy01; nh = startRect.h - dy01; nw = startRect.w + dx01; break;
      case "nwsize": nx = startRect.x + dx01; nw = startRect.w - dx01; ny = startRect.y + dy01; nh = startRect.h - dy01; break;
      case "sesize": nw = startRect.w + dx01; nh = startRect.h + dy01; break;
      case "swsize": nx = startRect.x + dx01; nw = startRect.w - dx01; nh = startRect.h + dy01; break;
    }
    clampRect();

    const next = { x: nx, y: ny, w: nw, h: nh };
    setCrop01(next);
    setHasSelection(true);
    onCropRectChange?.(next);

    cropSelectionToBlob(next).then((b) => b && onCropPreview?.(URL.createObjectURL(b)));
  };

const onPointerUp = async (e?: React.PointerEvent<HTMLCanvasElement>) => {
  if (!dragging) return;
  setDragging(false);

  // release capture
  if (e) (e.target as Element).releasePointerCapture?.(e.pointerId);

    if (dragKind === "new") {
      const canvas = canvasRef.current!, img = imgRef.current!;
      if (!startPt || !endPt) { setStartPt(null); setEndPt(null); setDragKind("none"); return; }
      const x = Math.min(startPt.x, endPt.x), y = Math.min(startPt.y, endPt.y);
      const w = Math.abs(endPt.x - startPt.x), h = Math.abs(endPt.y - startPt.y);
      if (w < 8 || h < 8) {
        setStartPt(null); setEndPt(null); setHasSelection(false); setCrop01(null);
        onCropRectChange?.(null); onStatus?.("idle"); setDragKind("none"); return;
      }
      const { offX, offY, drawW, drawH } = getDrawRect(canvas, img);
      const rect = { x: clamp01((x - offX) / drawW), y: clamp01((y - offY) / drawH),
                     w: clamp01(w / drawW), h: clamp01(h / drawH) };
      setCrop01(rect); setHasSelection(true); onStatus?.("ready"); onCropRectChange?.(rect);
      const b = await cropSelectionToBlob(rect); if (b) onCropPreview?.(URL.createObjectURL(b));
    }

   setStartPt(null);
  setEndPt(null);
  setDragKind("none");
};
  /* actions */
  const confirmCrop = async () => {
    if (!onCropConfirm || !crop01) return;
    const b = await cropSelectionToBlob(crop01);
    if (!b) return;
    onCropPreview?.(URL.createObjectURL(b));
    await onCropConfirm(b);
  };

  const clearCrop = () => {
    setCrop01(null);
    setHasSelection(false);
    onCropRectChange?.(null);
    onStatus?.("idle");
  };

  const setInternalImageUrlSafe = (url: string | null) => {
    // Revoke URL cũ nếu có
    if (internalImageUrl && internalImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(internalImageUrl);
    }

    setInternalImageUrl(url);

    if (url) {
      sessionStorage.setItem("ai-lens-image", url);
    } else {
      sessionStorage.removeItem("ai-lens-image");
    }
  };

  useEffect(() => {
  const savedImage = sessionStorage.getItem("ai-lens-image");
  const savedCrop = sessionStorage.getItem("ai-lens-crop");

  if (savedImage) {
    setInternalImageUrl(savedImage);
    setImgLoaded(false);
    setHasSelection(false);
    setStartPt(null);
    setEndPt(null);

    if (savedCrop) {
      try {
        const rect = JSON.parse(savedCrop) as Rect01;
        setCrop01(rect);
        onCropRectChange?.(rect);
        onStatus?.("ready");
      } catch {}
    }
  }
}, []);

useEffect(() => {
  if (!crop01) {
    sessionStorage.removeItem("ai-lens-crop");
    return;
  }
  sessionStorage.setItem("ai-lens-crop", JSON.stringify(crop01));
}, [crop01]);


  /* ===================== Render ===================== */

  return (
    <div
      className={frameClassName ?? "w-full h-full relative rounded-2xl overflow-hidden border shadow bg-black/5"}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onPaste={onPaste}
      tabIndex={0}
    >
      {/* Link to choose image when an image is present (top-left, subtle) */}
      {internalImageUrl && (
        <div className="absolute top-3 left-3 z-20 pointer-events-none select-none">
          <button
            type="button"
            onClick={pickNewImage}
            className="pointer-events-auto inline-flex items-center gap-1 text-xs underline text-white/90 bg-black/30 px-2 py-1 rounded hover:text-white"
            title="Chọn ảnh khác"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />

            Ảnh khác…
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Empty-state helper with inline link like Google Lens */}
      {!internalImageUrl && (
      <div
    className="absolute inset-0 grid place-items-center"
    /* vẫn cho kéo-thả/paste từ wrapper */
  >
    <div className="text-center select-none">
      {/* vòng tròn icon */}
      <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-white/90 grid place-items-center shadow">
        <Upload className="w-7 h-7 text-neutral-900" aria-hidden="true" />
      </div>

      {/* tiêu đề + mô tả (hiển thị đẹp trên nền canvas đen) */}
      <h3 className="text-lg font-semibold text-white">Tải lên hình ảnh</h3>
     <p className="text-sm text-white/70">Kéo thả hoặc nhấp để chọn hình ảnh</p>

      {/* nút đen như mẫu */}
      <button
        type="button"
        onClick={pickNewImage}
        className="mt-3 inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow
                   ring-1 ring-white/20 hover:ring-white/40 active:scale-[.98] transition"
        title="Chọn hình ảnh"
      >
        <ImageIcon className="w-4 h-4" aria-hidden="true" />
        Chọn hình ảnh
      </button>

      {/* input thật sự */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  </div>
)}

      {/* Hidden image used for drawing */}
      <img
        ref={imgRef}
        crossOrigin="anonymous"
        src={internalImageUrl || undefined}
        alt=""
        className="hidden"
        onLoad={() => setImgLoaded(true)}
      />

      {/* Canvas */}
    <canvas
  ref={canvasRef}
  className="w-full h-full touch-none bg-neutral-900"
  onPointerDown={onPointerDown}
  onPointerMove={onPointerMove}
  onPointerUp={onPointerUp}
  onDoubleClick={confirmCrop}
  onKeyDown={(e) => {
    if (e.key === "Enter") void confirmCrop();
    else if (e.key === "Escape") clearCrop();
  }}
  tabIndex={0}
/>

    </div>
  );
};

export default LensCanvas;
