export function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";

  let normalized = iso;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(iso)) {
    normalized = iso + "Z";
  }

  const d = new Date(normalized);
  if (isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Hiển thị local cho list / rooms
 export function toLocalDisplay(iso: string | null | undefined): string {
  if (!iso) return "";
  let normalized = iso;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(iso)) {
    normalized = iso + "Z";
  }
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
}
