import React, { useEffect, useState } from "react";
import { Spin, Input, DatePicker } from "antd"; 
import { SearchOutlined } from "@ant-design/icons";
import { Eye } from "lucide-react";
import Pagination from "../../Layouts/Pagination";
import { GetSubscriptions } from "../../../services/subscriptionService";
import { SubscriptionResponse } from "../../../types/subscription";
import dayjs, { Dayjs } from "dayjs"; 
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker; 


const statusColors: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-100",
  PAID: "text-green-600 bg-green-100",
  FAILED: "text-red-600 bg-red-100",
  CANCELLED: "text-gray-600 bg-gray-200",
  ACTIVE: "text-green-700 bg-green-100",
  EXPIRED: "text-gray-500 bg-gray-100",
  UPGRADED: "text-blue-600 bg-blue-100",
};

const subscriptionStatusTranslations: Record<string, string> = {
  PENDING: "Đang chờ",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  CANCELLED: "Đã hủy",
  ACTIVE: "Đang hoạt động",
  EXPIRED: "Đã hết hạn",
  UPGRADED: "Đã nâng cấp",
};

const getSubscriptionStatus = (status: string): string => {
  return subscriptionStatusTranslations[status] || status; 
};

const benefitNameTranslations: Record<string, string> = {
  QUIZ: "Trò chơi",
  TOUR: "Trải nghiệm 360°",
  CONTRIBUTION: "Bài viết đóng góp",
};

const getBenefitName = (name: string): string => {
  return benefitNameTranslations[name] || name; 
};

const paymentStatusTranslations: Record<string, string> = {
  PENDING: "Đang chờ",
  PAID: "Thành công",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
};

// Hàm hỗ trợ hiển thị trạng thái thanh toán có màu sắc
const paymentStatusColors: Record<string, string> = {
  PENDING: "text-yellow-800 bg-yellow-200",
  PAID: "text-green-800 bg-green-200",
  FAILED: "text-red-800 bg-red-200",
  CANCELLED: "text-gray-800 bg-gray-300",
};

const renderColoredPaymentStatus = (status: string): React.ReactNode => {
  const colorClass = paymentStatusColors[status] || "bg-gray-200 text-gray-700";
  const translatedStatus = paymentStatusTranslations[status] || status;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}
    >
      {translatedStatus}
    </span>
  );
};


const PaymentProcessing: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [filtered, setFiltered] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");
  
  // <<< CẬP NHẬT: State cho khoảng thời gian
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selected, setSelected] = useState<SubscriptionResponse | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await GetSubscriptions();
      if (res.result) {
        setSubscriptions(res.result);
        setFiltered(res.result);
      }
    } finally {
      setLoading(false);
    }
  };

  // === Filter Logic ===
  useEffect(() => {
    let data = [...subscriptions];

    // Lọc theo từ khóa
    if (search.trim()) {
      data = data.filter(
        (x) =>
          x.package?.name.toLowerCase().includes(search.toLowerCase()) ||
          String(x.userId).includes(search)
      );
    }

    // Lọc theo trạng thái
    if (statusFilter !== "ALL") {
      data = data.filter((x) => x.status === (statusFilter as any));
    }
    
    // <<< CẬP NHẬT: Lọc theo khoảng thời gian
    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('day');
      const end = dateRange[1].endOf('day');

      data = data.filter((x) => {
        // Lấy ngày bắt đầu của subscription
        const subscriptionStart = dayjs(x.startAt);
        // Kiểm tra xem ngày bắt đầu của subscription có nằm trong khoảng đã chọn không
        // (subscriptionStart >= start) AND (subscriptionStart <= end)
        return subscriptionStart.isSameOrAfter(start) && subscriptionStart.isSameOrBefore(end);
      });
    }


    setFiltered(data);
    setCurrentPage(1);
  }, [search, statusFilter, dateRange, subscriptions]); // <<< CẬP NHẬT: Thêm dateRange vào dependencies

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Spin spinning={loading} tip="Đang tải...">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Quản lý Đăng ký Gói</h2>

        {/* Bộ lọc */}
        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Input tìm kiếm */}
            <Input
              allowClear
              placeholder="Tìm theo ID người dùng hoặc tên gói..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
            
            {/* Bộ lọc khoảng thời gian */}
            <RangePicker
                value={dateRange}
                onChange={(dates: [Dayjs | null, Dayjs | null] | null) => setDateRange(dates)}
                format="DD/MM/YYYY"
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                className="w-full md:w-64"
            />

            {/* Bộ lọc trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-700"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="PENDING">PENDING (Đang chờ)</option>
              <option value="CANCELLED">CANCELLED (Đã hủy)</option>
              <option value="EXPIRED">EXPIRED (Đã hết hạn)</option>
              <option value="UPGRADED">UPGRADED (Đã nâng cấp)</option>
            </select>
          </div>
        </div>

        {/* Bảng */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {["ID", "Người dùng", "Gói", "Bắt đầu", "Kết thúc", "Trạng thái", "Hành động"].map(
                    (h, idx) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{s.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{s.userId}</td>
                    <td className="px-6 py-4 text-sm">{s.package?.name}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(s.startAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(s.endAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          statusColors[s.status] || "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {getSubscriptionStatus(String(s.status))} 
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelected(s)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-4 text-center text-gray-500"
                      colSpan={7}
                    >
                      Không tìm thấy dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phân trang */}
        {filtered.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filtered.length}
          />
        )}

        {/* Modal Chi tiết Đăng ký */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl relative max-h-[95vh] overflow-y-auto">
              {/* Nút Đóng */}
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                onClick={() => setSelected(null)}
                aria-label="Đóng chi tiết"
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold mb-5">Chi tiết Đăng ký Gói</h3>

              {/* Layout 2 Cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CỘT TRÁI — THÔNG TIN CƠ BẢN */}
                <div className="space-y-3 text-sm bg-gray-50 p-5 rounded-xl shadow-sm border">
                  <p>
                    <b>ID Người dùng:</b> {selected.userId}
                  </p>

                  <p>
                    <b>Gói Đăng ký:</b> {selected.package?.name} —{" "}
                    <span className="text-blue-600 font-semibold">
                      {selected.package?.price.toLocaleString()}₫
                    </span>
                  </p>

                  <p>
                    <b>Thời gian hiệu lực:</b> <br />
                    {new Date(selected.startAt).toLocaleString("vi-VN")} →{" "}
                    {new Date(selected.endAt).toLocaleString("vi-VN")}
                  </p>

                  <p>
                    <b>Trạng thái:</b>{" "}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                        statusColors[selected.status].includes("text-")
                          ? statusColors[selected.status]
                          : `text-white ${statusColors[selected.status]}`
                      }`}
                    >
                      {getSubscriptionStatus(String(selected.status))} 
                    </span>
                  </p>
                </div>

                {/* CỘT PHẢI — THANH TOÁN */}
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-3">Thông tin Thanh toán</h4>

                  {selected.payments?.length ? (
                    <div className="space-y-3">
                      {selected.payments.map((p) => (
                        <div
                          key={p.id}
                          className="border bg-gray-50 p-4 rounded-xl shadow-sm"
                        >
                          <p>
                            <b>ID Thanh toán:</b> {p.id} 
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-800 mt-1">
                            <b>Trạng thái Thanh toán:</b> 
                            {renderColoredPaymentStatus(String(p.paymentStatus))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">(Chưa có giao dịch thanh toán nào được ghi nhận)</p>
                  )}
                </div>

                {/* TOÀN CHIỀU RỘNG — BẢN GHI SỬ DỤNG */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-800 text-lg mb-3">Bản ghi Sử dụng (Tài nguyên)</h4>

                  {selected.usageRecords?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selected.usageRecords.map((u) => (
                        <div
                          key={u.id}
                          className="border rounded-xl p-4 bg-gray-50 shadow-sm"
                        >
                          <p className="font-medium">{getBenefitName(String(u.benefitName))}</p>
                          
                          <p>
                            Đã sử dụng{" "}
                            <span className="text-blue-600 font-semibold">
                              {u.used}
                            </span>{" "}
                            / {u.total}
                          </p>
                          
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">(Không có bản ghi sử dụng nào)</p>
                  )}
                </div>
              </div>

              {/* Chân trang Modal */}
              <div className="flex justify-end mt-6">
                <button
                  className="px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
                  onClick={() => setSelected(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
};

export default PaymentProcessing;