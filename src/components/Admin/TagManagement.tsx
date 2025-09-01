import React, { useState, useMemo, useEffect } from "react";
import { Edit, Eye, Plus, Trash2, X } from "lucide-react";
import Pagination from "../Layouts/Pagination";
import { TagSearchResponse  } from "../../types/tag";
import { toast } from 'react-hot-toast';
import { searchTags, createTag, updateTag, deleteTag } from "../../services/tagService";

// ---- Types ----
interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  loading?: boolean;
}

// ---- Generic Table ----
function DataTable<T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  loading = false,
}: TableProps<T>) {
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
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Main Tag Management ----
const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<TagSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [selectedTag, setSelectedTag] = useState<TagSearchResponse | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(10);

// Fetch tags from backend
const loadTags = async () => {
  setLoading(true);
  const res = await searchTags({
    keyword: searchTerm,
    page: currentPage,  
    pageSize: itemsPerPage,
  });

  if (res.code === 200 && res.result) {
    setTags(res.result.items || [] );

    // đồng bộ pagination từ API
    setCurrentPage(res.result.currentPages ?? 1);
    setTotalPages(res.result.totalPages ?? 1);
    // setItemsPerPage(res.result.pageSizes ?? 10);
  }

  setLoading(false);
};



 useEffect(() => { 
  loadTags();
}, [searchTerm, currentPage, itemsPerPage]);


  // Handlers
  const handleAdd = () => {
    setSelectedTag(null);
    setShowForm(true);
  };

  const handleEdit = (tag: TagSearchResponse) => {
    setSelectedTag(tag);
    setShowForm(true);
  };

  const handleView = (tag: TagSearchResponse) => {
    setSelectedTag(tag);
    setShowView(true);
  };

  const handleDelete = (tag: TagSearchResponse) => {
    setSelectedTag(tag);
    setShowConfirmDelete(true);
  };

 const confirmDelete = async () => {
  if (!selectedTag) return;
  
  try {
    await deleteTag({ id: selectedTag.id });
    toast.success('Xóa tag thành công!', {
      duration: 2000,
      position: 'top-right',
      style: { background: '#059669', color: '#fff' },
    });
    await loadTags();
  } catch (error) {
    toast.error('Xóa tag thất bại. Vui lòng thử lại!', {
      duration: 5000,
      position: 'top-right',
      style: { background: '#DC2626', color: '#fff' },
    });
  }

  setShowConfirmDelete(false);
};


  const saveTag = async (tag: TagSearchResponse) => {
  try {
    if (selectedTag) {
      await updateTag({ id: selectedTag.id, name: tag.name });
      toast.success('Cập nhật tag thành công!', {
        duration: 2000,
        position: 'top-right',
        style: { background: '#059669', color: '#fff' },
      });
    } else {
      await createTag({ name: tag.name });
      toast.success('Thêm tag thành công!', {
        duration: 2000,
        position: 'top-right',
        style: { background: '#059669', color: '#fff' },
      });
    }

    await loadTags();
    setShowForm(false);
  } catch (error) {
    toast.error('Thao tác thất bại. Vui lòng thử lại!', {
      duration: 5000,
      position: 'top-right',
      style: { background: '#DC2626', color: '#fff' },
    });
  }
};

const clearSearch = () => {
  setSearchTerm("");
  setCurrentPage(1);
  toast('Tìm kiếm đã được xóa.', {
    duration: 1500,
    position: 'top-right',
    style: { background: '#059669', color: '#fff' },
  });
};
  
   return (
    <div>
        <div className="flex items-center gap-4 mb-4">
  <div className="flex items-center gap-2">
    <label>Trang:</label>
    <input
      type="number"
      min={1}
      max={totalPages}
      value={currentPage}
      onChange={(e) => {
        const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
        setCurrentPage(page);
      }}
      className="border px-2 py-1 rounded-md w-16"
    />
    / {totalPages}
  </div>

  <div className="flex items-center gap-2">
    <label>Số mục / trang:</label>
    <input
      type="number"
      min={1}
      value={itemsPerPage}
      onChange={(e) => {
        const pageSize = Math.max(1, Number(e.target.value));
        setCurrentPage(1); // reset page
        setItemsPerPage(pageSize);
      }}
      className="border px-2 py-1 rounded-md w-16"
    />
  </div>
</div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý Tag</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Thêm tag
        </button>
      </div>

      {/* 🔎 Search with clear button */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm tag..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-md w-64"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center gap-1"
          >
            <X size={14} /> Xóa
          </button>
        )}
      </div>

   {/* Table */}
<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
  <table className="min-w-full divide-y divide-gray-300">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tag</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng di tích</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {loading ? (
        <tr>
          <td colSpan={8} className="p-4 text-center text-gray-500">Đang tải...</td>
        </tr>
      ) : tags.length === 0 ? (
        <tr>
          <td colSpan={8} className="p-4 text-center text-gray-500">Không có dữ liệu</td>
        </tr>
      ) : (
        tags.map((tag) => (
          <tr key={tag.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">{tag.id}</td>
            <td className="px-6 py-4">{tag.name}</td>
            <td className="px-6 py-4">{tag.createdBy}</td>
            <td className="px-6 py-4">{new Date(tag.createdAt).toLocaleString()}</td>
            <td className="px-6 py-4">{new Date(tag.updatedAt).toLocaleString()}</td>
            <td className="px-6 py-4">{tag.count}</td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleView(tag)} className="text-blue-600 hover:text-blue-900"><Eye size={16} /></button>
              <button onClick={() => handleEdit(tag)} className="text-indigo-600 hover:text-indigo-900"><Edit size={16} /></button>
              <button onClick={() => handleDelete(tag)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={0}
      />

      {/* ---- Modal: View ---- */}
      {showView && selectedTag && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setShowView(false)}
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-2">{selectedTag.name}</h3>
            <p>ID: {selectedTag.id}</p>
          </div>
        </div>
      )}

      {/* ---- Modal: Add/Edit Form ---- */}
      {showForm && (
        <TagForm
          tag={selectedTag}
          onSave={saveTag}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* ---- Modal: Confirm Delete ---- */}
      {showConfirmDelete && selectedTag && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <p>
              Bạn có chắc chắn muốn xóa <strong>{selectedTag.name}</strong>?
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ---- Tag Form Component ----
const TagForm: React.FC<{
  tag: TagSearchResponse | null;
  onSave: (tag: TagSearchResponse) => void;
  onClose: () => void;
}> = ({ tag, onSave, onClose }) => {
  const [form, setForm] = useState<TagSearchResponse>(
  tag || {
    id: 0,
    name: "",
    nameUnsigned: "",
    createdBy: "",
    createdAt: "",
    updatedAt: "",
    updatedBy: "",   // ✅ add this
    count: 0,
  }
);


  const handleChange = (field: keyof TagSearchResponse, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-96 space-y-4 relative"
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold">{tag ? "Chỉnh sửa Tag" : "Thêm Tag"}</h3>

        {/* Editable name */}
        <div>
          <label className="block text-sm font-medium">Tên</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Read-only fields if editing */}
        {tag && (
          <>
            <div>
              <label className="block text-sm font-medium">Tên không dấu</label>
              <input
                type="text"
                value={form.nameUnsigned}
                readOnly
                className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Người tạo</label>
              <input
                type="text"
                value={form.createdBy}
                readOnly
                className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">Ngày tạo</label>
                <input
                  type="text"
                  value={new Date(form.createdAt).toLocaleString()}
                  readOnly
                  className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Cập nhật</label>
                <input
                  type="text"
                  value={new Date(form.updatedAt).toLocaleString()}
                  readOnly
                  className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Số di tích liên kết</label>
              <input
                type="number"
                value={form.count}
                readOnly
                className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default TagManagement;
