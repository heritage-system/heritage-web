import * as XLSX from "xlsx-js-style";
import { HeritageDescription, HeritageDescriptionBlock } from "@/types/heritage";

export const exportHeritageExcel = (h: any, c: HeritageDescription | null) => {
  // ========================
  // MAPPING ENUM → TIẾNG VIỆT
  // ========================
  const frequencyMap: Record<string, string> = {
    ANNUAL: "Hằng năm",
    ONETIME: "Một lần",
    SEASONAL: "Theo mùa",
    MONTHLY: "Từng tháng",
  };

  const calendarMap: Record<string, string> = {
    LUNAR: "Âm lịch",
    SOLAR: "Dương lịch",
  };

  // ========================
  // Convert nội dung blocks
  // ========================
  const renderBlocks = (blocks: HeritageDescriptionBlock[]) =>
    blocks
      ?.map((b) =>
        b.Type === "paragraph"
          ? b.Content?.trim()
          : b.Type === "list"
          ? b.Items?.map((i) => `• ${i}`).join("\n")
          : ""
      )
      .join("\n\n") || "";

  // ========================
  // Occurrence
  // ========================
  const occ = h.heritageOccurrences?.[0];

  const occText = occ
    ? occ.occurrenceTypeName === "EXACTDATE"
      ? `${occ.startDay}/${occ.startMonth} (${calendarMap[occ.calendarTypeName]})`
      : `${occ.startDay}/${occ.startMonth} - ${occ.endDay}/${occ.endMonth} (${calendarMap[occ.calendarTypeName]})`
    : "Không có dữ liệu";

  const frequencyText = occ?.frequencyName
    ? frequencyMap[occ.frequencyName] || occ.frequencyName
    : "—";

  // ========================
  // Location
  // ========================
  const address =
    h.heritageLocations?.length
      ? [h.heritageLocations[0].addressDetail, h.heritageLocations[0].ward, h.heritageLocations[0].district, h.heritageLocations[0].province]
          .filter(Boolean)
          .join(", ")
      : "Không có dữ liệu";

  // ========================
  // Dữ liệu sheet
  // ========================
  const rows = [
    { Field: "Tên di sản", Value: h.name },
    { Field: "Giới thiệu", Value: h.description ?? "" },

    { Field: "Lịch sử hình thành", Value: renderBlocks(c?.History?? [])},
    { Field: "Nghi lễ – diễn trình", Value: renderBlocks(c?.Rituals?? []) },
    { Field: "Giá trị văn hoá", Value: renderBlocks(c?.Values?? []) },
    { Field: "Bảo tồn – gìn giữ", Value: renderBlocks(c?.Preservation?? []) },

    { Field: "Thời gian tổ chức", Value: occText },
    { Field: "Tần suất", Value: frequencyText },
    { Field: "Danh mục", Value: h.categoryName },
    { Field: "Địa điểm", Value: address },
    { Field: "Các thẻ", Value: h.heritageTags?.join(", ") || "" },
  ];

  // ========================
  // Tạo sheet có header rõ ràng
  // ========================
  const ws = XLSX.utils.aoa_to_sheet([["Tên trường", "Nội dung"]]); // HEADER

  // === Thiết lập style header ===
  ws["A1"].s = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: "center" },
    fill: { fgColor: { rgb: "FFF7CC" } }, // vàng nhạt (optional)
  };

  ws["B1"].s = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: "center" },
    fill: { fgColor: { rgb: "FFF7CC" } },
  };

  // === Thêm nội dung ===
  XLSX.utils.sheet_add_json(ws, rows, {
    skipHeader: true,
    origin: "A2",
  });

  // === Tăng kích thước cột ===
  ws["!cols"] = [
    { wch: 30 },   // Field col — to hơn
    { wch: 120 },  // Value col — rộng nhiều hơn
  ];


  // ========================
  // Workbook
  // ========================
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, h.name);

  XLSX.writeFile(wb, `${h.name}.xlsx`);
};
