import React, { useEffect, useState, useMemo } from "react";
import { Spin } from "antd";
import {
  DollarSign,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import Pagination from "../../Layouts/Pagination";
import { GetSubscriptions } from "../../../services/subscriptionService";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { SubscriptionResponse } from "../../../types/subscription";

// --------------------------------------------------------------------

interface FinancialSummary {
  totalRevenueAllTime: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  totalSubscriptions: number;
}

interface PackageRevenue {
  packageName: string;
  totalRevenue: number;
  subscriptionCount: number;
  averagePrice: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    label: string;
    render?: (value: any, record: T) => React.ReactNode;
  }[];
  loading?: boolean;
}

// Simple DataTable component (Bảng Dữ liệu đơn giản)
const DataTable = <T extends {}>({ data, columns, loading }: DataTableProps<T>) => {
  if (loading)
    return (
      <div className="text-center py-10">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={column.key as string || idx}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column, colIdx) => (
                  <td
                    key={column.key as string || colIdx}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render((item as any)[column.key], item)
                      : String((item as any)[column.key])}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có dữ liệu báo cáo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Small Stat Card (Thẻ Thống kê nhỏ)
const StatCard = ({ title, value, icon, color }: any) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md flex items-center gap-4">
    <div className={`p-3 rounded-full ${color} bg-opacity-20`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </div>
);

// --------------------------------------------------------------------

const FinancialReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "PACKAGE">("SUMMARY");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number) => {
    if (!amount) return "0₫";
    return `${amount.toLocaleString("vi-VN")}₫`;
  };

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await GetSubscriptions();
      if (res.result) setAllSubscriptions(res.result);
      else setAllSubscriptions([]);
    } catch (error) {
      console.error("Lỗi khi tải Đăng ký:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  // ---------------------------------------------------------------
  // AGGREGATION + CHART DATA (Tổng hợp và Dữ liệu Biểu đồ)
  // ---------------------------------------------------------------

  const { summary, packageRevenueData, chartData } = useMemo(() => {
    const summary: FinancialSummary = {
      totalRevenueAllTime: 0,
      activeSubscriptions: 0,
      monthlyRecurringRevenue: 0,
      totalSubscriptions: allSubscriptions.length,
    };

    const packageMap = new Map<string, PackageRevenue>();

    allSubscriptions.forEach((sub) => {
      // Chỉ tính doanh thu nếu có Payments HOẶC trạng thái là ACTIVE (giả định đã thanh toán)
      const isRevenue =
        (sub.payments && sub.payments.length > 0) ||
        (sub.status as any) === "ACTIVE";

      const pkgName = sub.package?.name || "Gói không xác định";
      const price = sub.package?.price || 0;
      const pkgId = sub.package?.id?.toString();

      if (isRevenue) {
        summary.totalRevenueAllTime += price;

        if ((sub.status as any) === "ACTIVE") {
          summary.activeSubscriptions += 1;
          // Lưu ý: Đây là giả định rằng giá gói bằng MRR
          summary.monthlyRecurringRevenue += price;
        }

        if (pkgId) {
          if (!packageMap.has(pkgId)) {
            packageMap.set(pkgId, {
              packageName: pkgName,
              totalRevenue: 0,
              subscriptionCount: 0,
              averagePrice: 0,
            });
          }
          const pkg = packageMap.get(pkgId)!;
          pkg.totalRevenue += price;
          pkg.subscriptionCount += 1;
          pkg.averagePrice = pkg.totalRevenue / pkg.subscriptionCount;
        }
      }
    });

    const packageRevenueData = Array.from(packageMap.values());

    const chartData = packageRevenueData.map((p) => ({
      name: p.packageName,
      revenue: p.totalRevenue,
      count: p.subscriptionCount,
      avgPrice: p.averagePrice,
    }));

    return { summary, packageRevenueData, chartData };
  }, [allSubscriptions]);

  // Pagination (Phân trang)
  const paginatedPackageData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return packageRevenueData.slice(start, start + itemsPerPage);
  }, [packageRevenueData, currentPage]);

  const totalPackagePages = Math.ceil(packageRevenueData.length / itemsPerPage);

  const packageColumns = [
    {
      key: "packageName",
      label: "Tên Gói",
      render: (v: string) => <span className="font-medium text-blue-600">{v}</span>,
    },
    {
      key: "subscriptionCount",
      label: "Số lượng đăng ký",
      render: (v: number) => v.toLocaleString("vi-VN"),
    },
    {
      key: "totalRevenue",
      label: "Tổng Doanh thu",
      render: (v: number) => (
        <span className="font-semibold text-green-600">{formatCurrency(v)}</span>
      ),
    },
    {
      key: "averagePrice",
      label: "Giá TB",
      render: (v: number) => formatCurrency(v),
    },
  ];

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu báo cáo...">
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-600" />
          Báo cáo Tài chính Đăng ký
        </h2>

        {/* SUMMARY CARDS (Các Thẻ Tóm Tắt) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Tổng Doanh thu"
            value={formatCurrency(summary.totalRevenueAllTime)}
            icon={<DollarSign className="text-green-600" />}
            color="text-green-600"
          />
          <StatCard
            // MRR: Monthly Recurring Revenue (Doanh thu định kỳ hàng tháng)
            title="MRR (Hàng tháng)"
            value={formatCurrency(summary.monthlyRecurringRevenue)}
            icon={<BarChart3 className="text-blue-600" />}
            color="text-blue-600"
          />
          <StatCard
            title="Đang Hoạt động"
            value={summary.activeSubscriptions}
            icon={<Users className="text-indigo-600" />}
            color="text-indigo-600"
          />
          <StatCard
            title="Tổng số Đăng ký"
            value={summary.totalSubscriptions}
            icon={<Package className="text-yellow-600" />}
            color="text-yellow-600"
          />
        </div>

        {/* TAB CONTROL (Điều khiển Tab) */}
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Phân tích chi tiết</h3>
            <button
              onClick={loadSubscriptions}
              className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Làm mới dữ liệu
            </button>
          </div>

          <div className="flex gap-2 border-b border-gray-200 pt-4">
            {[
              { key: "SUMMARY", label: "Tổng quan & KPI" },
              { key: "PACKAGE", label: "Doanh thu theo gói" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`px-4 py-2 rounded-t-lg font-medium ${
                  activeTab === t.key
                    ? "bg-white text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT (Nội dung Tab) */}
        {activeTab === "SUMMARY" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h4 className="text-xl font-bold mb-4">Biểu đồ Doanh thu và Phân tích</h4>

              <div className="space-y-6">
                
                {/* Line Chart (Biểu đồ Đường) */}
                <div className="bg-white p-5 rounded-xl border shadow">
                  <h4 className="font-semibold mb-3">Biểu đồ đường – Doanh thu và Giá trung bình theo gói</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 50, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} /> {/* Format YAxis */}
                      {/* Cập nhật formatter để hiển thị tên */}
                      <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#2563eb" name="Tổng Doanh thu" />
                      <Line type="monotone" dataKey="avgPrice" stroke="#16a34a" name="Giá trung bình (TB)" />
                    </LineChart>
                  </ResponsiveContainer>
                  
                </div>

                {/* Bar Chart (Biểu đồ Cột) */}
                <div className="bg-white p-5 rounded-xl border shadow">
                  <h4 className="font-semibold mb-3">Biểu đồ cột – Số lượng đăng ký và Doanh thu theo gói</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 50, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" tickFormatter={(value) => formatCurrency(value)} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                      {/* SỬA LỖI FORMATTER: Phải trả về mảng [value, name] và dùng props.dataKey để kiểm tra */}
                      <Tooltip 
                        formatter={(value: number, name: string, props) => {
                          const isCount = props.dataKey === "count";
                          return [
                            isCount ? value.toLocaleString("vi-VN") + " lượt" : formatCurrency(value), // Giá trị
                            isCount ? "Số lượng đăng ký" : "Tổng Doanh thu", // Nhãn
                          ];
                        }} 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#f59e0b" name="Tổng Doanh thu" />
                      <Bar yAxisId="right" dataKey="count" fill="#10b981" name="Số lượng đăng ký" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === "PACKAGE" && (
          <div className="space-y-6">
            
            {/* Bar Chart - Revenue by Package */}
            <div className="bg-white p-6 rounded-xl border shadow">
              <h4 className="text-xl font-semibold mb-4">Biểu đồ Doanh thu theo Gói</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  {/* SỬA LỖI TOOLTIP: Tooltip sẽ tự động tìm kiếm tất cả các dataKey trong chartData.
                      Cần phải sử dụng props.dataKey để chỉ hiển thị 'revenue' và ẩn 'count'/'avgPrice' 
                      hoặc chỉ hiển thị các giá trị có ý nghĩa. */}
                  <Tooltip 
                    formatter={(value: number, name: string, props) => {
                      if (props.dataKey === "revenue") {
                        return [formatCurrency(value), "Doanh thu"]; // Chỉ hiện revenue
                      }
                      // Ẩn các dataKey không có Bar tương ứng (như count, avgPrice)
                      return null; 
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#2563eb" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h4 className="text-xl font-semibold text-gray-800 mt-6">Chi tiết Doanh thu theo Gói (Bảng)</h4>
            <DataTable data={paginatedPackageData} columns={packageColumns} loading={loading} />

            {packageRevenueData.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPackagePages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={packageRevenueData.length}
              />
            )}
          </div>
        )}
      </div>
    </Spin>
  );
};

export default FinancialReports;