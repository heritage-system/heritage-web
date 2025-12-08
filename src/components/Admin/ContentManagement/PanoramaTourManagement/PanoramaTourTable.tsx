import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { PanoramaTourSearchForAdminResponse } from "../../../../types/panoramaTour";

interface Props {
  panoramaTours: PanoramaTourSearchForAdminResponse[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const PanoramaTourTable: React.FC<Props> = ({ panoramaTours, onView, onEdit, onDelete }) => {
  if (panoramaTours.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs text-gray-500 uppercase">ID</th>       
            <th className="px-4 py-3 text-xs text-gray-500 uppercase">Tên tour</th>
            <th className="px-4 py-3 text-xs text-gray-500 uppercase">Di sản</th>
            <th className="px-4 py-3 text-xs text-gray-500 uppercase">Số cảnh</th>
            <th className="px-4 py-3 text-xs text-gray-500 uppercase">Premium</th>
            <th className="px-4 py-3 text-xs text-gray-500 uppercase">Trạng thái</th>
            <th className="px-4 py-3 text-xs text-gray-500 uppercase">Ngày tạo</th>
            <th className="px-4 py-3 text-xs text-gray-500 uppercase">Cập nhật</th>
            <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Hành động</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {panoramaTours.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              {/* ID */}
              <td className="px-4 py-3 text-sm">{t.id}</td>             

              {/* Name */}
              <td className="px-4 py-3 text-sm font-medium text-gray-800">{t.name}</td>

              {/* Heritage */}
              <td className="px-4 py-3 text-sm text-gray-700 text-center">
                {t.heritageName || "—"}
              </td>

              {/* Number of Scenes */}
              <td className="px-4 py-3 text-sm text-center">{t.numberOfScenes}</td>

              {/* Premium Type */}
              <td className="px-4 py-3 text-sm text-center">
                {t.premiumType === 1 ? (
                  <span className="text-yellow-600 font-medium">Premium</span>
                ) : (
                  <span className="text-gray-700">Free</span>
                )}
              </td>

              {/* Status */}
              <td className="px-4 py-3 text-sm text-center">
                {t.status === 0 ? (
                  <span className="text-green-600 font-medium">Hoạt động</span>
                ) : (
                  <span className="text-red-600 font-medium">Ẩn</span>
                )}
              </td>

              {/* Created At */}
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(t.createdAt).toLocaleDateString()}
              </td>

              {/* Updated At */}
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(t.updatedAt).toLocaleDateString()}
              </td>

              {/* Action */}
              <td className="px-4 py-3 text-right flex gap-2 justify-end">
                <button 
                onClick={() => onView(t.id)} 
                className="text-blue-600 hover:text-blue-900 p-1">
                  <Eye size={16} />
                </button>

                <button 
                onClick={() => onEdit(t.id)} 
                className="text-indigo-600 hover:text-indigo-900 p-1">
                  <Edit size={16} />
                </button>

                <button onClick={() => onDelete(t.id)} className="text-red-600 hover:text-red-900 p-1">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default PanoramaTourTable;