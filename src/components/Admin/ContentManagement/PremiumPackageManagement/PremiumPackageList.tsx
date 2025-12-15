import React from "react";
import { Table, Empty, Popconfirm, Pagination } from "antd";
import { Eye, Edit, Trash2 } from "lucide-react";
import { PremiumPackageResponse } from "@/types/premiumPackage";

interface PremiumPackageListProps {
  packages: PremiumPackageResponse[];
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  onEdit: (pkg: PremiumPackageResponse) => void;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, size?: number) => void;
}

const PremiumPackageList: React.FC<PremiumPackageListProps> = ({
  packages,
  onDelete,
  onView,
  onEdit,
  loading,
  currentPage,
  pageSize,
  total,
  onPageChange,
}) => {
  const columns = [
  {
   title: "ID",
   dataIndex: "id",
   key: "id",
   width: 80,
   // Đã bỏ fixed: "left"
   render: (id: number) => (
     <span className="font-medium text-gray-700 tabular-nums">{id}</span>
   ),
 },
 {
   title: "Tên Gói",
   dataIndex: "name",
   key: "name",
   render: (text: string) => <span className="font-semibold text-gray-900">{text}</span>,
 },
 {
   title: "Giá",
   dataIndex: "price",
   key: "price",
   width: 140,
   render: (_: any, record: PremiumPackageResponse) => (
     <span className="font-medium text-gray-900">
       {record.price.toLocaleString("vi-VN")} {record.currency}
     </span>
   ),
 },
 {
   title: "Thời hạn",
   dataIndex: "durationDays",
   key: "durationDays",
   width: 110,
   render: (days: number) => <span className="text-gray-700">{days} ngày</span>,
 },
 {
   title: "Thông điệp",
   dataIndex: "marketingMessage",
   key: "marketingMessage",
   ellipsis: true,
   render: (text: string) => (
     <span className="text-gray-600 text-sm" title={text}>
       {text || "—"}
     </span>
   ),
 },
 {
   title: "Quyền lợi",
   key: "benefitsCount",
   width: 100,
   align: "center" as const,
   render: (_: any, record: PremiumPackageResponse) => (
     <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
       {record.benefits?.length || 0}
     </span>
   ),
 },
 {
   title: "Trạng thái",
   dataIndex: "isActive",
   key: "isActive",
   width: 150,
   align: "center" as const,
   render: (isActive: boolean) => (
     <span
       className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
         isActive
           ? "bg-green-100 text-green-800"
           : "bg-gray-100 text-gray-600"
       }`}
     >
       {isActive ? "Hoạt động" : "Tắt"}
     </span>
   ),
 },
 {
   title: "Hành động",
   key: "actions",
   width: 140,
   align: "center" as const,
   // Đã bỏ fixed: "right" ← QUAN TRỌNG NHẤT
   render: (_: any, record: PremiumPackageResponse) => (
     <div className="flex items-center justify-center gap-3">
       {onView && (
         <button
           onClick={(e) => { e.stopPropagation(); onView(record.id); }}
           className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
           title="Xem chi tiết"
         >
           <Eye size={17} />
         </button>
       )}
       <button
         onClick={(e) => { e.stopPropagation(); onEdit(record); }}
         className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-lg transition-all"
         title="Chỉnh sửa"
       >
         <Edit size={17} />
       </button>
       <Popconfirm
         title="Xóa gói này?"
         description="Hành động này không thể hoàn tác"
         onConfirm={(e) => { e?.stopPropagation(); onDelete(record.id); }}
         onCancel={(e) => e?.stopPropagation()}
         okText="Xóa"
         cancelText="Hủy"
         okButtonProps={{ danger: true }}
       >
         <button
           onClick={(e) => e.stopPropagation()}
           className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
           title="Xóa"
         >
           <Trash2 size={17} />
         </button>
       </Popconfirm>
     </div>
   ),
 },
];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Table
        columns={columns}
        dataSource={packages.map((pkg) => ({ ...pkg, key: pkg.id }))}
        loading={loading}
        pagination={false}
        rowClassName="hover:bg-gray-50/80 transition-colors"
        className="premium-package-table"
        locale={{ emptyText: <Empty description="Không có gói premium nào" /> }}
        components={{
          header: {
            cell: (props: any) => (
              <th
                {...props}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-transparent"
              />
            ),
          },
        }}
      />

      {/* Custom Pagination đẹp hơn */}
      {total > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
            {Math.min(currentPage * pageSize, total)} của {total} gói
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            showSizeChanger={false}
            className="ant-pagination-compact"
          />
        </div>
      )}
    </div>
  );
};

export default PremiumPackageList;