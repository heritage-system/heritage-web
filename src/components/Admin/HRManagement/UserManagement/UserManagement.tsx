// components/UserManagement/UserManagement.tsx
import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import StatsCards from "./StatsCards";
import SearchFilter from "./SearchFilter";
import UserTable from "./UserTable";
import CreateUser from "./CreateUser";
import UpdateUser from "./UpdateUser";
import ViewUser from "./ViewUser";
import ConfirmDelete from "./ConfirmDelete";
import Pagination from "../../../Layouts/Pagination";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  lastLogin: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Admin VTFP",
      email: "admin@vftp.vn",
      role: "admin",
      status: "active",
      lastLogin: "2025-11-15",
    },
    {
      id: "2",
      name: "Editor Nội dung",
      email: "editor@vftp.vn",
      role: "editor",
      status: "active",
      lastLogin: "2025-11-14",
    },
    {
      id: "3",
      name: "Viewer Guest",
      email: "viewer@vftp.vn",
      role: "viewer",
      status: "inactive",
      lastLogin: "2025-10-20",
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

  const handleCreate = (payload: Omit<User, "id" | "lastLogin">) => {
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
      {/* Header */}
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

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Search & Filter */}
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

      {/* Table */}
      <UserTable
        data={paginatedUsers}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        onEdit={setEditingUser}
        onDelete={setDeletingUser}
        onView={setViewingUser}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredUsers.length}
      />

      {/* Modals */}
      {showCreate && <CreateUser onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {editingUser && <UpdateUser user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdate} />}
      {viewingUser && <ViewUser user={viewingUser} onClose={() => setViewingUser(null)} />}
      {deletingUser && (
        <ConfirmDelete
          user={deletingUser}
          onCancel={() => setDeletingUser(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default UserManagement;