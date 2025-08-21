import React, { useState, useMemo } from 'react';
import { Edit, Eye, Plus, Trash2, X, Folder, CheckCircle, XCircle, Layers } from 'lucide-react';
import Pagination from './Pagination';
import SearchFilter from './SearchFilter';

// ---- Types ----
interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  status: 'active' | 'inactive';
}

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
function DataTable<T extends { id: string }>({
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

// ---- Category Management ----
const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Di tích lịch sử',
      description: 'Các di tích có giá trị lịch sử',
      itemCount: 45,
      status: 'active',
    },
    {
      id: '2',
      name: 'Di sản văn hóa phi vật thể',
      description: 'Các giá trị văn hóa truyền thống',
      itemCount: 32,
      status: 'active',
    },
    {
      id: '3',
      name: 'Cảnh quan văn hóa',
      description: 'Các khu vực cảnh quan đặc sắc',
      itemCount: 18,
      status: 'inactive',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const itemsPerPage = 10;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || category.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const columns: TableColumn<Category>[] = [
    { key: 'name', label: 'Tên danh mục' },
    { key: 'description', label: 'Mô tả' },
    { key: 'itemCount', label: 'Số lượng' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (status: string) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
  ];

  // ---- Stats ----
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === 'active').length;
  const inactiveCategories = categories.filter((c) => c.status === 'inactive').length;
  const totalItems = categories.reduce((sum, c) => sum + c.itemCount, 0);

  // Handlers
  const handleAdd = () => {
    setSelectedCategory(null);
    setShowForm(true);
  };

  const handleEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setShowForm(true);
  };

  const handleView = (cat: Category) => {
    setSelectedCategory(cat);
    setShowView(true);
  };

  const handleDelete = (cat: Category) => {
    setSelectedCategory(cat);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
    }
    setShowConfirmDelete(false);
  };

  const saveCategory = (cat: Category) => {
    if (selectedCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedCategory.id ? cat : c))
      );
    } else {
      setCategories((prev) => [...prev, { ...cat, id: Date.now().toString() }]);
    }
    setShowForm(false);
  };

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Hoạt động', value: 'active' },
    { label: 'Không hoạt động', value: 'inactive' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Thêm danh mục
        </button>
      </div>

      {/* ---- Stats Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded-lg flex items-center gap-3">
          <Folder className="text-blue-600" size={28} />
          <div>
            <p className="text-sm text-gray-500">Tổng số danh mục</p>
            <p className="text-xl font-bold">{totalCategories}</p>
          </div>
        </div>
        <div className="p-4 bg-white shadow rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600" size={28} />
          <div>
            <p className="text-sm text-gray-500">Danh mục hoạt động</p>
            <p className="text-xl font-bold">{activeCategories}</p>
          </div>
        </div>
        <div className="p-4 bg-white shadow rounded-lg flex items-center gap-3">
          <XCircle className="text-red-600" size={28} />
          <div>
            <p className="text-sm text-gray-500">Danh mục không hoạt động</p>
            <p className="text-xl font-bold">{inactiveCategories}</p>
          </div>
        </div>
        <div className="p-4 bg-white shadow rounded-lg flex items-center gap-3">
          <Layers className="text-purple-600" size={28} />
          <div>
            <p className="text-sm text-gray-500">Tổng số item</p>
            <p className="text-xl font-bold">{totalItems}</p>
          </div>
        </div>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          { label: 'Trạng thái', value: 'status', options: statusOptions },
        ]}
        onFilterChange={(key, value) => {
          if (key === 'status') setStatusFilter(value);
        }}
      />

      <DataTable
        data={paginatedCategories}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredCategories.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredCategories.length}
      />

      {/* ---- Modal: View ---- */}
      {showView && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setShowView(false)}
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-2">{selectedCategory.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {selectedCategory.description}
            </p>
            <p>
              <strong>Số lượng:</strong> {selectedCategory.itemCount}
            </p>
            <p>
              <strong>Trạng thái:</strong>{' '}
              {selectedCategory.status === 'active'
                ? 'Hoạt động'
                : 'Không hoạt động'}
            </p>
          </div>
        </div>
      )}

      {/* ---- Modal: Add/Edit Form ---- */}
      {showForm && (
        <CategoryForm
          category={selectedCategory}
          onSave={saveCategory}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* ---- Modal: Confirm Delete ---- */}
      {showConfirmDelete && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <p>
              Bạn có chắc chắn muốn xóa{' '}
              <strong>{selectedCategory.name}</strong>?
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

// ---- Category Form Component ----
const CategoryForm: React.FC<{
  category: Category | null;
  onSave: (cat: Category) => void;
  onClose: () => void;
}> = ({ category, onSave, onClose }) => {
  const [form, setForm] = useState<Category>(
    category || {
      id: '',
      name: '',
      description: '',
      itemCount: 0,
      status: 'active',
    }
  );

  const handleChange = (field: keyof Category, value: any) => {
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
        <h3 className="text-lg font-bold">
          {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        </h3>
        <div>
          <label className="block text-sm font-medium">Tên</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Số lượng</label>
          <input
            type="number"
            value={form.itemCount}
            onChange={(e) => handleChange('itemCount', Number(e.target.value))}
            className="mt-1 w-full border rounded-md px-3 py-2"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Trạng thái</label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value as any)}
            className="mt-1 w-full border rounded-md px-3 py-2"
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
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

export default CategoryManagement;
