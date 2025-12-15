import React from "react";
import { Eye, Edit, Ban, Clock } from "lucide-react";
import { StaffSearchResponse } from "../../../../types/staff";
import { StaffRole, StaffStatus } from "../../../../types/enum";

interface StaffTableProps {
  data: StaffSearchResponse[];
  statusConfig: Record<StaffStatus, { label: string; color: string; icon: any }>;
  roleConfig: Record<StaffRole, { label: string; color: string }>;
  onView: (staff: StaffSearchResponse) => void;
  onEdit: (staff: StaffSearchResponse) => void;
}

export default function StaffTable({
  data,
  statusConfig,
  roleConfig,
  onView,
  onEdit,
}: StaffTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Ban size={36} className="text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg font-medium">Không tìm thấy nhân viên nào</p>
        <p className="text-gray-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc thêm nhân viên mới</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-2xl bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider pr-8">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((staff) => {
              const StatusIcon = statusConfig[staff.staffStatus]?.icon || Ban;
              const statusInfo = statusConfig[staff.staffStatus];
              const roleInfo = roleConfig[staff.staffRole];

              return (
                <tr
                  key={staff.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                >
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                    {staff.id}
                  </td>

                  {/* Nhân viên: username */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{staff.userName}</span>
                  </td>

                  {/* Vai trò */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${roleInfo?.color || "bg-gray-100 text-gray-800"}`}
                    >
                      {roleInfo?.label || "Không xác định"}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo?.color || "bg-gray-100 text-gray-800"}`}
                      >
                        <StatusIcon size={14} />
                        {statusInfo?.label || "Không xác định"}
                      </span>
                      {/* {staff.staffStatus === StaffStatus.PENDING && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <Clock size={12} />
                          Chờ duyệt
                        </p>
                      )} */}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                    {staff.email}
                  </td>

                  {/* Ngày tạo */}
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                    {new Date(staff.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>

                  {/* Hành động */}
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(staff);
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-all hover:scale-110"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(staff);
                        }}
                        className="p-2.5 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-all hover:scale-110"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}