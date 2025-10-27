import React, { useMemo, useState } from "react";
import {
  Edit,
  Eye,
  Plus,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Info,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Users as UsersIcon,
} from "lucide-react";
import Pagination from "../../Layouts/Pagination";

/* ===================== Types ===================== */
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  lastLogin: string; // yyyy-MM-dd
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
  sortKey?: keyof T | null;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: keyof T) => void;
}

/* ===================== Generic DataTable ===================== */
function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  loading = false,
  sortKey = null,
  sortDir = "asc",
  onSortChange,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 mb-2 rounded" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center gap-3 p-6 rounded-lg border bg-gray-50">
        <Info size={18} className="text-gray-500" />
        <p className="text-gray-600 text-sm">Không có dữ liệu để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => {
              const isSorted = sortKey === column.key;
              return (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    column.sortable ? "text-gray-700" : "text-gray-500"
                  }`}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      className="flex items-center gap-1 select-none"
                    >
                      {column.label}
                      {isSorted ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
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
                      className="p-1.5 rounded hover:bg-gray-100 text-blue-600"
                      title="Xem"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded hover:bg-gray-100 text-indigo-600"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="p-1.5 rounded hover:bg-gray-100 text-red-600"
                      title="Xóa"
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

/* ===================== User Management ===================== */
const EmployeeManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "admin@heritage.vn",
      role: "admin",
      status: "active",
      lastLogin: "2024-12-20",
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "editor@heritage.vn",
      role: "editor",
      status: "active",
      lastLogin: "2024-12-19",
    },
    {
      id: "3",
      name: "Lê Văn C",
      email: "viewer@heritage.vn",
      role: "viewer",
      status: "inactive",
      lastLogin: "2024-12-15",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [sortKey, setSortKey] = useState<keyof User | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading] = useState(false);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState<null | User>(null);
  const [viewUser, setViewUser] = useState<null | User>(null);

  const itemsPerPage = 10;

  /* ===== Stats cards ===== */
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const inactive = users.filter((u) => u.status === "inactive").length;
    const now = new Date();
    const monthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const newThisMonth = users.filter(
      (u) => new Date(u.lastLogin) >= monthAgo
    ).length;
    return { total, active, inactive, newThisMonth };
  }, [users]);

  /* ===== Filters + sort ===== */
  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedRole || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });

    if (sortKey) {
      result = [...result].sort((a: any, b: any) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;

        // string/date compare fallback
        const aStr = String(av).toLowerCase();
        const bStr = String(bv).toLowerCase();
        const cmp = aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [users, searchTerm, selectedRole, sortKey, sortDir]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const columns: TableColumn<User>[] = [
    { key: "name", label: "Tên người dùng", sortable: true },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-500" />
          <span>{email}</span>
        </div>
      ),
    },
    {
      key: "role",
      label: "Vai trò",
      sortable: true,
      render: (role: User["role"]) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            role === "admin"
              ? "bg-red-100 text-red-800"
              : role === "editor"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {role === "admin"
            ? "Quản trị"
            : role === "editor"
            ? "Biên tập"
            : "Xem"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      render: (status: User["status"]) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </span>
      ),
    },
    { key: "lastLogin", label: "Đăng nhập cuối", sortable: true },
  ];

  const roleFilters = [
    { label: "Tất cả vai trò", value: "" },
    { label: "Quản trị", value: "admin" },
    { label: "Biên tập", value: "editor" },
    { label: "Xem", value: "viewer" },
  ];

  const handleSortChange = (key: keyof User) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /* ===== CRUD handlers ===== */
  const openCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSaveUser = (payload: Omit<User, "id" | "lastLogin"> & Partial<User>) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: payload.name!,
                email: payload.email!,
                role: payload.role!,
                status: payload.status!,
              }
            : u
        )
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: (prev.length + 1).toString(),
          name: payload.name!,
          email: payload.email!,
          role: (payload.role || "viewer") as User["role"],
          status: (payload.status || "active") as User["status"],
          lastLogin: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDelete = (user: User) => setShowConfirm(user);

  const confirmDelete = () => {
    if (showConfirm) {
      setUsers((prev) => prev.filter((u) => u.id !== showConfirm.id));
      setShowConfirm(null);
    }
  };

  /* ===================== Render ===================== */
  return (
    <div className="space-y-6">
      {/* Header + Create */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Thêm người dùng
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <UsersIcon size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng người dùng</p>
            <p className="text-xl font-semibold">{stats.total}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50 text-green-600">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="text-xl font-semibold">{stats.active}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
            <UserX size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Không hoạt động</p>
            <p className="text-xl font-semibold">{stats.inactive}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Hoạt động trong 30 ngày</p>
            <p className="text-xl font-semibold">{stats.newThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      {/* <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        filters={[{ label: "Lọc theo vai trò", value: "role", options: [
          { label: "Tất cả vai trò", value: "" },
          { label: "Quản trị", value: "admin" },
          { label: "Biên tập", value: "editor" },
          { label: "Xem", value: "viewer" },
        ] }]}
        onFilterChange={(key, value) => {
          if (key === "role") {
            setSelectedRole(value);
            setCurrentPage(1);
          }
        }}
      /> */}

      {/* Table */}
      <DataTable<User>
        data={paginatedUsers}
        columns={columns}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onView={(u) => setViewUser(u)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredUsers.length}
      />

      {/* Create / Edit Modal */}
      {showForm && (
        <FormModal
          initial={editingUser}
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {/* Confirm Delete */}
      {showConfirm && (
        <ConfirmModal
          title="Xóa người dùng"
          message={`Bạn có chắc muốn xóa "${showConfirm.name}"? Hành động này không thể hoàn tác.`}
          onCancel={() => setShowConfirm(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* View Drawer / Modal */}
      {viewUser && (
        <ViewModal user={viewUser} onClose={() => setViewUser(null)} />
      )}
    </div>
  );
};

export default EmployeeManagement;

/* ===================== Reusable Modals ===================== */

function FormModal({
  initial,
  onClose,
  onSave,
}: {
  initial: User | null;
  onClose: () => void;
  onSave: (
    payload: Omit<User, "id" | "lastLogin"> & Partial<User>
  ) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<User["role"]>(initial?.role ?? "viewer");
  const [status, setStatus] = useState<User["status"]>(
    initial?.status ?? "active"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4">
          {initial ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Vai trò</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as User["role"])}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="admin">Quản trị</option>
                <option value="editor">Biên tập</option>
                <option value="viewer">Xem</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Trạng thái</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as User["status"])
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
              type="button"
            >
              Hủy
            </button>
            <button
              onClick={() => onSave({ name, email, role, status })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              type="button"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border rounded-md">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4">Chi tiết người dùng</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Họ tên</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Vai trò</p>
            <p className="font-medium">
              {user.role === "admin"
                ? "Quản trị"
                : user.role === "editor"
                ? "Biên tập"
                : "Xem"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Trạng thái</p>
            <p className="font-medium">
              {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Đăng nhập cuối</p>
            <p className="font-medium">{user.lastLogin}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
