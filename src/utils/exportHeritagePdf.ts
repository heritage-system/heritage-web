import jsPDF from "jspdf";
import "../assets/fonts/Lora.js";
import VTFPLogo from "../assets/logo/VTFP_Logo.png";

export const exportHeritagePdf = (h: any, c: any) => {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  doc.setFont("Lora-Italic-VariableFont_wght", "normal");

  let y = 120;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

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
  // HEADER
  // ========================
  const addHeader = () => {
  // Logo
  doc.addImage(VTFPLogo, "PNG", 40, 30, 60, 60);

  // Font + reset
  doc.setFont("Lora-Italic-VariableFont_wght", "normal");

  // 🎨 Set màu vàng gold
  doc.setTextColor(197, 157, 26); // #C59D1A

  const headerText = "CỔNG THÔNG TIN DI SẢN VĂN HOÁ - VTFP";

  doc.setFontSize(20);

  // Căn giữa
  const textWidth = doc.getTextWidth(headerText);
  const x = (pageWidth - textWidth) / 2;

  doc.text(headerText, x, 65);

  // Reset lại màu cho nội dung phía dưới
  doc.setTextColor(0, 0, 0);
};


  // ========================
  // FOOTER
  // ========================
  const addFooter = () => {
    const page = doc.getNumberOfPages();
    const date = new Date().toLocaleDateString("vi-VN");

    doc.setFontSize(10);
    doc.setTextColor(120);

    doc.text(`Ngày xuất: ${date}`, 40, pageHeight - 40);
    doc.text(`Trang ${page}`, pageWidth - 70, pageHeight - 40);
    doc.text("https://heritage-web-ashy.vercel.app", pageWidth / 2 - 60, pageHeight - 40);

    doc.setTextColor(0, 0, 0);
  };

  // ========================
  // AUTO NEW PAGE
  // ========================
  const checkPage = () => {
    if (y > pageHeight - 140) {
      addFooter();
      doc.addPage();
      addHeader();
      y = 120;
    }
  };

  // ========================
  // HELPERS
  // ========================
  const addTitleCenter = (text: string) => {
    doc.setFontSize(24);
    const width = doc.getTextWidth(text);
    doc.text(text, (pageWidth - width) / 2, y);
    y += 40;
  };

  const addSection = (title: string) => {
    doc.setFont("Lora-Italic-VariableFont_wght", "normal");
    doc.setFontSize(16);
    doc.text(title, 40, y);
    y += 30;
    doc.setFontSize(12);
    checkPage();
  };

  const addParagraph = (text: string) => {
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(text.trim(), 500);
    doc.text(lines, 40, y);

    // spacing chuẩn 1.4
    y += lines.length * 16 + 8;

    checkPage();
  };

  const addList = (items: string[]) => {
    items.forEach((item) => {
      const lines = doc.splitTextToSize("• " + item.trim(), 500);
      doc.text(lines, 40, y);
      y += lines.length * 16 + 6;
      checkPage();
    });
  };

  // ================================
  // BẮT ĐẦU XUẤT PDF
  // ================================
  addHeader();

  // Title
  addTitleCenter(h.name.trim());

  // Giới thiệu
  if (h.description) {
    addSection("Giới thiệu:");
    addParagraph(h.description);
  }

  // Nội dung khối
  const sections = [
    { title: "Lịch sử hình thành:", value: c.History },
    { title: "Nghi lễ – diễn trình:", value: c.Rituals },
    { title: "Giá trị văn hoá:", value: c.Values },
    { title: "Bảo tồn – gìn giữ:", value: c.Preservation },
  ];

  sections.forEach((sec) => {
    if (!sec.value?.length) return;

    addSection(sec.title);

    sec.value.forEach((block: any) => {
      if (block.Type === "paragraph") addParagraph(block.Content);
      if (block.Type === "list") addList(block.Items);
    });
  });

  // ================================
  // THÔNG TIN NHANH
  // ================================
  addSection("Thông tin nhanh:");

  // Lịch tổ chức
  const occ = h.heritageOccurrences?.[0];

  const occText = occ
    ? occ.occurrenceTypeName === "EXACTDATE"
      ? `${occ.startDay}/${occ.startMonth} (${calendarMap[occ.calendarTypeName]})`
      : `${occ.startDay}/${occ.startMonth} - ${occ.endDay}/${occ.endMonth} (${calendarMap[occ.calendarTypeName]})`
    : "Không có dữ liệu";

  addParagraph(`• Thời gian tổ chức: ${occText}`);

  // Tần suất
  addParagraph(`• Tần suất: ${frequencyMap[occ?.frequencyName] || "—"}`);

  // Danh mục
  addParagraph(`• Danh mục: ${h.categoryName}`);

  // Địa điểm
  if (h.heritageLocations?.length) {
    const loc = h.heritageLocations[0];
    const address = [loc.addressDetail, loc.ward, loc.district, loc.province]
      .filter(Boolean)
      .join(", ");
    addParagraph(`• Địa điểm: ${address}`);
  }

  // Tags
  if (h.heritageTags?.length) {
    addParagraph(`• Các thẻ: ${h.heritageTags.join(", ")}`);
  }

  // Footer
  addFooter();

  doc.save(`${h.name.trim()}.pdf`);
};
