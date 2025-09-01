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
import TagManagement from "../../components/Admin/TagManagement";
import HeritageManagement from "../../components/Admin/HeritageManagement";
import FileManagement from "../../components/Admin/FileManagement";
import ApprovalManagement from "../../components/Admin/ApprovalManagement";

const HeritageAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const tabs = [
    { id: "users", label: "Quản lý người dùng", icon: Users, component: UserManagement },
    { id: "categories", label: "Quản lý danh mục", icon: List, component: CategoryManagement },
    { id: "tags", label: "Quản lý thể loại", icon: List, component: TagManagement },
    { id: "heritage", label: "Quản lý di sản", icon: MapPin, component: HeritageManagement },
    { id: "files", label: "Quản lý tệp tin", icon: FileText, component: FileManagement },
    { id: "approvals", label: "Quản lý phê duyệt", icon: CheckSquare, component: ApprovalManagement },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || UserManagement;

  // Sync dark mode with <html> class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r shadow-md flex flex-col">
        {/* Logo / Brand */}
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

            {/* Notification bell */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                    <User size={16} /> Hồ sơ
                  </button>
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                    <Settings size={16} /> Cài đặt
                  </button>
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-[700px]">
            <ActiveComponent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeritageAdminPanel;
