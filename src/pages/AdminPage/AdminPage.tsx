import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckSquare,
  FileText,
  List,
  MapPin,
  Users,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
} from "lucide-react";
import UserManagement from "../../components/Admin/UserManagement";
import CategoryManagement from "../../components/Admin/CategoryManagement";
import HeritageManagement from "../../components/Admin/HeritageManagement";
import FileManagement from "../../components/Admin/FileManagement";
import ApprovalManagement from "../../components/Admin/ApprovalManagement";

interface HeritageAdminPanelProps {
  children?: React.ReactNode;
}

const HeritageAdminPanel: React.FC<HeritageAdminPanelProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Lấy giá trị từ localStorage nếu có, mặc định là "users"
    return localStorage.getItem("activeTab") || "users";
  });
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"; // giữ dark mode
  });

  const tabs = [
    { id: "users", label: "Quản lý người dùng", icon: Users, component: UserManagement },
    { id: "categories", label: "Quản lý danh mục", icon: List, component: CategoryManagement },
    { id: "heritage", label: "Quản lý di sản", icon: MapPin, component: HeritageManagement },
    { id: "files", label: "Quản lý tệp tin", icon: FileText, component: FileManagement },
    { id: "approvals", label: "Quản lý phê duyệt", icon: CheckSquare, component: ApprovalManagement },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || UserManagement;

  // Lưu tab đang chọn vào localStorage khi đổi tab
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // Đồng bộ dark mode với <html> class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r shadow-md flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b dark:border-gray-700 flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold">
            H
          </div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Heritage Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          © 2025 Heritage Admin
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-[1000px]">
            {children ? children : <ActiveComponent />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeritageAdminPanel;
