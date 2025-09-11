import React, { useEffect, useMemo, useState } from "react";
import { Eye, AlertTriangle, X, MessageSquare } from "lucide-react";
import Pagination from "../Layouts/Pagination";
import SearchFilter from "./SearchFilter";
import { TableProps, Report, TableColumn } from "../../types/report";
import { fetchReports, answerReport } from "../../services/reportService";
import { useNavigate } from "react-router-dom";

function DataTable<T extends { id: number }>({
  data,
  columns,
  onView,
  onAnswer,
  loading = false,
}: TableProps<T> & { onAnswer?: (item: T) => void }) {
  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 mb-2 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={(item as any).id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render((item as any)[column.key], item)
                    : String((item as any)[column.key])}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Xem"
                    >
                      <MessageSquare size={16} />
                    </button>
                  )}
                  
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===================== Report Management =====================
const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "ANSWERED" | "CANCEL"
  >("PENDING");

  // ✅ State để lưu tổng số báo cáo theo từng trạng thái
  const [statusCounts, setStatusCounts] = useState({
    PENDING: 0,
    ANSWERED: 0,
    CANCEL: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchReports({
          page: currentPage,
          pageSize: itemsPerPage,
          keyword: searchTerm,
          startDate,
          endDate,
          status: statusFilter,
        });
        const result = res.result;
        setReports(result?.items || []);
        setTotalPages(result?.totalPages || 1);
        setTotalElements(result?.totalElements || 0);

        const [pendingRes, answeredRes, cancelRes] = await Promise.all([
          fetchReports({ page: 1, pageSize: 10, status: "PENDING" }),
          fetchReports({ page: 1, pageSize: 10, status: "ANSWERED" }),
          fetchReports({ page: 1, pageSize: 10, status: "CANCEL" }),
        ]);

        setStatusCounts({
          PENDING: pendingRes.result?.totalElements || 0,
          ANSWERED: answeredRes.result?.totalElements || 0,
          CANCEL: cancelRes.result?.totalElements || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentPage, searchTerm, startDate, endDate, statusFilter]);

  const columns: TableColumn<Report>[] = [
    { key: "id", label: "ID" },
    { key: "userName", label: "User Name" },
    { key: "heritageName", label: "Heritage Name" },
    {
      key: "reason",
      label: "Lý do",
      render: (v: string) =>
        v && v.length > 40 ? <span title={v}>{v.slice(0, 40)}...</span> : v,
    },
    { key: "status", label: "Trạng thái",
    render: (v: string) => statusLabels[v as keyof typeof statusLabels] || v },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (d: string) => new Date(d).toLocaleString(),
    },
  ];

  const statusLabels: Record<string, string> = {
  PENDING: "Đang chờ",
  ANSWERED: "Đã trả lời",
  CANCEL: "Đã hủy",
};


  const handleAnswer = (item: Report) => setSelectedReport(item);
  const navigate = useNavigate();

  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [answerText, setAnswerText] = useState("");

  const handleSubmitAnswer = async () => {
    if (!selectedReport || !answerText.trim()) return;
    try {
      await answerReport({
        reportId: selectedReport.id,
        answer: answerText.trim(),
      });
      setSelectedReport(null);
      setAnswerText("");
      // Refresh the list after answering
      const res = await fetchReports({
        page: currentPage,
        pageSize: itemsPerPage,
        keyword: searchTerm,
        status: statusFilter,
      });
      const result = res.result;
      setReports(result?.items || []);
      setTotalPages(result?.totalPages || 1);
      setTotalElements(result?.totalElements || 0);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: "PENDING", label: "Đang chờ", color: "bg-yellow-100 text-yellow-700" },
          { key: "ANSWERED", label: "Đã trả lời", color: "bg-green-100 text-green-700" },
          { key: "CANCEL", label: "Đã hủy", color: "bg-red-100 text-red-700" },
        ].map((item) => (
          <div
            key={item.key}
            className="rounded-xl border bg-white p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${item.color}`}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-semibold">
                {statusCounts[item.key as keyof typeof statusCounts]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 pl-4 pr-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Ô tìm kiếm */}
          <div className="flex-1 pt-5">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={(v) => {
                setSearchTerm(v);
                setCurrentPage(1);
              }}
              filters={[]}
              onFilterChange={() => {}}
            />
          </div>

          {/* Bộ lọc ngày + Nút Xóa */}
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Đến ngày"
            />
            <button
              onClick={() => {
                setSearchTerm("");
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
              className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {[
          { key: "PENDING", label: "Đang chờ", icon: <AlertTriangle className="w-4 h-4" /> },
          { key: "ANSWERED", label: "Đã trả lời", icon: <MessageSquare className="w-4 h-4" /> },
          { key: "CANCEL", label: "Đã hủy", icon: <X className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key as "PENDING" | "ANSWERED" | "CANCEL");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200
              ${
                statusFilter === tab.key
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500 shadow-inner"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>


      {/* Table */}
      <DataTable<Report>
        data={reports}
        columns={columns}
        loading={loading}
        onView={(item) => navigate(`/reports/${item.id}`)}
        onAnswer={handleAnswer}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalElements}
      />

      {/* View Modal */}
      {viewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setViewReport(null)}
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-2">Chi tiết báo cáo</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">User Name</p>
                  <p className="font-medium">{viewReport.userName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Heritage ID</p>
                  <p className="font-medium">{viewReport.heritageId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Heritage Name</p>
                  <p className="font-medium">{viewReport.heritageName}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500">Lý do</p>
                <p className="font-medium whitespace-pre-wrap">
                  {viewReport.reason || "(không có)"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Trạng thái</p>
                <p className="font-medium whitespace-pre-wrap">
                  {statusLabels[viewReport.status as keyof typeof statusLabels] || "(không có)"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Ngày tạo</p>
                <p className="font-medium">
                  {new Date(viewReport.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewReport(null)}
                className="px-4 py-2 border rounded-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Answer Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Trả lời báo cáo</h3>
            <p className="text-sm text-gray-600 mb-4">
              Báo cáo từ người dùng <b>{selectedReport.userName}</b> về di sản:{" "}
              <b>{selectedReport.heritageName}</b>
            </p>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full border rounded-md p-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập câu trả lời..."
            />
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitAnswer}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Gửi trả lời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
