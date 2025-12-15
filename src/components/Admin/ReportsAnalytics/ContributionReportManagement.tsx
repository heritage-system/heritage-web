import React, { useEffect, useState } from "react";
import { AlertTriangle, X, MessageSquare } from "lucide-react";
import { Input, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Pagination from "../../Layouts/Pagination";

import { TableProps, ContributionReport, TableColumn } from "../../../types/contributionReport";
import { fetchContributionReports, answerContributionReport } from "../../../services/contributionReportService";
import { useNavigate } from "react-router-dom";
import  ContributionReportDetailManagement from "./ContributionReportDetailManagement"
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
      <div className="overflow-x-auto">
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
    </div>
  );
}
type ViewMode = "list" | "detail" | "create" | "edit";
// ===================== ContributionReport Management =====================
const ContributionReportManagement: React.FC = () => {
  const [reports, setContributionReports] = useState<ContributionReport[]>([]);
   const [viewMode, setViewMode] = useState<ViewMode>("list");
   const [selectedContributionReportId, setSelectedContributionReportId] = useState<any>(null);
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

  const load = async () => {
      setLoading(true);
      try {
        const res = await fetchContributionReports({
          page: currentPage,
          pageSize: itemsPerPage,
          keyword: searchTerm,
          startDate,
          endDate,
          status: statusFilter,
        });
        const result = res.result;
        setContributionReports(result?.items || []);
        setTotalPages(result?.totalPages || 1);
        setTotalElements(result?.totalElements || 0);

        const [pendingRes, answeredRes, cancelRes] = await Promise.all([
          fetchContributionReports({ page: 1, pageSize: 10, status: "PENDING" }),
          fetchContributionReports({ page: 1, pageSize: 10, status: "ANSWERED" }),
          fetchContributionReports({ page: 1, pageSize: 10, status: "CANCEL" }),
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

    useEffect(() => {
      load();
    }, [currentPage, searchTerm, startDate, endDate, statusFilter]);

  const columns: TableColumn<ContributionReport>[] = [
    { key: "id", label: "ID" },
    { key: "userName", label: "Người dùng" },
    { key: "contributionName", label: "Bài viết" },
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


  const handleAnswer = (item: ContributionReport) => setSelectedContributionReport(item);
  const navigate = useNavigate();

  const [viewContributionReport, setViewContributionReport] = useState<ContributionReport | null>(null);
  const [selectedContributionReport, setSelectedContributionReport] = useState<ContributionReport | null>(null);
  const [answerText, setAnswerText] = useState("");

  const handleSubmitAnswer = async () => {
    if (!selectedContributionReport || !answerText.trim()) return;
    try {
      await answerContributionReport({
        reportId: selectedContributionReport.id,
        answer: answerText.trim(),
      });
      setSelectedContributionReport(null);
      setAnswerText("");
      // Refresh the list after answering
      const res = await fetchContributionReports({
        page: currentPage,
        pageSize: itemsPerPage,
        keyword: searchTerm,
        status: statusFilter,
      });
      const result = res.result;
      setContributionReports(result?.items || []);
      setTotalPages(result?.totalPages || 1);
      setTotalElements(result?.totalElements || 0);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleView = async (id: number) => {
    setSelectedContributionReportId(id);
    setViewMode("detail");
  }
  const handleCloseView = async () => {
    setSelectedContributionReportId(null);
    setViewMode("list");
    load();
  }
  return (
    <Spin spinning={loading}>
      <div className="space-y-6">
        {/* Header */}
        {viewMode === "list" && (
        <>
        <h2 className="text-2xl font-bold mb-4">Quản lý báo cáo</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { key: "PENDING", label: "Đang chờ", color: "bg-yellow-100 text-yellow-700", borderColor: "border-yellow-200" },
            { key: "ANSWERED", label: "Đã trả lời", color: "bg-green-100 text-green-700", borderColor: "border-green-200" },
            { key: "CANCEL", label: "Đã hủy", color: "bg-red-100 text-red-700", borderColor: "border-red-200" },
          ].map((item) => (
            <div
              key={item.key}
              className={`rounded-xl border ${item.borderColor} bg-white p-4 flex items-center gap-3 shadow-sm`}
            >
              <div className={`p-2 rounded-lg ${item.color}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-semibold text-gray-900">
                  {statusCounts[item.key as keyof typeof statusCounts]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <Input
              placeholder="Tìm kiếm theo tên người dùng, di sản..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              prefix={<SearchOutlined className="text-gray-500 text-lg" />}
              className="border rounded-lg px-3 py-2.5 w-full md:w-64 text-base"
              style={{ height: 44 }}
              allowClear
            />

            {/* Date Filters */}
            <div className="flex items-center gap-3 flex-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Đến ngày"
              />
              {(searchTerm || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Tabs */}
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
        <DataTable<ContributionReport>
          data={reports}
          columns={columns}
          loading={loading}
          onView={(item) => handleView(item.id)}
          onAnswer={handleAnswer}
        />

        {/* Pagination */}
        {totalPages > 1 &&(<Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalElements}
        />)}

        {/* View Modal */}
        {viewContributionReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setViewContributionReport(null)}
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold mb-4">Chi tiết báo cáo</h3>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-1">User Name</p>
                    <p className="font-medium text-gray-900">{viewContributionReport.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Id lễ hội</p>
                    <p className="font-medium text-gray-900">{viewContributionReport.contributionId}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 mb-1">Tên bài viết</p>
                    <p className="font-medium text-gray-900">{viewContributionReport.contributionName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Lý do</p>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">
                      {viewContributionReport.reason || "(không có)"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Trạng thái</p>
                  <p className="font-medium text-gray-900">
                    {statusLabels[viewContributionReport.status as keyof typeof statusLabels] || "(không có)"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Ngày tạo</p>
                  <p className="font-medium text-gray-900">
                    {new Date(viewContributionReport.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-6 border-t pt-4">
                <button
                  onClick={() => setViewContributionReport(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Answer Modal */}
        {selectedContributionReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-2">Trả lời báo cáo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Báo cáo từ người dùng <b>{selectedContributionReport.userName}</b> về di sản:{" "}
                <b>{selectedContributionReport.contributionName}</b>
              </p>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập câu trả lời..."
              />
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setSelectedContributionReport(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Gửi trả lời
                </button>
              </div>
            </div>
          </div>
        )}
        </>
        )}

        {viewMode === "detail" && (
        <>
          <ContributionReportDetailManagement onClose={handleCloseView} reportId={selectedContributionReportId}/>
        </>)}
      </div>
    </Spin>
  );
};

export default ContributionReportManagement;
