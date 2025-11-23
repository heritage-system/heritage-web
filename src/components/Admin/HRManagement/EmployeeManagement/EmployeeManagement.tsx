// components/EmployeeManagement/EmployeeManagement.tsx
import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import StatsCards from "./StatsCards";
import SearchFilter from "./SearchFilter";
import DataTable from "./DataTable";
import Create from "./Create";
import Update from "./Update";
import ViewDetail from "./ViewDetail";
import Pagination from "../../../Layouts/Pagination";
import { Mail } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  lastLogin: string;
}

const columns = [
  { key: "name" as const, label: "Tên người dùng", sortable: true },
  {
    key: "email" as const,
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
    key: "role" as const,
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
        {role === "admin" ? "Quản trị" : role === "editor" ? "Biên tập" : "Xem"}
      </span>
    ),
  },
  {
    key: "status" as const,
    label: "Trạng thái",
    sortable: true,
    render: (status: User["status"]) => (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {status === "active" ? "Hoạt động" : "Không hoạt động"}
      </span>
    ),
  },
  { key: "lastLogin" as const, label: "Đăng nhập cuối", sortable: true },
];

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

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [sortKey, setSortKey] = useState<keyof User | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const itemsPerPage = 10;

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const inactive = users.filter((u) => u.status === "inactive").length;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newThisMonth = users.filter((u) => new Date(u.lastLogin) >= monthAgo).length;
    return { total, active, inactive, newThisMonth };
  }, [users]);

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
        const aStr = String(av).toLowerCase();
        const bStr = String(bv).toLowerCase();
        const cmp = aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [users, searchTerm, selectedRole, sortKey, sortDir]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleSortChange = (key: keyof User) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleCreate = (payload: any) => {
    setUsers((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        ...payload,
        lastLogin: new Date().toISOString().slice(0, 10),
      },
    ]);
    setShowCreate(false);
  };

  const handleUpdate = (payload: Partial<User>) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...payload } : u))
      );
      setEditingUser(null);
    }
  };

  const handleDelete = () => {
    if (deletingUser) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Thêm người dùng
        </button>
      </div>

      <StatsCards stats={stats} />

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        selectedRole={selectedRole}
        onRoleChange={(v) => {
          setSelectedRole(v);
          setCurrentPage(1);
        }}
      />

      <DataTable
        data={paginatedUsers}
        columns={columns}
        onEdit={(u) => setEditingUser(u)}
        onDelete={(u) => setDeletingUser(u)}
        onView={(u) => setViewingUser(u)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredUsers.length}
      />

      {showCreate && (
        <Create onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}

      {editingUser && (
        <Update
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdate}
        />
      )}

      {viewingUser && (
        <ViewDetail user={viewingUser} onClose={() => setViewingUser(null)} />
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Xóa người dùng</h3>
            <p className="text-sm text-gray-600">
              Bạn có chắc muốn xóa "{deletingUser.name}"? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
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

export default EmployeeManagement;