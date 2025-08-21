import React, { useState } from "react";
import { Calendar, FileText, X, CheckCircle, XCircle, Eye } from "lucide-react";

// Loại dữ liệu item
interface ApprovalItem {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
}

const ApprovalManagement: React.FC = () => {
  const [pendingItems, setPendingItems] = useState<ApprovalItem[]>([
    { id: "1", title: "Di tích văn hóa mới 1", createdBy: "Nguyễn Văn A", createdAt: "2 giờ trước" },
    { id: "2", title: "Di tích văn hóa mới 2", createdBy: "Trần Thị B", createdAt: "5 giờ trước" },
    { id: "3", title: "Di tích văn hóa mới 3", createdBy: "Lê Văn C", createdAt: "1 ngày trước" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);

  // Stat card giả định (có thể lấy từ API sau)
  const stats = [
    { label: "Chờ phê duyệt", value: 15, icon: <Calendar className="h-8 w-8 text-yellow-500" /> },
    { label: "Đã phê duyệt", value: 128, icon: <CheckCircle className="h-8 w-8 text-green-500" /> },
    { label: "Từ chối", value: 7, icon: <XCircle className="h-8 w-8 text-red-500" /> },
  ];

  const handleApprove = (item: ApprovalItem) => {
    alert(`Đã phê duyệt: ${item.title}`);
    setPendingItems((prev) => prev.filter((x) => x.id !== item.id));
    setShowModal(false);
  };

  const handleReject = (item: ApprovalItem) => {
    alert(`Đã từ chối: ${item.title}`);
    setPendingItems((prev) => prev.filter((x) => x.id !== item.id));
    setShowModal(false);
  };

  return (
    <div>
      {/* Tiêu đề */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý phê duyệt</h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white border rounded-lg p-6 shadow-sm flex items-center">
            <div className="flex-shrink-0">{s.icon}</div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{s.label}</h3>
              <p className="text-2xl font-bold text-gray-700">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách phê duyệt */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách chờ phê duyệt</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingItems.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">
                    Được tạo bởi {item.createdBy} • {item.createdAt}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(item);
                  setShowModal(true);
                }}
                className="flex items-center bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                <Eye size={16} className="mr-1" /> Xem
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal chi tiết */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4">Chi tiết yêu cầu</h3>
            <div className="space-y-2">
              <p><b>Tên yêu cầu:</b> {selectedItem.title}</p>
              <p><b>Người tạo:</b> {selectedItem.createdBy}</p>
              <p><b>Thời gian:</b> {selectedItem.createdAt}</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => handleApprove(selectedItem)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Phê duyệt
              </button>
              <button
                onClick={() => handleReject(selectedItem)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalManagement;
