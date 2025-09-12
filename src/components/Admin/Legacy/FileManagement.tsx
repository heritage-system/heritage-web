import React, { useState, useMemo } from 'react';
import { Eye, Edit, Trash2, Plus, X, FileText, Image, Video } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number; // KB
  status: 'active' | 'inactive';
}

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
}: {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
}) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {c.label}
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
              {columns.map((c) => (
                <td key={String(c.key)} className="px-6 py-4 text-sm text-gray-900">
                  {c.render ? c.render(item[c.key], item) : String(item[c.key])}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {onView && (
                    <button onClick={() => onView(item)} className="text-blue-600 hover:text-blue-900">
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900">
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900">
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

const FileManagement: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'Hồ sơ di sản.pdf', type: 'PDF', size: 1200, status: 'active' },
    { id: '2', name: 'Ảnh di tích.jpg', type: 'Image', size: 500, status: 'inactive' },
    { id: '3', name: 'Video lễ hội.mp4', type: 'Video', size: 2048, status: 'active' },
  ]);

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // 👉 Thống kê số lượng
  const stats = useMemo(() => {
    return {
      total: files.length,
      images: files.filter(f => f.type === 'Image').length,
      videos: files.filter(f => f.type === 'Video').length,
      documents: files.filter(f => f.type === 'PDF' || f.type === 'Doc').length,
    };
  }, [files]);

  const columns: TableColumn<FileItem>[] = [
    { key: 'name', label: 'Tên file' },
    { key: 'type', label: 'Loại' },
    { key: 'size', label: 'Dung lượng (KB)' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedFile(null);
    setShowForm(true);
  };
  const handleEdit = (file: FileItem) => {
    setSelectedFile(file);
    setShowForm(true);
  };
  const handleView = (file: FileItem) => {
    setSelectedFile(file);
    setShowView(true);
  };
  const handleDelete = (file: FileItem) => {
    setSelectedFile(file);
    setShowConfirmDelete(true);
  };
  const confirmDelete = () => {
    if (selectedFile) {
      setFiles((prev) => prev.filter((f) => f.id !== selectedFile.id));
    }
    setShowConfirmDelete(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý File</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Thêm file
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <FileText className="mx-auto text-blue-500" size={32} />
          <p className="text-lg font-semibold">Tổng số file</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <Image className="mx-auto text-green-500" size={32} />
          <p className="text-lg font-semibold">Hình ảnh</p>
          <p className="text-2xl font-bold">{stats.images}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <Video className="mx-auto text-purple-500" size={32} />
          <p className="text-lg font-semibold">Video</p>
          <p className="text-2xl font-bold">{stats.videos}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <FileText className="mx-auto text-orange-500" size={32} />
          <p className="text-lg font-semibold">Tài liệu</p>
          <p className="text-2xl font-bold">{stats.documents}</p>
        </div>
      </div>

      {/* Bảng file */}
      <DataTable data={files} columns={columns} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />

      {/* View Modal */}
      {showView && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button onClick={() => setShowView(false)} className="absolute top-3 right-3 text-gray-500 hover:text-black">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-2">{selectedFile.name}</h3>
            <p><strong>Loại:</strong> {selectedFile.type}</p>
            <p><strong>Dung lượng:</strong> {selectedFile.size} KB</p>
            <p><strong>Trạng thái:</strong> {selectedFile.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <FileForm
          file={selectedFile}
          onClose={() => setShowForm(false)}
          onSave={(f) => {
            if (selectedFile) {
              setFiles((prev) => prev.map((x) => (x.id === selectedFile.id ? f : x)));
            } else {
              setFiles((prev) => [...prev, { ...f, id: Date.now().toString() }]);
            }
            setShowForm(false);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <p>Bạn có chắc chắn muốn xóa <strong>{selectedFile.name}</strong>?</p>
            <div className="mt-4 flex justify-center gap-4">
              <button onClick={() => setShowConfirmDelete(false)} className="px-4 py-2 bg-gray-200 rounded-md">
                Hủy
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FileForm: React.FC<{ file: FileItem | null; onSave: (f: FileItem) => void; onClose: () => void }> = ({
  file,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<FileItem>(
    file || { id: '', name: '', type: 'PDF', size: 0, status: 'active' }
  );

  const handleChange = (field: keyof FileItem, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
        className="bg-white rounded-lg p-6 w-96 space-y-4 relative"
      >
        <button onClick={onClose} type="button" className="absolute top-3 right-3 text-gray-500 hover:text-black">
          <X size={18} />
        </button>
        <h3 className="text-lg font-bold">{file ? 'Chỉnh sửa file' : 'Thêm file'}</h3>
        <div>
          <label className="block text-sm font-medium">Tên file</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Loại</label>
          <select value={form.type} onChange={(e) => handleChange('type', e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2">
            <option value="PDF">PDF</option>
            <option value="Image">Image</option>
            <option value="Doc">Doc</option>
            <option value="Video">Video</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Dung lượng (KB)</label>
          <input
            type="number"
            value={form.size}
            onChange={(e) => handleChange('size', Number(e.target.value))}
            className="mt-1 w-full border rounded-md px-3 py-2"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Trạng thái</label>
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value as any)} className="mt-1 w-full border rounded-md px-3 py-2">
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Lưu</button>
        </div>
      </form>
    </div>
  );
};

export default FileManagement;
