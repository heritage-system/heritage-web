import React, { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, AlertTriangle, X, Filter, MessageSquare } from "lucide-react";
import Pagination from "../Layouts/Pagination";
import SearchFilter from "./SearchFilter";
import { TableProps, ReportItem, TableColumn } from "../../types/report";
import { fetchReports, deleteReport, answerReport } from "../../services/reportService";
import { useNavigate } from "react-router-dom";

// ===================== Generic DataTable =====================
function DataTable<T extends { id: number }>({
  data,
  columns,
  onView,
  onDelete,
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
                    <button onClick={() => onView(item)} className="text-blue-600 hover:text-blue-900" title="Xem">
                      <Eye size={16} />
                    </button>
                  )}
                  {onAnswer && (
                    <button onClick={() => onAnswer(item)} className="text-green-600 hover:text-green-900" title="Trả lời">
                      <MessageSquare size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900" title="Xóa">
                      <Trash2 size={16} />
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
  const [reports, setReports] = useState<ReportItem[]>([]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchReports({ page: currentPage, pageSize: itemsPerPage, keyword: searchTerm });
        const result = res.result;
        setReports(result?.items || []);
        setTotalPages(result?.totalPages || 1);
        setTotalElements(result?.totalElements || 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, itemsPerPage, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    return { total: totalElements };
  }, [totalElements]);

  // Columns
  const columns: TableColumn<ReportItem>[] = [
    { key: "id", label: "ID" },
    { key: "userName", label: "User Name" },
    { key: "heritageName", label: "Heritage Name" },
    {
      key: "reason",
      label: "Lý do",
      render: (v: string) => (v && v.length > 40 ? <span title={v}>{v.slice(0, 40)}...</span> : v),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (d: string) => new Date(d).toLocaleString(),
    },
  ];

  // Handlers
  const handleView = (item: ReportItem) => setViewReport(item);
  const handleDelete = (item: ReportItem) => setConfirmDelete(item);
  const handleAnswer = (item: ReportItem) => setSelectedReport(item);
  const navigate = useNavigate();

  const [viewReport, setViewReport] = useState<ReportItem | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<ReportItem | null>(null);

  const handleSubmitAnswer = async () => {
    if (!selectedReport || !answerText.trim()) return;
    try {
      await answerReport({ reportId: selectedReport.id, answer: answerText.trim() });
      setSelectedReport(null);
      setAnswerText("");
      // Refresh the list after answering
      const res = await fetchReports({ page: currentPage, pageSize: itemsPerPage, keyword: searchTerm });
      const result = res.result;
      setReports(result?.items || []);
      setTotalPages(result?.totalPages || 1);
      setTotalElements(result?.totalElements || 0);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await deleteReport(confirmDelete.id);
      const res = await fetchReports({ page: currentPage, pageSize: itemsPerPage, keyword: searchTerm });
      const result = res.result;
      setReports(result?.items || []);
      setTotalPages(result?.totalPages || 1);
      setTotalElements(result?.totalElements || 0);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 flex items-center gap-2">
            <Filter size={16} />
            Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng báo cáo</p>
            <p className="text-xl font-semibold">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        filters={[]}
        onFilterChange={() => {}}
      />

      {/* Table */}
      <DataTable<ReportItem>
        data={reports}
        columns={columns}
        loading={loading}
        onView={(item) => navigate(`/reports/${item.id}`)}
        onDelete={handleDelete}
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
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setViewReport(null)}>
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
                <p className="font-medium whitespace-pre-wrap">{viewReport.reason || "(không có)"}</p>
              </div>
              <div>
                <p className="text-gray-500">Ngày tạo</p>
                <p className="font-medium">{new Date(viewReport.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewReport(null)} className="px-4 py-2 border rounded-md">Đóng</button>
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
              Báo cáo từ người dùng <b>{selectedReport.userId}</b> về di sản: <b>{selectedReport.heritageName}</b>
            </p>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full border rounded-md p-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập câu trả lời..."
            />
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 border rounded-md">Hủy</button>
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

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Xóa báo cáo</h3>
            <p className="text-sm text-gray-600">Bạn có chắc muốn xóa báo cáo: "{confirmDelete.reason}"? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border rounded-md">Hủy</button>
              <button onClick={confirmDeleteAction} className="px-4 py-2 bg-red-600 text-white rounded-md">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
