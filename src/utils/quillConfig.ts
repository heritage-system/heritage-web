// utils/quillConfig.ts
import Quill from "quill";
import { computeFileHash } from "./imageUtils";

// Initialize Quill configuration
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

// Icons
const icons = Quill.import("ui/icons");
icons["caption"] = '<svg viewBox="0 0 18 18"><line x1="3" y1="14" x2="15" y2="14" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="4" width="12" height="7" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>';

// Image resize and drop modules
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

// Caption class
const Parchment = Quill.import("parchment");
const CaptionClass = new Parchment.Attributor.Class("caption", "ql-caption", {
  scope: Parchment.Scope.BLOCK,
});
Quill.register(CaptionClass, true);

// Caption handler
export function thisCaptionHandler(this: any) {
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

// Image handler factory
export function makeImageHandler(
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