import React, { useEffect, useMemo, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import Cropper from "react-easy-crop";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { uploadImage } from "../../services/uploadService";
import toast from 'react-hot-toast';
if (typeof window !== "undefined") {
  // @ts-ignore
  window.Quill = Quill;
  const Image = Quill.import("formats/image");
  const sanitize = Image.sanitize;
  Image.sanitize = (url: string) => {
    if (url.startsWith("blob:")) return url; // giữ nguyên blob URL
    return sanitize(url);
  };
  Quill.register(Image, true);
}



const icons = Quill.import("ui/icons");
icons["caption"] = '<svg viewBox="0 0 18 18"><line x1="3" y1="14" x2="15" y2="14" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="4" width="12" height="7" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>';

let ImageResize: any | undefined;
let ImageDrop: any | undefined;

if (typeof window !== "undefined") {
  const ResizeMod = require("quill-image-resize-module");
  ImageResize = ResizeMod?.default ?? ResizeMod;
  if (ImageResize) {
    Quill.register("modules/imageResize", ImageResize);
  }

  const DropMod = require("quill-image-drop-module");
  ImageDrop = DropMod?.default ?? DropMod;
  if (ImageDrop) {
    Quill.register("modules/imageDrop", ImageDrop);
  }
}

const Parchment = Quill.import("parchment");
const CaptionClass = new Parchment.Attributor.Class("caption", "ql-caption", {
  scope: Parchment.Scope.BLOCK,
});
Quill.register(CaptionClass, true);

// -----------------------------
// Helpers
// -----------------------------
async function downscaleImage(file: File, maxW = 1600, quality = 0.85): Promise<File> {
  const img = Object.assign(new Image(), { src: URL.createObjectURL(file) });
  await new Promise((r) => (img.onload = r));
  const ratio = img.width > maxW ? maxW / img.width : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
  const out = new File([blob!], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  URL.revokeObjectURL(img.src);
  return out;
}

function htmlFromDeltaWithImgAlign(deltaOps: any[]) {
  const ops = deltaOps.map(op => {
    if (op.insert && op.insert.image && typeof op.insert.image === "object") {
      return { ...op, insert: { image: op.insert.image.url } };
    }
    return op;
  });

  const raw = new QuillDeltaToHtmlConverter(ops, { inlineStyles: true }).convert();
  const doc = new DOMParser().parseFromString(raw, "text/html");

  const ps = Array.from(doc.querySelectorAll("p"));
  ps.forEach((p) => {
    if (p.querySelector("img")) {
      p.style.marginBottom = "0";
    }

    const styleAlign = (p.getAttribute("style") || "").match(/text-align:\s*(left|center|right|justify)/i)?.[1];
    let align: "left" | "center" | "right" | "justify" | undefined = styleAlign as any;

    if (!align) {
      if (p.classList.contains("ql-align-center")) align = "center";
      else if (p.classList.contains("ql-align-right")) align = "right";
      else if (p.classList.contains("ql-align-justify")) align = "justify";
      else if (p.classList.contains("ql-align-left")) align = "left";
    }

    if (!align) return;

    const imgs = Array.from(p.querySelectorAll("img"));
    imgs.forEach((img: HTMLImageElement) => {
      img.style.marginBottom = "0";
      const prev = img.getAttribute("style") || "";
      let extra = "display:block; margin-left:auto;margin-right:auto;";
      img.setAttribute(
        "style",
        `${prev}${prev && !prev.trim().endsWith(";") ? ";" : ""}${extra}`
      );
    });
  });

  doc.querySelectorAll("figcaption").forEach((cap) => {
    (cap as HTMLElement).style.marginTop = "0";
    if (cap.parentElement) {
      (cap.parentElement as HTMLElement).style.marginTop = "0";
    }
  });

  doc.querySelectorAll("p").forEach((p) => {
    Array.from(p.querySelectorAll("br")).forEach((br) => {
      br.after(br.cloneNode(true));
    });
  });

  return doc.body.innerHTML;
}

function thisCaptionHandler(this: any) {
  const q: Quill = this.quill;
  const sel = q.getSelection(true);
  if (!sel) return;

  const [line] = q.getLine(sel.index) || [];
  if (!line) return;

  const lineDom = (line as any).domNode as HTMLElement;

  if (!lineDom.querySelector("img")) {
    alert("Hãy đặt con trỏ vào dòng ảnh rồi mới thêm caption.");
    return;
  }

  const after = q.getIndex(line) + (line as any).length();
  const [nextLine] = q.getLine(after) || [];

  if (nextLine && (nextLine as any).domNode?.classList?.contains("ql-caption")) {
    const len = (nextLine as any).length ? (nextLine as any).length() : 1;
    const textLen = Math.max(0, len - 1);
    q.setSelection(after, textLen, "user");
    return;
  }

  const placeholder = "Nhập mô tả ảnh…";
  q.insertText(after, placeholder, { italic: true, color: "#6b7280" }, "user");
  q.insertText(after + placeholder.length, "\n", "user");
  q.formatLine(after, 1, "caption", true);
  q.formatLine(after, 1, { align: "center" });
  q.setSelection(after, placeholder.length, "user");
}

// Utils
const isBlobUrl = (u?: string) => !!u && u.startsWith("blob:");
const deepClone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

// Tạo handler có "đường dây nóng" để báo về file tạm
// Tạo handler có hash-dedupe
function makeImageHandler(
  onBlobPicked: (blobUrl: string, file: File, hash: string) => void
) {
  // Map sống trong phiên editor: hash -> blobUrl (tái sử dụng)
  const hashToBlobUrlRef = { current: new Map<string, string>() };

  return function thisImageHandler(this: any) {
    const q: Quill = this.quill;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = (input.files ?? [])[0];
      if (!file) return;

      // 1) Tính hash nội dung
      const hash = await computeFileHash(file);

      // 2) Nếu đã có hash → dùng lại blobUrl cũ; ngược lại tạo blobUrl mới
      const existed = hashToBlobUrlRef.current.get(hash);
      const blobUrl = existed ?? URL.createObjectURL(file);
      if (!existed) {
        hashToBlobUrlRef.current.set(hash, blobUrl);
      }

      // 3) Chèn ảnh
      const sel = q.getSelection(true);
      const at = sel?.index ?? 0;
      q.insertEmbed(at, "image", blobUrl as unknown as string, "user");
      q.setSelection(at + 1, 0);
      q.formatLine(at + 1, 1, { align: "center" });

      setTimeout(() => {
        const editor = q.root as HTMLElement;
        const imgs = editor.querySelectorAll("img");
        const lastImg = imgs[imgs.length - 1] as HTMLImageElement;
        if (lastImg) {
          lastImg.style.display = "block";
          lastImg.style.margin = "auto";
        }
      }, 0);

      // 4) Báo ngược lên cha kèm hash
      onBlobPicked(blobUrl, file, hash);
    };

    input.click();
  };
}


function collectImageUrlsFromDelta(deltaOps: any[]): Set<string> {
  const urls = new Set<string>();
  for (const op of deltaOps ?? []) {
    const img = op?.insert?.image;
    if (!img) continue;
    if (typeof img === "string") urls.add(img);
    else if (typeof img === "object" && img.url) urls.add(img.url);
  }
  return urls;
}


async function uploadToCloudinary(file: File): Promise<string> {
  console.log("Uploading to Cloudinary:", file.name);

  const response = await uploadImage(file);

  if (response?.code === 200 && response.result) {
    return response.result;
  }

  toast.error( "Lưu ảnh thất bại!", {
    duration: 5000,
    position: "top-right",
    style: { background: "#DC2626", color: "#fff" },
    iconTheme: { primary: "#fff", secondary: "#DC2626" },
  });

  return "";
}

async function computeFileHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}


// -----------------------------
// CoverUploader with crop
// -----------------------------
interface CoverUploaderProps {
  value?: string | null;
  onChange: (url: string, file?: File) => void;
}

const CoverUploader: React.FC<CoverUploaderProps> = ({ value, onChange }) => {
  const [openCrop, setOpenCrop] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    if (value) setImageURL(value);
  }, [value]);

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file);
    setImageURL(URL.createObjectURL(file));
    setOpenCrop(true);
  };

  const onCropComplete = (_: any, areaPixels: any) => setCroppedAreaPixels(areaPixels);

  const getCroppedBlob = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageURL!;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
      };
    });
  };

  const onConfirmCrop = async () => {
    if (!rawFile || !croppedAreaPixels || !imageURL) return;
    const blob = await getCroppedBlob();
    const file = new File([blob], rawFile.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
    
    // Tạo blob URL tạm thời cho cover
    const tempUrl = URL.createObjectURL(file);
    onChange(tempUrl, file);
    setOpenCrop(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">Ảnh bìa</label>
      {value ? (
        <div className="relative group">
          <img src={value} alt="cover" className="w-full h-56 object-cover rounded-2xl shadow" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition rounded-2xl flex items-center justify-center gap-2">
            <button
              onClick={() => setOpenCrop(true)}
              className="opacity-0 group-hover:opacity-100 bg-white px-3 py-2 rounded-lg shadow"
            >
              Crop lại
            </button>
            <label className="opacity-0 group-hover:opacity-100 bg-white px-3 py-2 rounded-lg shadow cursor-pointer">
              Đổi ảnh
              <input type="file" accept="image/*" className="hidden" onChange={onSelect} />
            </label>
          </div>
        </div>
      ) : (
        <label className="flex items-center justify-center h-44 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50">
          <span className="text-gray-600">Chọn ảnh bìa…</span>
          <input type="file" accept="image/*" className="hidden" onChange={onSelect} />
        </label>
      )}

      {openCrop && imageURL && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden">
            <div className="relative h-96">
              <Cropper
                image={imageURL}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex items-center justify-between p-4 border-t">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg" onClick={() => setOpenCrop(false)}>Huỷ</button>
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={onConfirmCrop}>Xác nhận</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -----------------------------
// RichTextEditor với temp image handling
// -----------------------------
interface RichTextEditorProps {
  initialDelta?: any;
  onChange?: (html: string, delta: any) => void;
  onTempImage?: (blobUrl: string, file: File, hash: string) => void;
  onImagesChanged?: (urls: Set<string>) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialDelta, onChange, onTempImage, onImagesChanged }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;
    
    const quill = new Quill(containerRef.current, {
      theme: "snow",
      placeholder: "Nhập nội dung bài viết…",
      modules: {
        toolbar: {
          container: [
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
            ["link", "image", "video", "caption"],
            ["clean"],
          ],
          handlers: {
            image: makeImageHandler((blobUrl, file, hash) => {
              onTempImage?.(blobUrl, file, hash); // 🔁 truyền hash lên cha
            }),
            caption: thisCaptionHandler,
          },
        },
        imageResize: { modules: ["Resize", "DisplaySize"] },
        clipboard: { matchVisual: false },
      },
    });

    // Load existing delta
    if (initialDelta) quill.setContents(initialDelta);

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      const delta = quill.getContents();
      onChange?.(html, delta);

      const urls = collectImageUrlsFromDelta(delta.ops);
      onImagesChanged?.(urls);
    });

    quillRef.current = quill;
  }, [initialDelta, onChange, onTempImage]);

  return <div ref={containerRef} className="min-h-[320px]" />;
};

// -----------------------------
// Main Form Component
// -----------------------------
const ContributionFormPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null); // File tạm cho cover
  const [html, setHtml] = useState("");
  const [delta, setDelta] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [blobMap, setBlobMap] = useState<Map<string, { file: File; hash: string }>>(new Map());
// hash -> primary blobUrl (để biết blobUrl đã có cho hash đó)
const hashToBlobUrlRef = useRef<Map<string, string>>(new Map()); // Map blob URLs to Files

  const canSubmit = useMemo(() => title.trim().length > 0 && delta, [title, delta]);

  // Handler khi có ảnh tạm từ editor
  const handleTempImage = (blobUrl: string, file: File, hash: string) => {
  // Nếu hash đã có → đặt blobUrl về blob cũ (đề phòng child tạo blob mới)
  const existed = hashToBlobUrlRef.current.get(hash);
  const finalBlobUrl = existed ?? blobUrl;
  if (!existed) hashToBlobUrlRef.current.set(hash, finalBlobUrl);

  setBlobMap(prev => {
    const next = new Map(prev);
    next.set(finalBlobUrl, { file, hash });
    return next;
  });
};


  // Handler khi có cover tạm
  const handleCoverChange = (url: string, file?: File) => {
    setCover(url);
    setCoverFile(file || null);
  };

  const onSubmit = async () => {
    if (!canSubmit || !delta) return;
    setSaving(true);
    
    try {
      console.log("🚀 Bắt đầu upload process...");
      console.log("📊 Blob map hiện tại:", Array.from(blobMap.keys()));
      
      // 1. Upload cover nếu có và là blob URL
      let finalCoverUrl = cover;
      if (cover && isBlobUrl(cover) && coverFile) {
        console.log("📷 Uploading cover image...");
        finalCoverUrl = await uploadToCloudinary(coverFile);
        URL.revokeObjectURL(cover);
        console.log("✅ Cover uploaded:", finalCoverUrl);
      }

      // 2. Clone delta để không ảnh hưởng state
      const newDelta = deepClone(delta);
      const ops = newDelta.ops ?? [];
      console.log("📝 Processing", ops.length, "operations");

      // 3. Cache để không upload cùng 1 blob nhiều lần
     const uploadedByHash = new Map<string, string>(); // hash -> cloudUrl
let uploadCount = 0;

      // 4. Duyệt qua tất cả ops và upload images
      for (let i = 0; i < ops.length; i++) {
  const op = ops[i];

  // Trường hợp { image: { url } }
  if (op?.insert?.image && typeof op.insert.image === "object") {
    const imgUrl: string | undefined = op.insert.image.url;
    if (!imgUrl || !isBlobUrl(imgUrl)) continue;

    const info = blobMap.get(imgUrl);
    if (!info) {
      console.warn("⚠️ Không tìm thấy File cho blob URL:", imgUrl);
      continue;
    }
    const { file, hash } = info;

    // Nếu đã upload hash này → dùng lại
    if (uploadedByHash.has(hash)) {
      op.insert.image = { url: uploadedByHash.get(hash)! };
      continue;
    }

    // Upload mới
    const cloudUrl = await uploadToCloudinary(file);
    uploadedByHash.set(hash, cloudUrl);
    op.insert.image = { url: cloudUrl };
    uploadCount++;
    URL.revokeObjectURL(imgUrl);
  }

  // Trường hợp image là string src
  else if (typeof op?.insert?.image === "string") {
    const imgUrl: string = op.insert.image;
    if (!isBlobUrl(imgUrl)) continue;

    const info = blobMap.get(imgUrl);
    if (!info) {
      console.warn("⚠️ Không tìm thấy File cho blob URL:", imgUrl);
      continue;
    }
    const { file, hash } = info;

    if (uploadedByHash.has(hash)) {
      op.insert.image = uploadedByHash.get(hash)!;
      continue;
    }

    const cloudUrl = await uploadToCloudinary(file);
    uploadedByHash.set(hash, cloudUrl);
    op.insert.image = cloudUrl;
    uploadCount++;
    URL.revokeObjectURL(imgUrl);
  }
}

      // 5. Tạo HTML cuối cùng từ delta đã upload
      const finalHtml = htmlFromDeltaWithImgAlign(newDelta.ops);

      // 6. Đóng gói payload sạch
      const payload = {
        title: title.trim(),
        coverUrl: finalCoverUrl,
        contentHtml: finalHtml,
        contentDelta: newDelta,
        metadata: {
          totalImages: uploadedByHash.size,
          uploadTimestamp: new Date().toISOString(),
          originalBlobCount: blobMap.size
        }
      };

      console.log("🎉 FINAL PAYLOAD:", payload);
      
      // 7. Gửi API
      // const response = await fetch("/api/contributions", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload)
      // });
      
      alert(`✅ Đã upload thành công!\n📊 Đã upload ${uploadCount} ảnh lên Cloudinary\n🔍 Kiểm tra console để xem payload.`);
      
      // Reset form
      setTitle("");
      setCover(null);
      setCoverFile(null);
      setHtml("");
      setDelta(null);
      setBlobMap(new Map());
      
    } catch (error) {
      console.error("❌ Lỗi khi submit:", error);
      alert("❌ Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Đăng bài đóng góp</h1>
        <p className="text-gray-600">
          Vai trò: <span className="font-medium">Contributor</span>
          {blobMap.size > 0 && (
            <span className="ml-4 text-sm text-blue-600">
              ({blobMap.size} ảnh tạm thời)
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu đề</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài viết"
            className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cover Uploader */}
        <CoverUploader value={cover} onChange={handleCoverChange} />

        {/* Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">Nội dung</label>
          <div className="rounded-xl border overflow-hidden">
            <RichTextEditor
  initialDelta={delta}
  onChange={(h, d) => { setHtml(h); setDelta(d); }}
  onTempImage={handleTempImage}
/>

          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ảnh sẽ được lưu tạm thời và upload lên Cloudinary khi đăng bài.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              // Cleanup blob URLs
              blobMap.forEach((_, blobUrl) => URL.revokeObjectURL(blobUrl));
              if (cover && isBlobUrl(cover)) URL.revokeObjectURL(cover);
              
              setTitle("");
              setCover(null);
              setCoverFile(null);
              setHtml("");
              setDelta(null);
              setBlobMap(new Map());
            }}
            className="px-4 py-2 rounded-lg border"
          >
            Reset
          </button>
          <button
            disabled={!canSubmit || saving}
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Đang upload...
              </>
            ) : (
              "Đăng bài"
            )}
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Xem nhanh</h2>
        {cover && <img src={cover} alt="cover" className="w-full h-56 object-cover rounded-xl" />}
        <h3 className="text-2xl font-bold">{title || "(Chưa có tiêu đề)"}</h3>

        {delta && (
          <div
            className="prose max-w-none quill-content
              [&_blockquote]:border-l-4
              [&_blockquote]:border-black
              [&_blockquote]:pl-4
              [&_blockquote]:my-2
              [&_.ql-caption]:text-gray-500
              [&_.ql-caption]:italic
              [&_.ql-caption]:text-sm
              [&_.ql-caption]:m-0
              prose-headings:mt-0 prose-p:mt-0 prose-img:mt-0 prose-figure:mt-0"
            dangerouslySetInnerHTML={{ __html: htmlFromDeltaWithImgAlign(delta.ops) }}
          />
        )}
      </div>
    </div>
  );
};

export default ContributionFormPage;