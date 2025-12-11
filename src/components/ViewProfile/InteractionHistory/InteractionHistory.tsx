import React, { useEffect, useState } from "react";
import { format, isValid } from "date-fns";
import { History, Eye, Calendar, ArrowRight, PackageX } from "lucide-react";
import { getSubscriptionByUser } from "../../../services/subscriptionService";
import { SubscriptionResponse } from "../../../types/subscription";
import Spinner from "../../Layouts/LoadingLayouts/Spinner";
import SubscriptionDetailModal from "./SubscriptionDetailModal";

// --- Helpers ---
const formatDateSafe = (dateString: string | undefined | null) => {
  if (!dateString) return "...";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "dd/MM/yyyy") : "...";
};

// =========================================================================
// SỬA LỖI TẠI ĐÂY: CẬP NHẬT renderStatusBadge ĐỂ KIỂM TRA startAt
// Hàm nhận vào toàn bộ item thay vì chỉ status
const renderStatusBadge = (item: SubscriptionResponse) => {
  const statusKey = String(item.status).toUpperCase();
  
  // SỬ DỤNG Date() GỐC CỦA JS
  const startAtDate = new Date(item.startAt);
  const now = new Date();

  let displayStatusKey = statusKey;

  // LOGIC "CHỜ MỞ": 
  // Nếu trạng thái hiện tại là ACTIVE (đã xác nhận) hoặc PENDING (chờ thanh toán/kích hoạt)
  // VÀ ngày bắt đầu (startAt) còn SAU thời điểm hiện tại.
  if (
    (statusKey === "ACTIVE" || statusKey === "PENDING" || statusKey === "UPGRADED") &&
    startAtDate.getTime() > now.getTime()
  ) {
    displayStatusKey = "AWAITING_START"; // Key mới cho trạng thái "Chờ mở"
  } 

  const styles: Record<string, string> = {
    "ACTIVE": "bg-green-100 text-green-700 border-green-200",
    "EXPIRED": "bg-red-100 text-red-700 border-red-200",
    "PENDING": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "CANCELLED": "bg-gray-100 text-gray-700 border-gray-200",
    "UPGRADED": "bg-blue-100 text-blue-700 border-blue-200",
    // THÊM STYLE CHO TRẠNG THÁI MỚI
    "AWAITING_START": "bg-purple-100 text-purple-700 border-purple-200", 
  };

  const labels: Record<string, string> = {
    "ACTIVE": "Đang hoạt động",
    "EXPIRED": "Hết hạn",
    "PENDING": "Chờ xử lý",
    "CANCELLED": "Đã hủy",
    "UPGRADED": "Đã nâng cấp",
    // THÊM LABEL CHO TRẠNG THÁI MỚI
    "AWAITING_START": "Chờ mở",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[displayStatusKey] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {labels[displayStatusKey] || "Không xác định"}
    </span>
  );
};
// =========================================================================


const InteractionHistory: React.FC = () => {
  const [dataList, setDataList] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionResponse | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSubscriptionByUser();
      if (res.message && res.result) {
        setDataList(res.result as unknown as SubscriptionResponse[]);
      }
    } catch (error) {
      console.error("Failed to load subscriptions", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC THỐNG KÊ ---
  const activeCount = dataList.filter(item => String(item.status).toUpperCase() === "ACTIVE").length;

  const totalSpent = dataList.reduce((acc, item) => {
    const s = String(item.status).toUpperCase();
    // Giả định tổng tiền chi tiêu là giá gói của các gói đã ACTIVE hoặc EXPIRED
    if (s === "ACTIVE" || s === "EXPIRED" || s === "UPGRADED") {
      // Lưu ý: Tùy thuộc vào cách bạn quản lý thanh toán, có thể cần tính tổng payments thay vì giá gói
      return acc + item.package.price; 
    }
    return acc;
  }, 0);

  // --- Render Functions ---
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageX className="w-20 h-20 text-yellow-300 mb-4" />
        <p className="text-gray-500 text-lg font-medium">Chưa có lịch sử đăng ký nào</p>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center h-40"><Spinner size={40} /></div>;
    if (!dataList || dataList.length === 0) return renderEmptyState();

    return dataList.map((item) => (
        <div key={item.id} className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-800">{item.package.name}</h3>
              {/* SỬA LỖI TẠI ĐÂY: Truyền toàn bộ item */}
              {renderStatusBadge(item)} 
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 opacity-70" />
                <span>{formatDateSafe(item.startAt)} - {formatDateSafe(item.endAt)}</span>
              </div>
              <div className="font-medium text-gray-700 mt-1 flex items-start">
                {/* HIỂN THỊ TIỀN TRONG LIST ITEM */}
                <span>{item.package.price.toLocaleString("vi-VN")}</span>
                <span className="text-[10px] ml-0.5 -mt-0.5 align-top font-semibold text-gray-500">VND</span>
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => setSelectedSubscription(item)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 hover:bg-blue-600 hover:text-white hover:shadow-lg rounded-lg font-medium transition-all group-hover:bg-blue-50 group-hover:text-blue-600 border border-gray-200"
            >
              <Eye className="w-4 h-4" />
              Xem chi tiết
              <ArrowRight className="w-4 h-4 ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ));
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-black mb-3 flex items-center gap-3">
            <History className="w-10 h-10 text-blue-600" />
            Lịch sử tương tác
          </h2>
          <p className="text-gray-700 text-lg">Theo dõi trạng thái và thanh toán</p>
        </div>

        {/* STATS CARDS */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-yellow-300/50 shadow-lg min-w-[120px] flex-1 lg:flex-none">
            <div className="text-3xl font-bold text-yellow-700">{loading ? "-" : dataList.length}</div>
            <div className="text-sm text-yellow-600 font-medium">Tổng gói</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-amber-300/50 shadow-lg min-w-[120px] flex-1 lg:flex-none">
            <div className="text-3xl font-bold text-amber-700">{loading ? "-" : activeCount}</div>
            <div className="text-sm text-amber-600 font-medium">Hoạt động</div>
          </div>

          {/* Card 3: Tổng tiền (VND nhỏ ở trên) */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-emerald-300/50 shadow-lg min-w-[150px] flex-1 lg:flex-none">
            <div className="text-3xl font-bold text-emerald-700 flex items-start">
                {loading ? "-" : (
                  <>
                    <span>{totalSpent.toLocaleString("vi-VN")}</span>
                    {/* Dùng relative -top-2 để đẩy chữ lên cao */}
                    <span className="text-sm font-semibold ml-1 relative -top-2">VND</span>
                  </>
                )}
            </div>
            <div className="text-sm text-emerald-600 font-medium">Đã chi tiêu</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {renderContent()}
      </div>

      <SubscriptionDetailModal
        open={!!selectedSubscription}
        data={selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
      />
    </div>
  );
};

export default InteractionHistory;