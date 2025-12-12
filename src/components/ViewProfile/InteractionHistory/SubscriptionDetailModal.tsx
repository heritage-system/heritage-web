import React from "react";
import { format } from "date-fns";
import {
  BadgeCheck,
  Calendar,
  Clock,
  CreditCard,
  Package,
  X,
} from "lucide-react";
import { SubscriptionResponse } from "../../../types/subscription";
import { SubscriptionStatus, PaymentStatus, BenefitName } from "../../../types/enum"; 
import PortalModal from "../../Layouts/ModalLayouts/PortalModal"; 

interface Props {
  open: boolean;
  data: SubscriptionResponse | null;
  onClose: () => void;
}

const SubscriptionDetailModal: React.FC<Props> = ({ open, data, onClose }) => {
  
  // --- Helpers Color ---
  const paymentStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case PaymentStatus.PAID: return "bg-green-600";
      case PaymentStatus.FAILED: return "bg-red-600";
      case PaymentStatus.CANCELLED: return "bg-gray-600";
      case PaymentStatus.PENDING: return "bg-yellow-600";
      default: return "bg-gray-500";
    }
  };

  // 🟢 HELPER MỚI: Dịch trạng thái thanh toán sang Tiếng Việt chuẩn
  const getPaymentStatusLabel = (status: any): string => {
    // Ép kiểu về string uppercase để so sánh cho chắc chắn (vì enum có thể là số hoặc chữ)
    const s = String(status).toUpperCase();
    
    // So sánh với cả tên Enum (String) và giá trị Enum (Number)
    if (s === "PAID" || status === PaymentStatus.PAID) return "Đã thanh toán";
    if (s === "PENDING" || status === PaymentStatus.PENDING) return "Chờ thanh toán";
    if (s === "FAILED" || status === PaymentStatus.FAILED) return "Thất bại";
    if (s === "CANCELLED" || status === PaymentStatus.CANCELLED) return "Đã hủy";
    
    return "Không xác định";
  };

  // 🟢 HELPER: Dịch tên quyền lợi
  const getBenefitLabel = (name: any): string => {
    const value = Number(name);
    switch (value) {
      case BenefitName.QUIZ: return "Trò chơi";
      case BenefitName.TOUR: return "Trải nghiệm 360°";
      case BenefitName.CONTRIBUTION: return "Bài viết đóng góp";
      default:
        const str = String(name).toUpperCase();
        if (str === "QUIZ") return "Trò chơi";
        if (str === "TOUR") return "Trải nghiệm 360°";
        if (str === "CONTRIBUTION") return "Bài viết đóng góp";
        return str;
    }
  };


  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="xl"                
      maxWidth="1100px"        
      centered={true}
      closeOnOverlay={true}
      lockScroll={true}
      noPadding={false}
      contentClassName="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    >
        {data && (
            <>
                {/* ... (Phần Header giữ nguyên) ... */}
                <div className={`p-6 flex justify-between items-center text-white shrink-0 ${
                    data.status === SubscriptionStatus.ACTIVE 
                    ? 'bg-gradient-to-r from-green-500 to-teal-600' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                    {data.package.name}
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full uppercase border border-white/30">
                        {data.package.currency}
                    </span>
                    </h2>
                    <p className="text-base opacity-95 mt-1">{data.package.marketingMessage}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <X className="w-7 h-7" />
                </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 space-y-8">
                
                {/* 1. Subscription Info (Giữ nguyên) */}
                <div>
                    <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" /> Chi tiết gói dịch vụ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase font-semibold">Giá gói</span>
                            <span className="font-bold text-gray-800 text-2xl mt-1">
                                {data.package.price.toLocaleString("vi-VN")} {data.package.currency}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase font-semibold">Thời hạn</span>
                            <span className="font-bold text-gray-800 text-xl mt-1">
                                {data.package.durationDays ? `${data.package.durationDays} ngày` : "Vô thời hạn"} 
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <div>
                                <span className="text-gray-500 text-xs block font-semibold">Ngày bắt đầu</span>
                                <span className="font-medium text-base">
                                {data.startAt ? format(new Date(data.startAt), "dd/MM/yyyy HH:mm") : "N/A"}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-red-500" />
                            <div>
                                <span className="text-gray-500 text-xs block font-semibold">Ngày kết thúc</span>
                                <span className="font-medium text-base">
                                {data.endAt ? format(new Date(data.endAt), "dd/MM/yyyy HH:mm") : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Grid Benefits & Usage (Giữ nguyên) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-4">Quyền lợi gói</h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {data.package.benefits.map((b, index) => (
                            <div key={b.benefitId || index} className="p-4 border border-dashed border-gray-200 rounded-xl flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                <div className="font-bold text-gray-800 text-base">{getBenefitLabel(b.benefitName)}</div>
                                </div>
                                <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                {b.value ? `+${b.value}` : "Không giới hạn"}
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5" /> Lịch sử sử dụng
                        </h3>
                        {data.usageRecords.length === 0 ? (
                            <div className="text-gray-400 italic text-base py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                Chưa phát sinh dữ liệu sử dụng.
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {data.usageRecords.map((u, index) => (
                                <div key={u.id || index} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                                <div className="font-bold text-base text-gray-800">{getBenefitLabel(u.benefitName)}</div>
                                <div className="text-right">
                                    <div className="font-bold text-xl text-gray-800">
                                    {u.used} <span className="text-gray-400 font-normal text-base">/ {u.total ?? "∞"}</span>
                                    </div>
                                </div>
                                </div>
                            ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Payments (SỬA CHỖ NÀY) */}
                <div>
                    <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Lịch sử thanh toán
                    </h3>
                    {data.payments.length === 0 ? (
                    <div className="text-gray-400 italic text-base">Chưa có giao dịch thanh toán nào.</div>
                    ) : (
                    <div className="space-y-4">
                        {data.payments.map((p, index) => (
                        <div key={p.id || index} className="p-5 border rounded-xl bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="font-bold text-gray-800 text-lg">#{p.orderCode}</div>
                                <div className="text-sm text-gray-500 mt-1">{p.paymentDescription || "Thanh toán gói dịch vụ"}</div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="font-bold text-xl text-gray-800">
                                    {p.amount.toLocaleString("vi-VN")} VND
                                </div>
                                <span className={`px-3 py-1 mt-1 rounded-md text-xs text-white font-bold uppercase tracking-wide ${paymentStatusColor(p.paymentStatus)}`}>
                                    {/* Sử dụng hàm helper getPaymentStatusLabel */}
                                    {getPaymentStatusLabel(p.paymentStatus)}
                                </span>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                </div>

                {/* === MODAL FOOTER === */}
                <div className="p-5 border-t bg-gray-50 flex justify-end shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-8 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold text-base transition-colors shadow-sm"
                    >
                        Đóng
                    </button>
                </div>
            </>
        )}
    </PortalModal>
  );
};

export default SubscriptionDetailModal;