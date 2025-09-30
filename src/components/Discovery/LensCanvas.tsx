import React, { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

export interface LensCanvasProps {
  onImageSelected?: (file: File) => void;
  onCropConfirm?: (blob: Blob) => Promise<void> | void;
  onCropPreview?: (url: string) => void;   // 👈 thêm (optional)
  onStatus?: (status: "idle" | "selecting" | "ready") => void;
  imageUrl?: string | null;
}

const LensCanvas: React.FC<LensCanvasProps> = ({
  onImageSelected,
  onCropConfirm,
  onCropPreview,
  onStatus,
  imageUrl
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [startPt, setStartPt] = useState<Point | null>(null);
  const [endPt, setEndPt] = useState<Point | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [internalImageUrl, setInternalImageUrl] = useState<string | null>(imageUrl ?? null);

  useEffect(() => {
    if (imageUrl) {
      setInternalImageUrl(imageUrl);
      setImgLoaded(false);
      setHasSelection(false);
      setStartPt(null);
      setEndPt(null);
    }
  }, [imageUrl]);

  // Vẽ ảnh + selection
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);

      const imgRatio = img.naturalWidth / img.naturalHeight;

      let drawW = canvas.width;
      let drawH = Math.round(drawW / imgRatio);
      if (drawH > canvas.height) {
        drawH = canvas.height;
        drawW = Math.round(drawH * imgRatio);
      }
      const offX = Math.floor((canvas.width - drawW) / 2);
      const offY = Math.floor((canvas.height - drawH) / 2);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, offX, offY, drawW, drawH);

      if (startPt && endPt) {
        const x = Math.min(startPt.x, endPt.x);
        const y = Math.min(startPt.y, endPt.y);
        const w = Math.abs(endPt.x - startPt.x);
        const h = Math.abs(endPt.y - startPt.y);

        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(x, y, w, h);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx.restore();
      }
    };

    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [imgLoaded, startPt, endPt]);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setInternalImageUrl(url);
    setImgLoaded(false);
    setHasSelection(false);
    setStartPt(null);
    setEndPt(null);
    onStatus?.("idle");
    onImageSelected?.(f);
    e.target.value = "";
  };

  const getLocalPoint = (evt: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(evt.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(evt.clientY - rect.top, rect.height)),
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!internalImageUrl) return;
    const pt = getLocalPoint(e);
    setDragging(true);
    setStartPt(pt);
    setEndPt(pt);
    setHasSelection(false);
    onStatus?.("selecting");
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const pt = getLocalPoint(e);
    setEndPt(pt);
  };

  const onPointerUp = async () => {
    if (!dragging) return;
    setDragging(false);

    const valid =
      startPt && endPt &&
      Math.abs(endPt.x - startPt.x) > 8 &&
      Math.abs(endPt.y - startPt.y) > 8;

    if (!valid) {
      setStartPt(null);
      setEndPt(null);
      setHasSelection(false);
      onStatus?.("idle");
      return;
    }

    setHasSelection(true);
    onStatus?.("ready");

    // Auto confirm: crop + preview + callback
    const blob = await cropSelectionToBlob();
    if (blob) {
      // preview ngay (nếu muốn)
      if (onCropPreview) {
        const url = URL.createObjectURL(blob);
        onCropPreview(url);
      }
      if (onCropConfirm) await onCropConfirm(blob);
    }
  };

  const cropSelectionToBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded || !startPt || !endPt) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const imgRatio = img.naturalWidth / img.naturalHeight;

    let drawW = canvas.width;
    let drawH = Math.round(drawW / imgRatio);
    if (drawH > canvas.height) {
      drawH = canvas.height;
      drawW = Math.round(drawH * imgRatio);
    }
    const offX = Math.floor((canvas.width - drawW) / 2);
    const offY = Math.floor((canvas.height - drawH) / 2);

    const x = Math.min(startPt.x, endPt.x);
    const y = Math.min(startPt.y, endPt.y);
    const w = Math.abs(endPt.x - startPt.x);
    const h = Math.abs(endPt.y - startPt.y);

    const selOnImgX = Math.max(0, x - offX);
    const selOnImgY = Math.max(0, y - offY);
    const selOnImgW = Math.min(w, offX + drawW - x, canvas.width - x);
    const selOnImgH = Math.min(h, offY + drawH - y, canvas.height - y);

    if (selOnImgW <= 0 || selOnImgH <= 0) return null;

    const scaleX = img.naturalWidth / drawW;
    const scaleY = img.naturalHeight / drawH;

    const srcX = Math.max(0, Math.floor(selOnImgX * scaleX));
    const srcY = Math.max(0, Math.floor(selOnImgY * scaleY));
    const maxW = img.naturalWidth - srcX;
    const maxH = img.naturalHeight - srcY;
    const srcW = Math.max(1, Math.min(maxW, Math.floor(selOnImgW * scaleX)));
    const srcH = Math.max(1, Math.min(maxH, Math.floor(selOnImgH * scaleY)));

    if (srcW <= 0 || srcH <= 0) return null;

    const off = document.createElement("canvas");
    off.width = srcW;
    off.height = srcH;
    const offCtx = off.getContext("2d");
    if (!offCtx) return null;

    offCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    return await new Promise<Blob | null>((resolve) => {
      off.toBlob((blob) => resolve(blob), "image/png", 0.95);
    });
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border shadow bg-black/5">
      {/* Controls */}
      <div className="absolute z-20 top-3 left-3 flex gap-2">
        <button
          onClick={handlePickFile}
          className="px-3 py-1.5 text-sm rounded-lg bg-white shadow hover:bg-gray-50"
        >
          Tải ảnh / Chụp
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

      {!internalImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="font-medium">Thả ảnh vào đây hoặc bấm “Tải ảnh / Chụp”</p>
            <p className="text-sm opacity-80 mt-1">Kéo để chọn vùng như Google Lens sau khi ảnh hiện trên canvas</p>
          </div>
        </div>
      )}

    <img
  ref={imgRef}
  crossOrigin="anonymous"
  src={internalImageUrl || undefined}   // 👈 avoid ""
  alt=""
  className="hidden"
  onLoad={() => setImgLoaded(true)}
/>


      <canvas
        ref={canvasRef}
        className="w-full h-[60vh] md:h-[70vh] touch-none bg-neutral-900"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
};

export default LensCanvas;
