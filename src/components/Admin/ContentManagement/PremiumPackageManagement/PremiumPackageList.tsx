import { Table, Button, Space, Tag, Input, Popconfirm, Empty } from "antd";
import { DeleteOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { PremiumPackageResponse } from "@/types/premiumPackage";
import { Edit, Eye, Trash2 } from "lucide-react";

interface PremiumPackageListProps {
  packages: PremiumPackageResponse[];
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  onEdit: (id: PremiumPackageResponse) => void;
  loading: boolean;
}

const PremiumPackageList = ({
  packages,
  onDelete,
  onView,
  onEdit,
  loading,
}: PremiumPackageListProps) => {

  const columns = [
  {
    title: <span className="text-gray-500 tracking-wider">ID</span>,
    dataIndex: "id",
    key: "id",
    width: 80,
  },
  {
    title: <span className="text-gray-500 tracking-wider">Tên Gói</span>,
    dataIndex: "name",
    key: "name",
    width: 200,
    render: (text: string) => <strong>{text}</strong>,
  },
  {
    title: <span className="text-gray-500  tracking-wider">Giá</span>,
    dataIndex: "price",
    key: "price",
    width: 120,
    render: (price: number, record: PremiumPackageResponse) =>
      `${price.toLocaleString()} ${record.currency}`,
  },
  { title: <span className="text-gray-500  tracking-wider">Thời Hạn (ngày)</span>, dataIndex: "durationDays", key: "durationDays", width: 130 },
  {
    title: <span className="text-gray-500  tracking-wider">Thông Điệp</span>,
    dataIndex: "marketingMessage",
    key: "marketingMessage",
    width: 250,
    ellipsis: true,
  },
  {
    title:<span className="text-gray-500  tracking-wider">Số Quyền Lợi</span>,
    dataIndex: "benefits",
    key: "benefitsCount",
    width: 120,
    render: (benefits: any[]) => `${benefits?.length || 0}`,
  },
  {
    title: <span className="text-gray-500  tracking-wider">Trạng thái</span>,
    dataIndex: "isActive",
    key: "isActive",
    width: 100,
    render: (isActive: boolean) => (
      <Tag color={isActive ? "green" : "red"}>
        {isActive ? "Hoạt Động" : "Tắt"}
      </Tag>
    ),
  },
  {
    title: <span className="text-gray-500  tracking-wider">Hành động</span>,
    key: "actions",
    width: 180, 
    render: (_: any, record: PremiumPackageResponse) => (
      <Space size="small">
        {onView && (
          <button
            onClick={() => onView(record.id)}
            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
      )}

      {onEdit && (
        <button
          onClick={() => onEdit(record)}
          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
          title="Chỉnh sửa"
        >
          <Edit size={16} />
        </button>
      )}

      <Popconfirm
        title="Xóa Gói Premium"
        description="Bạn có chắc muốn xóa gói này?"
        onConfirm={() => onDelete(record.id)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <button
          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
          title="Xóa"
        >
          <Trash2 size={16} />
        </button>
      </Popconfirm>

    </Space>
  ),
}
,
];
      
  return (
    <div className="premium-package-list">
      {packages.length === 0 && !loading ? (
        <Empty description="Không có gói premium nào" />
      ) : (
        <Table
          columns={columns}
          dataSource={packages.map((pkg) => ({ ...pkg, key: pkg.id }))}
          bordered
          scroll={{ x: 1200 }}
          loading={loading}
          pagination={false} 
        />
      )}
    </div>
  );
};

export default PremiumPackageList;
