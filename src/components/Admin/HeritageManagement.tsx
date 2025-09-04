import React, { useState, useMemo } from 'react';
import {
  Edit,
  Eye,
  Plus,
  Trash2,
  Upload,
  Landmark,
  Clock,
  Archive,
  BarChart3,
  X
} from 'lucide-react';
import Pagination from '../Layouts/Pagination';
import SearchFilter from './SearchFilter';

interface Heritage {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'active' | 'pending' | 'archived';
  createdAt: string;
  views: number;
}

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  loading?: boolean;
}

function DataTable<T extends { id: string }>({ 
  data, columns, onEdit, onDelete, onView, loading = false 
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
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(item[column.key], item) : String(item[column.key])}
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

// ---------------- MAIN COMPONENT ----------------
const HeritageManagement: React.FC = () => {
  const [heritages, setHeritages] = useState<Heritage[]>([
    { id: '1', name: 'Hoàng thành Thăng Long', category: 'Di tích lịch sử', location: 'Hà Nội', status: 'active', createdAt: '2024-01-15', views: 1250 },
    { id: '2', name: 'Phố cổ Hội An', category: 'Di tích lịch sử', location: 'Quảng Nam', status: 'active', createdAt: '2024-02-10', views: 980 },
    { id: '3', name: 'Ca Trù', category: 'Di sản phi vật thể', location: 'Toàn quốc', status: 'pending', createdAt: '2024-03-05', views: 750 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedHeritage, setSelectedHeritage] = useState<Heritage | null>(null);

  const openModal = (type: 'add' | 'edit' | 'view', heritage?: Heritage) => {
    setModalType(type);
    setSelectedHeritage(heritage || null);
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedHeritage(null);
  };

  const filteredHeritages = useMemo(() => {
    return heritages.filter(heritage => {
      const matchesSearch = heritage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           heritage.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || heritage.category === selectedCategory;
      const matchesStatus = !selectedStatus || heritage.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [heritages, searchTerm, selectedCategory, selectedStatus]);

  const paginatedHeritages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHeritages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHeritages, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    return {
      total: filteredHeritages.length,
      active: filteredHeritages.filter(h => h.status === 'active').length,
      pending: filteredHeritages.filter(h => h.status === 'pending').length,
      archived: filteredHeritages.filter(h => h.status === 'archived').length,
      views: filteredHeritages.reduce((sum, h) => sum + h.views, 0),
    };
  }, [filteredHeritages]);

  const columns: TableColumn<Heritage>[] = [
    { key: 'name', label: 'Tên di sản' },
    { key: 'category', label: 'Danh mục' },
    { key: 'location', label: 'Địa điểm' },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (status: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status === 'active' ? 'Hoạt động' : 
           status === 'pending' ? 'Chờ duyệt' : 'Lưu trữ'}
        </span>
      )
    },
    { key: 'views', label: 'Lượt xem' },
    { key: 'createdAt', label: 'Ngày tạo' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý di sản</h2>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2">
            <Upload size={16} />
            Import
          </button>
          <button 
            onClick={() => openModal('add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Thêm di sản
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <Landmark className="text-blue-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Tổng di sản</p>
            <p className="text-xl font-semibold">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <Landmark className="text-green-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Hoạt động</p>
            <p className="text-xl font-semibold">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <Clock className="text-yellow-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Chờ duyệt</p>
            <p className="text-xl font-semibold">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <Archive className="text-gray-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Lưu trữ</p>
            <p className="text-xl font-semibold">{stats.archived}</p>
          </div>
        </div>
      </div>

      {/* Extra Stats Card */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 mb-6">
        <BarChart3 className="text-purple-600" size={24} />
        <div>
          <p className="text-sm text-gray-500">Tổng lượt xem</p>
          <p className="text-xl font-semibold">{stats.views.toLocaleString()}</p>
        </div>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          { 
            label: 'Lọc theo danh mục', 
            value: 'category', 
            options: [
              { label: 'Tất cả danh mục', value: '' },
              { label: 'Di tích lịch sử', value: 'Di tích lịch sử' },
              { label: 'Di sản phi vật thể', value: 'Di sản phi vật thể' }
            ]
          },
          { 
            label: 'Lọc theo trạng thái', 
            value: 'status', 
            options: [
              { label: 'Tất cả trạng thái', value: '' },
              { label: 'Hoạt động', value: 'active' },
              { label: 'Chờ duyệt', value: 'pending' },
              { label: 'Lưu trữ', value: 'archived' }
            ]
          }
        ]}
        onFilterChange={(key, value) => {
          if (key === 'category') setSelectedCategory(value);
          if (key === 'status') setSelectedStatus(value);
        }}
      />

      <DataTable
        data={paginatedHeritages}
        columns={columns}
        onEdit={(heritage) => openModal('edit', heritage)}
        onDelete={(heritage) => console.log('Delete heritage:', heritage)}
        onView={(heritage) => openModal('view', heritage)}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredHeritages.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredHeritages.length}
      />

      {/* ---------------- Modal ---------------- */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
            
            {modalType === 'add' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Thêm di sản mới</h3>
                <form className="space-y-4">
                  <input type="text" placeholder="Tên di sản" className="w-full border px-3 py-2 rounded" />
                  <input type="text" placeholder="Danh mục" className="w-full border px-3 py-2 rounded" />
                  <input type="text" placeholder="Địa điểm" className="w-full border px-3 py-2 rounded" />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Lưu</button>
                </form>
              </div>
            )}

            {modalType === 'edit' && selectedHeritage && (
              <div>
                <h3 className="text-xl font-bold mb-4">Chỉnh sửa di sản</h3>
                <form className="space-y-4">
                  <input defaultValue={selectedHeritage.name} className="w-full border px-3 py-2 rounded" />
                  <input defaultValue={selectedHeritage.category} className="w-full border px-3 py-2 rounded" />
                  <input defaultValue={selectedHeritage.location} className="w-full border px-3 py-2 rounded" />
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Cập nhật</button>
                </form>
              </div>
            )}

            {modalType === 'view' && selectedHeritage && (
              <div>
                <h3 className="text-xl font-bold mb-4">{selectedHeritage.name}</h3>
                <p><strong>Danh mục:</strong> {selectedHeritage.category}</p>
                <p><strong>Địa điểm:</strong> {selectedHeritage.location}</p>
                <p><strong>Trạng thái:</strong> {selectedHeritage.status}</p>
                <p><strong>Lượt xem:</strong> {selectedHeritage.views}</p>
                <p><strong>Ngày tạo:</strong> {selectedHeritage.createdAt}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeritageManagement;
