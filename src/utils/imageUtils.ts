// utils/imageUtils.ts
export async function downscaleImage(file: File, maxW = 1600, quality = 0.85): Promise<File> {
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

export async function computeFileHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export const isBlobUrl = (u?: string) => !!u && u.startsWith("blob:");

export const deepClone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export function collectImageUrlsFromDelta(deltaOps: any[]): Set<string> {
  const urls = new Set<string>();
  for (const op of deltaOps ?? []) {
    const img = op?.insert?.image;
    if (!img) continue;
    if (typeof img === "string") urls.add(img);
    else if (typeof img === "object" && img.url) urls.add(img.url);
  }
  return urls;
}