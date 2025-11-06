import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  Building,
  Archive,
  Tags,
  Globe,
  DollarSign,
  CreditCard,
  PieChart,
  FileSpreadsheet,
  TrendingUp,
  Briefcase,
  Clock,
  BarChart3,
  Calendar,
  Package,
  Server,
  Database,
  Lock,
  HardDrive,
  Wifi,
  Cloud,
  Zap,
  MessageSquare,
  Mail,
  Shield,
  AlertTriangle,
  Truck,
  ShoppingCart,
  Eye,
  Activity,
  UserCog,
  ChevronRight,
  ChevronLeft,
  Gamepad2,
  CalendarCheck,
  CalendarRange,
  PlusCircle,
  Video,
  Ticket,
  Home
} from "lucide-react";
import VTFPLogo from "../../components/Layouts/VTFP_Logo.png";

// Import all management components
import UserManagement from "../../components/Admin/HRManagement/EmployeeManagement";
import CategoryManagement from "../../components/Admin/ContentManagement/CategoryManagement/CategoryManagement";
import TagManagement from "../../components/Admin/ContentManagement/TagManagement/TagManagement";
import HeritageManagement from "../../components/Admin/ContentManagement/HeritageManagement.tsx/HeritageManagement";
import ContributionPostManagement from "../../components/Admin/ContentManagement/ContributionPostManagement/ContributionPostManagement";
import QuizzManagement from "../../components/Admin/ContentManagement/QuizzManagement/QuizzManagement";
import BudgetManagement from "../../components/Admin/FinancialManagement/BudgetManagement";
import ExpenseTracking from "../../components/Admin/FinancialManagement/ExpenseTracking";
import FinancialReports from "../../components/Admin/FinancialManagement/FinancialReports";
import InvoiceManagement from "../../components/Admin/FinancialManagement/InvoiceManagement";
import PaymentProcessing from "../../components/Admin/FinancialManagement/PaymentProcessing";
import AttendanceTracking from "../../components/Admin/HRManagement/AttendanceTracking";
import EmployeeManagement from "../../components/Admin/HRManagement/EmployeeManagement";
import PayrollManagement from "../../components/Admin/HRManagement/PayrollManagement";
import PerformanceReview from "../../components/Admin/HRManagement/PerformanceReview";
import RolePermissionManagement from "../../components/Admin/HRManagement/RolePermissionManagement";
import EventList from "../../components/Admin/EventManagement/EventList";
import LiveRoomManager from "../../components/Admin/EventManagement/LiveRoomManager";
import EventCreate from "../../components/Admin/EventManagement/EventCreate";
import ParticipantManager from "../../components/Admin/EventManagement/ParticipantManager";
import ServerManagement from "../../components/Admin/SystemSecurity/ServerManagement";
import DatabaseAdministration from "../../components/Admin/SystemSecurity/DatabaseAdministration";
import SecurityCenter from "../../components/Admin/SystemSecurity/SecurityCenter";
import BackupRecovery from "../../components/Admin/SystemSecurity/BackupRecovery";
import NetworkMonitoring from "../../components/Admin/SystemSecurity/NetworkMonitoring";
import CloudInfrastructure from "../../components/Admin/SystemSecurity/CloudInfrastructure";
import SystemPerformance from "../../components/Admin/SystemSecurity/SystemPerformance";
//import CustomerDatabase from "../../components/Admin/CustomerManagement/CustomerDatabase";
import SupportTickets from "../../components/Admin/CustomerManagement/SupportTickets";
import CommunicationHub from "../../components/Admin/CustomerManagement/CommunicationHub";
//import FeedbackManagement from "../../components/Admin/CustomerManagement/FeedbackManagement";
//import CustomerAnalytics from "../../components/Admin/CustomerManagement/CustomerAnalytics";
import ExecutiveDashboard from "../../components/Admin/ReportsAnalytics/ExecutiveDashboard";
import AdvancedAnalytics from "../../components/Admin/ReportsAnalytics/AdvancedAnalytics";
import DataVisualization from "../../components/Admin/ReportsAnalytics/DataVisualization";
//import CustomReports from "../../components/Admin/ReportsAnalytics/CustomReports";
// import KPIMonitoring from "../../components/Admin/ReportsAnalytics/KPIMonitoring";
// import InventoryManagement from "../../components/Admin/Logistics/InventoryManagement";
// import ShippingManagement from "../../components/Admin/Logistics/ShippingManagement";
// import OrderProcessing from "../../components/Admin/Logistics/OrderProcessing";
// import WarehouseOperations from "../../components/Admin/Logistics/WarehouseOperations";
// import ComplianceManagement from "../../components/Admin/Compliance/ComplianceManagement";
// import RiskAssessment from "../../components/Admin/Compliance/RiskAssessment";
// import AuditTrail from "../../components/Admin/Compliance/AuditTrail";
// import PolicyManagement from "../../components/Admin/Compliance/PolicyManagement";
import FileManagement from "../../components/Admin/Legacy/FileManagement";
import ApprovalManagement from "../../components/Admin/Legacy/ApprovalManagement";
import ContributorManagement from "../../components/Admin/HRManagement/ContributorManagement/ContributorManagementIndex";
import { useAuth } from '../../hooks/useAuth';

// Mapping from module title to module ID for state handling
const moduleIdByTitle: Record<string, string> = {
  "Quản lý Nội dung": "contentManagement",
  "Quản lý Tài chính": "financialManagement",
  "Quản lý Nhân sự": "hrManagement",
  "Quản lý Sự kiện": "eventManagement",
  "Hệ thống & Bảo mật": "systemSecurity",
  "Quản lý Khách hàng": "customerManagement",
  "Báo cáo & Phân tích": "reportsAnalytics",
  "Quản lý Logistics": "logistics",
  "Tuân thủ & Rủi ro": "compliance",
  "Hệ thống Cũ": "legacy"
};

// Define module structure with their submodules and components
const moduleStructure = {
  contentManagement: {
    id: "contentManagement",
    title: "Quản lý Nội dung",
    icon: Building,
    subModules: [
      { id: "heritage", name: "Quản lý di sản", icon: MapPin, component: HeritageManagement },
      { id: "categories", name: "Quản lý danh mục", icon: List, component: CategoryManagement },
      { id: "tags", name: "Quản lý thể loại", icon: Tags, component: TagManagement },
      { id: "contributions", name: "Quản lí đóng góp", icon: Archive , component: ContributionPostManagement },
      { id: "quizz", name: "Quản lý trò chơi", icon: Gamepad2, component: QuizzManagement }
    ]
  },
  financialManagement: {
    id: "financialManagement",
    title: "Quản lý Tài chính",
    icon: DollarSign,
    subModules: [
      { id: "budget", name: "Quản lý ngân sách", icon: DollarSign, component: BudgetManagement },
      { id: "payment", name: "Xử lý thanh toán", icon: CreditCard, component: PaymentProcessing },
      { id: "financialReports", name: "Báo cáo tài chính", icon: PieChart, component: FinancialReports },
      { id: "invoice", name: "Quản lý hóa đơn", icon: FileSpreadsheet, component: InvoiceManagement },
      { id: "expense", name: "Theo dõi chi phí", icon: TrendingUp, component: ExpenseTracking }
    ]
  },
  hrManagement: {
    id: "hrManagement",
    title: "Quản lý Nhân sự",
    icon: Users,
    subModules: [
      { id: "employees", name: "Quản lý nhân viên", icon: Users, component: EmployeeManagement },
      { id: "contributors", name: "Quản lý cộng tác viên", icon: Users, component: ContributorManagement },
      { id: "attendance", name: "Theo dõi chấm công", icon: Clock, component: AttendanceTracking },
      { id: "payroll", name: "Quản lý bảng lương", icon: CreditCard, component: PayrollManagement },
      { id: "performance", name: "Đánh giá hiệu suất", icon: BarChart3, component: PerformanceReview },
      { id: "rolePermission", name: "Vai trò & Quyền", icon: Shield, component: RolePermissionManagement }
    ]
  },
  eventManagement: {
  id: "eventManagement",
  title: "Quản lý Sự kiện",
  icon: CalendarCheck,
  subModules: [
    { id: "events", name: "Sự kiện & Workshop", icon: CalendarRange, component: EventList },
    { id: "eventCreate", name: "Tạo sự kiện", icon: PlusCircle, component: EventCreate },
    { id: "liveRooms", name: "Phòng livestream", icon: Video, component: LiveRoomManager },
    { id: "participants", name: "Người tham gia", icon: Users, component: ParticipantManager },
  ]
},
  systemSecurity: {
    id: "systemSecurity",
    title: "Hệ thống & Bảo mật",
    icon: Server,
    subModules: [
      { id: "server", name: "Quản lý máy chủ", icon: Server, component: ServerManagement },
      { id: "database", name: "Quản trị cơ sở dữ liệu", icon: Database, component: DatabaseAdministration },
      { id: "security", name: "Trung tâm bảo mật", icon: Lock, component: SecurityCenter },
      { id: "backup", name: "Sao lưu & Khôi phục", icon: HardDrive, component: BackupRecovery },
      { id: "network", name: "Giám sát mạng", icon: Wifi, component: NetworkMonitoring },
      { id: "cloud", name: "Hạ tầng đám mây", icon: Cloud, component: CloudInfrastructure },
      { id: "performance", name: "Hiệu suất hệ thống", icon: Zap, component: SystemPerformance }
    ]
  },
  customerManagement: {
    id: "customerManagement",
    title: "Quản lý Khách hàng",
    icon: UserCog,
    subModules: [
      //{ id: "customers", name: "Cơ sở dữ liệu khách hàng", icon: Users, component: CustomerDatabase },
      { id: "support", name: "Vé hỗ trợ", icon: MessageSquare, component: SupportTickets },
      { id: "communication", name: "Trung tâm liên lạc", icon: Mail, component: CommunicationHub },
      // { id: "feedback", name: "Quản lý phản hồi", icon: MessageSquare, component: FeedbackManagement },
      // { id: "analytics", name: "Phân tích khách hàng", icon: BarChart3, component: CustomerAnalytics }
    ]
  },
  reportsAnalytics: {
    id: "reportsAnalytics",
    title: "Báo cáo & Phân tích",
    icon: PieChart,
    subModules: [
      { id: "executive", name: "Dashboard điều hành", icon: PieChart, component: ExecutiveDashboard },
      { id: "advanced", name: "Phân tích nâng cao", icon: BarChart3, component: AdvancedAnalytics },
      { id: "visualization", name: "Trực quan hóa dữ liệu", icon: TrendingUp, component: DataVisualization },
      // { id: "custom", name: "Báo cáo tùy chỉnh", icon: FileSpreadsheet, component: CustomReports },
      // { id: "kpi", name: "Giám sát KPI", icon: Eye, component: KPIMonitoring }
    ]
  },
  logistics: {
    id: "logistics",
    title: "Quản lý Logistics",
    icon: Truck,
    subModules: [
      // { id: "inventory", name: "Quản lý tồn kho", icon: Package, component: InventoryManagement },
      // { id: "shipping", name: "Quản lý vận chuyển", icon: Truck, component: ShippingManagement },
      // { id: "orders", name: "Xử lý đơn hàng", icon: ShoppingCart, component: OrderProcessing },
      // { id: "warehouse", name: "Hoạt động kho bãi", icon: Building, component: WarehouseOperations }
    ]
  },
  compliance: {
    id: "compliance",
    title: "Tuân thủ & Rủi ro",
    icon: AlertTriangle,
    subModules: [
      // { id: "complianceManagement", name: "Quản lý tuân thủ", icon: Shield, component: ComplianceManagement },
      // { id: "risk", name: "Đánh giá rủi ro", icon: AlertTriangle, component: RiskAssessment },
      // { id: "audit", name: "Kiểm toán", icon: FileText, component: AuditTrail },
      // { id: "policy", name: "Quản lý chính sách", icon: Settings, component: PolicyManagement }
    ]
  },
  legacy: {
    id: "legacy",
    title: "Hệ thống Cũ",
    icon: Archive,
    subModules: [
      { id: "files", name: "Quản lý tệp tin", icon: FileText, component: FileManagement },
      { id: "approvals", name: "Quản lý phê duyệt", icon: CheckSquare, component: ApprovalManagement },
      { id: "contributors", name: "Quản lý người đóng góp", icon: Users, component: ContributorManagement }
    ]
  }
};

interface HeritageAdminPanelProps {
  children?: React.ReactNode;
  initialModule?: string;
  initialSubModule?: string;
  onBackToDashboard?: () => void;
}

const AdminPanelPage: React.FC<HeritageAdminPanelProps> = ({ 
  children,
  initialModule,
  initialSubModule,
  onBackToDashboard 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams(); // To handle subModule from URL if needed
  const [activeModule, setActiveModule] = useState<string>(initialModule || "contentManagement");
  const [activeSubModule, setActiveSubModule] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    authLogout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Handle state from navigation and initialize active module/submodule
  useEffect(() => {
    const { state } = location;
    let moduleId = initialModule;
    let subModuleId = initialSubModule;

    if (state && state.module && state.module.title) {
      moduleId = moduleIdByTitle[state.module.title] || activeModule;
      if (moduleId) {
        setActiveModule(moduleId);
      }

      if (state.subModule && state.subModule.name) {
        const selectedModule = moduleStructure[moduleId as keyof typeof moduleStructure];
        if (selectedModule) {
          const foundSubModule = selectedModule.subModules.find(
            (s) => s.name === state.subModule.name
          );
          if (foundSubModule) {
            subModuleId = foundSubModule.id;
          }
        }
      }
    }

    // If subModule in params (from URL), use it
    if (params.subModule) {
      // Convert URL slug back to subModule id (e.g., 'heritage-management' -> 'heritage')
      const urlSubModule = params.subModule.replace(/-/g, ' ').toLowerCase();
      const selectedModule = moduleStructure[activeModule as keyof typeof moduleStructure];
      if (selectedModule) {
        const foundSubModule = selectedModule.subModules.find(
          (s) => s.name.toLowerCase() === urlSubModule
        );
        if (foundSubModule) {
          subModuleId = foundSubModule.id;
        }
      }
    }

    if (subModuleId) {
      setActiveSubModule(subModuleId);
    } else {
      const module = moduleStructure[activeModule as keyof typeof moduleStructure];
      if (module && module.subModules.length > 0) {
        setActiveSubModule(module.subModules[0].id);
      }
    }
  }, [location, initialModule, initialSubModule, params]);

  // Sync dark mode with html class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const getCurrentModule = () => {
    return moduleStructure[activeModule as keyof typeof moduleStructure];
  };

  const getCurrentSubModule = () => {
    const module = getCurrentModule();
    return module?.subModules.find(s => s.id === activeSubModule);
  };

  const renderSidebar = () => {
    const currentModule = getCurrentModule();
    if (!currentModule) return null;

    return (
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {onBackToDashboard ? (
        <button
          onClick={() => navigate("/admin/adminHomeDashboard")}
          className={`flex items-center rounded-lg text-sm font-medium mb-4 transition
            text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700
            ${sidebarCollapsed ? "justify-center p-2" : "w-full gap-3 px-4 py-2"}
          `}
          title={sidebarCollapsed ? "Về Dashboard" : ""}
        >
          <Home size={18} />
          {!sidebarCollapsed && "Về Dashboard"}
        </button>
        ) : (
         <button
            onClick={() => navigate("/admin/adminHomeDashboard")}
            className={`flex items-center rounded-lg text-sm font-medium mb-4 transition
              text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700
              ${sidebarCollapsed ? "justify-center p-2" : "w-full gap-3 px-4 py-2"}
            `}
            title={sidebarCollapsed ? "Về Dashboard" : ""}
          >
            <Home size={18} />
            {!sidebarCollapsed && "Về Dashboard"}
          </button>
        )}
        
        <div className="mb-4">
          {!sidebarCollapsed && (
            <>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {currentModule.title}
              </h3>
              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
            </>
          )}
        </div>

       {currentModule.subModules.map((subModule) => (
          <button
            key={subModule.id}
            onClick={() => setActiveSubModule(subModule.id)}
            className={`flex items-center rounded-lg text-sm font-medium transition
              ${activeSubModule === subModule.id
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
              ${sidebarCollapsed ? "justify-center p-2" : "w-full gap-3 px-4 py-2"}
            `}
            title={sidebarCollapsed ? subModule.name : ""}
          >
            <subModule.icon size={18} />
            {!sidebarCollapsed && subModule.name}
          </button>
        ))}
      </div>
    );
  };

  const getPageTitle = () => {
    const subModule = getCurrentSubModule();
    return subModule?.name || "Module không tìm thấy";
  };

  const renderContent = () => {
    // If children prop is provided, render it
    if (children) {
      return children;
    }

    // Find the component for current submodule
    const currentSubModule = getCurrentSubModule();
    
    if (currentSubModule?.component) {
      const Component = currentSubModule.component;
      return <Component />;
    }

    // Fallback to default content
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          {currentSubModule?.icon && <currentSubModule.icon className="w-8 h-8 text-blue-600" />}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentSubModule?.name || "Module không tìm thấy"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý và cấu hình {currentSubModule?.name?.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            <strong>Lưu ý:</strong> Component cho "{currentSubModule?.name}" chưa được tích hợp.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r shadow-md flex flex-col transition-all duration-300`}>
       {/* Logo */}
          <div
            className={`flex items-center gap-2 border-b dark:border-gray-700 transition-all duration-300 ${
              sidebarCollapsed ? "p-2 justify-center" : "p-6"
            }`}
          >
            <div className={`relative ${sidebarCollapsed ? "w-10 h-10" : "w-16 h-16"}`}>
              <img
                src={VTFPLogo}
                alt="Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                VTFP Admin
              </h1>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto flex items-center justify-center w-8 h-8 rounded-md border 
                        border-gray-300 dark:border-gray-600 
                        hover:bg-blue-500 hover:text-white transition-colors"
              title={sidebarCollapsed ? "Mở Sidebar" : "Thu gọn Sidebar"}
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${
                  sidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

        {/* Navigation */}
        {renderSidebar()}

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 mt-auto">
            © 2025 Heritage Admin
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-black dark:text-gray-100">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => handleLogout()}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {renderContent()}
          </div>
          {/* Uncomment to show debug info
          <pre className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {JSON.stringify({ activeModule, activeSubModule, locationState: location.state }, null, 2)}
          </pre> */}
        </div>
      </main>
    </div>
  );
};

export default AdminPanelPage;