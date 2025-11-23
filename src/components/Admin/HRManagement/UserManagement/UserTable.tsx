// components/UserManagement/UserTable.tsx
import DataTable from "./DataTable";
import { Mail } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  lastLogin: string;
}

interface UserTableProps {
  data: User[];
  sortKey: keyof User | null;
  sortDir: "asc" | "desc";
  onSortChange: (key: keyof User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
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

export default function UserTable({
  data,
  sortKey,
  sortDir,
  onSortChange,
  onEdit,
  onDelete,
  onView,
}: UserTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={onSortChange}
    />
  );
}