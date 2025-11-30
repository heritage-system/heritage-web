import { useState } from "react";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportButtonsProps {
  data: Record<string, any>;     // nội dung JSON của trang
  fileName?: string;             // tên file xuất ra
  pdfFormatter?: (doc: jsPDF, data: any) => void; // optional custom format
}

const ExportButton: React.FC<ExportButtonsProps> = ({ 
  data, 
  fileName = "export",
  pdfFormatter
}) => {
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);

  // ==== EXPORT PDF ===========================================================
  const exportPDF = () => {
    setLoading("pdf");

    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text(fileName, 10, y);
    y += 12;

    // If caller overrides the PDF layout → use it
    if (pdfFormatter) {
      pdfFormatter(doc, data);
    } 
    else {
      // Default PDF layout: key-value text
      Object.entries(data).forEach(([key, value]) => {
        if (!value) return;

        doc.setFontSize(14);
        doc.text(`${key}:`, 10, y);
        y += 7;

        doc.setFontSize(11);
        const text = doc.splitTextToSize(String(value), 180);
        doc.text(text, 10, y);
        y += text.length * 6 + 5;
      });
    }

    doc.save(`${fileName}.pdf`);
    setLoading(null);
  };

  // ==== EXPORT EXCEL =========================================================
  const exportExcel = () => {
    setLoading("excel");

    const rows = Object.entries(data).map(([key, value]) => ({
      Field: key,
      Value: String(value ?? "")
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    setLoading(null);
  };

  return (
    <div className="flex gap-3">
      {/* PDF BUTTON */}
      <button
        onClick={exportPDF}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
      >
        {loading === "pdf" ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <FileText size={18} />
        )}
        PDF
      </button>

      {/* EXCEL BUTTON */}
      <button
        onClick={exportExcel}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50"
      >
        {loading === "excel" ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <FileSpreadsheet size={18} />
        )}
        Excel
      </button>
    </div>
  );
};

export default ExportButton;
