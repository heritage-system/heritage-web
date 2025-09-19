// utils/deltaUtils.ts
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

type DeltaLike = string | { ops?: any[] } | any[];

export function safeParseDelta(input: DeltaLike): { ops: any[] } {
  // 1) Nếu đã là object có ops -> trả luôn
  if (input && typeof input === "object" && !Array.isArray(input)) {
    if (Array.isArray((input as any).ops)) return input as any;
  }
  // 2) Nếu input là mảng ops
  if (Array.isArray(input)) return { ops: input as any[] };

  // 3) Nếu là string -> cố gắng "repair"
  if (typeof input === "string") {
    let s = input.trim();

    // Case double-encoded: chuỗi bắt đầu/ kết thúc bằng dấu "
    // và bên trong thấy \"ops\" -> parse 1 lớp trước
    if (s.startsWith('"') && s.endsWith('"')) {
      try { s = JSON.parse(s); } catch { /* bỏ qua nếu không được */ }
    }

    // Loại bỏ các control char cấm (U+0000..U+001F trừ \n \r \t vì ta sẽ escape riêng)
    //  - U+0008 (\b), U+000C (\f) thường gây "Bad control character"
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

    // Escape các line break/tab thành chuỗi hợp lệ JSON
    // Lưu ý: vì JSON chuẩn không cho xuống dòng trực tiếp trong string,
    // nên nếu backend trả raw newline, ta chuyển thành \\n, \\r, \\t
    s = s.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");

    try {
      const parsed = JSON.parse(s);
      if (parsed && Array.isArray(parsed.ops)) return parsed;
      // Một số backend trả { content: { ops: [] } } -> lấy tiếp
      if (parsed?.content && Array.isArray(parsed.content.ops)) return parsed.content;
    } catch (err) {
      console.error("safeParseDelta JSON.parse error:", err);
    }
  }

  // Fallback: ít nhất trả object rỗng để UI không vỡ
  return { ops: [] };
}

export function htmlFromDeltaWithImgAlign(deltaOps: any[]) {
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

export function toHtml(contentSaved: DeltaLike) {
  const deltaObj = safeParseDelta(contentSaved);
  return htmlFromDeltaWithImgAlign(deltaObj.ops ?? []);
}