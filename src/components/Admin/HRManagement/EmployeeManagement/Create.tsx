// components/EmployeeManagement/Create.tsx
import { X } from "lucide-react";

interface UserPayload {
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
}

interface CreateProps {
  onClose: () => void;
  onSave: (payload: UserPayload) => void;
}

export default function Create({ onClose, onSave }: CreateProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as UserPayload["role"],
      status: formData.get("status") as UserPayload["status"],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4">Thêm người dùng</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Tên</label>
            <input
              name="name"
              required
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Vai trò</label>
              <select
                name="role"
                defaultValue="viewer"
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
                name="status"
                defaultValue="active"
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
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
    </div>
  );
}