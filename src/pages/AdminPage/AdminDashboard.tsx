import React, { useState } from 'react';
import {
  Users,
  FileText,
  Tags,
  Settings,
  BarChart3,
  Shield,
  Bell,
  Archive,
  Database,
  Layers,
  Building,
  ChevronRight,
  Activity,
  TrendingUp,
  Clock,
  Eye,
  Server,
  Lock,
  Globe,
  CreditCard,
  Mail,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  Truck,
  ShoppingCart,
  Package,
  DollarSign,
  PieChart,
  Briefcase,
  UserCog,
  AlertTriangle,
  HardDrive,
  Wifi,
  Cloud,
  Zap,
  LucideProps, 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Module, ModuleGroup } from "../../types/adminDashboard";

// 👇 Tự định nghĩa type LucideIcon
type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

const AdminHomeDashboard = () => {
  const [selectedModule, setSelectedModule] = useState<ModuleGroup | null>(null);
  const navigate = useNavigate();

  const moduleGroups = [
  {
    title: "Quản lý Nội dung",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    count: 6,
    description: "Quản lý di sản, danh mục và nội dung số",
    modules: [
      { name: "Quản lý Di sản", icon: "Building" },
      { name: "Chi tiết Di sản", icon: "FileText" },
      { name: "Quản lý Danh mục", icon: "Layers" },
      { name: "Quản lý Thẻ", icon: "Tags" },
      { name: "Xuất bản Nội dung", icon: "Globe" },
      { name: "Quản lý Tài sản số", icon: "Archive" },
    ],
  },
  {
    title: "Quản lý Tài chính",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    count: 5,
    description: "Quản lý ngân sách, thanh toán và tài chính",
    modules: [
      { name: "Quản lý Ngân sách", icon: "DollarSign" },
      { name: "Xử lý Thanh toán", icon: "CreditCard" },
      { name: "Báo cáo Tài chính", icon: "PieChart" },
      { name: "Quản lý Hóa đơn", icon: "FileSpreadsheet" },
      { name: "Theo dõi Chi tiêu", icon: "TrendingUp" },
    ],
  },
  {
    title: "Quản lý Nhân sự",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    count: 6,
    description: "Quản lý nhân viên và tổ chức",
    modules: [
      { name: "Quản lý Nhân viên", icon: "Users" },
      { name: "Quản lý Phòng ban", icon: "Briefcase" },
      { name: "Vai trò & Phân quyền", icon: "Shield" },
      { name: "Theo dõi Chấm công", icon: "Clock" },
      { name: "Đánh giá Hiệu suất", icon: "BarChart3" },
      { name: "Quản lý Lương", icon: "CreditCard" },
    ],
  },
  {
    title: "Quản lý Dự án",
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    count: 4,
    description: "Quản lý dự án và quy trình làm việc",
    modules: [
      { name: "Quản lý Dự án", icon: "Briefcase" },
      { name: "Quản lý Nhiệm vụ", icon: "Calendar" },
      { name: "Hoạch định Nguồn lực", icon: "Package" },
      { name: "Theo dõi Tiến độ", icon: "Activity" },
    ],
  },
  {
    title: "Hệ thống & Bảo mật",
    color: "bg-gradient-to-br from-red-500 to-red-600",
    count: 7,
    description: "Quản lý hạ tầng và bảo mật hệ thống",
    modules: [
      { name: "Quản lý Máy chủ", icon: "Server" },
      { name: "Quản trị CSDL", icon: "Database" },
      { name: "Trung tâm Bảo mật", icon: "Lock" },
      { name: "Sao lưu & Khôi phục", icon: "HardDrive" },
      { name: "Giám sát Mạng", icon: "Wifi" },
      { name: "Hạ tầng Đám mây", icon: "Cloud" },
      { name: "Hiệu suất Hệ thống", icon: "Zap" },
    ],
  },
  {
    title: "Quản lý Khách hàng",
    color: "bg-gradient-to-br from-teal-500 to-teal-600",
    count: 5,
    description: "CRM và quản lý quan hệ khách hàng",
    modules: [
      { name: "Cơ sở dữ liệu Khách hàng", icon: "Users" },
      { name: "Phiếu hỗ trợ", icon: "MessageSquare" },
      { name: "Trung tâm Giao tiếp", icon: "Mail" },
      { name: "Quản lý Phản hồi", icon: "MessageSquare" },
      { name: "Phân tích Khách hàng", icon: "BarChart3" },
    ],
  },
  {
    title: "Báo cáo & Phân tích",
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    count: 5,
    description: "Business Intelligence và báo cáo",
    modules: [
      { name: "Bảng điều khiển Tổng quan", icon: "PieChart" },
      { name: "Phân tích Nâng cao", icon: "BarChart3" },
      { name: "Trực quan hóa Dữ liệu", icon: "TrendingUp" },
      { name: "Báo cáo Tùy chỉnh", icon: "FileSpreadsheet" },
      { name: "Theo dõi KPI", icon: "Eye" },
    ],
  },
  {
    title: "Quản lý Logistics",
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
    count: 4,
    description: "Quản lý vận chuyển và kho bãi",
    modules: [
      { name: "Quản lý Tồn kho", icon: "Package" },
      { name: "Quản lý Vận chuyển", icon: "Truck" },
      { name: "Xử lý Đơn hàng", icon: "ShoppingCart" },
      { name: "Hoạt động Kho bãi", icon: "Building" },
    ],
  },
  {
    title: "Tuân thủ & Rủi ro",
    color: "bg-gradient-to-br from-rose-500 to-rose-600",
    count: 4,
    description: "Quản lý tuân thủ và rủi ro doanh nghiệp",
    modules: [
      { name: "Quản lý Tuân thủ", icon: "Shield" },
      { name: "Đánh giá Rủi ro", icon: "AlertTriangle" },
      { name: "Theo dõi Kiểm toán", icon: "FileText" },
      { name: "Quản lý Chính sách", icon: "Settings" },
    ],
  },
];


const iconMap: Record<string, LucideIcon> = {
    FileText,
    Users,
    Tags,
    Settings,
    BarChart3,
    Shield,
    Archive,
    Database,
    Layers,
    Building,
    Server,
    Lock,
    Globe,
    CreditCard,
    Mail,
    Calendar,
    MessageSquare,
    FileSpreadsheet,
    Truck,
    ShoppingCart,
    Package,
    DollarSign,
    PieChart,
    Briefcase,
    UserCog,
    AlertTriangle,
    HardDrive,
    Wifi,
    Cloud,
    Zap,
    Activity,
    TrendingUp,
    Clock,
    Eye,
};

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || FileText;
  };

  const ModuleManagement: React.FC<{ module: ModuleGroup }> = ({ module }) => {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedModule(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{module.title}</h1>
                <p className="text-sm text-gray-500">Enterprise Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-400" />
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">VTFP</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <span>VTFP Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{module.title}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">1,234</h3>
              <p className="text-sm text-gray-600">Tổng số bản ghi</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">98</h3>
              <p className="text-sm text-gray-600">Hoạt động hôm nay</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">-3%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">156</h3>
              <p className="text-sm text-gray-600">Cần xử lý</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Mới</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">23</h3>
              <p className="text-sm text-gray-600">Cập nhật gần đây</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {module.modules.map((subModule: Module, index: number) => {
              const SubModuleIcon = getIcon(subModule.icon);
              return (
                <div
                  key={index}
                  onClick={() => navigate(`/admin/adminPanelmanagement/${subModule.name.replace(/ /g, '-').toLowerCase()}`, { state: { module, subModule } })}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-blue-200 group cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <SubModuleIcon className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                      {subModule.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Quản lý và cấu hình {subModule.name.toLowerCase()}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Trạng thái:</span>
                      <span className="text-green-600 font-medium">Hoạt động</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (selectedModule) {
    return <ModuleManagement module={selectedModule} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">VTFP</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">VTFP Admin</h1>
              <p className="text-sm text-gray-500">Bản Điều Khiển Quản Trị Doanh Nghiệp</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 cursor-pointer transition-colors">
              <span className="text-blue-600 font-medium text-sm">A</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4">   
          {/* Lego-style Grid Layout */}
          <div className="grid grid-cols-12 gap-3 auto-rows-min">
            
            {/* ROW 1: Quản lý Nội dung (6 cols) + Tài chính (3 cols) + Hệ thống (3 cols) */}
            {/* Quản lý Nội dung - Hero block */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[0] } })}
              className="col-span-6 row-span-2 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[0].color} p-5 h-full text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10 h-full flex flex-col min-h-[220px]">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-10 h-10" />
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">{moduleGroups[0].count}</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2">{moduleGroups[0].title}</h3>
                  <p className="text-white text-opacity-90 text-sm mb-4">{moduleGroups[0].description}</p>
                  <div className="mt-auto">
                    <div className="space-y-2">
                      {moduleGroups[0].modules.slice(0, 4).map((module, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <span className="text-white text-opacity-80">{module.name}</span>
                        </div>
                      ))}
                      <div className="text-xs text-white text-opacity-60 mt-2">+{moduleGroups[0].modules.length - 4} modules khác</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quản lý Tài chính */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[1] } })}
              className="col-span-3 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[1].color} p-4 h-full text-white relative overflow-hidden min-h-[105px]`}>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="w-8 h-8" />
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">{moduleGroups[1].count}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{moduleGroups[1].title}</h3>
                  <p className="text-white text-opacity-90 text-xs">{moduleGroups[1].description}</p>
                </div>
              </div>
            </div>

            {/* Hệ thống & Bảo mật */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[4] } })}
              className="col-span-3 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[4].color} p-4 h-full text-white relative overflow-hidden min-h-[105px]`}>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Server className="w-8 h-8" />
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">{moduleGroups[4].count}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{moduleGroups[4].title}</h3>
                  <p className="text-white text-opacity-90 text-xs">{moduleGroups[4].description}</p>
                </div>
              </div>
            </div>

            {/* ROW 2: Nhân sự (2 cols) + Dự án (2 cols) + Khách hàng (2 cols) */}
            {/* Quản lý Nhân sự */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[2] } })}
              className="col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[2].color} p-4 h-full text-white relative overflow-hidden min-h-[105px]`}>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <UserCog className="w-8 h-8" />
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">{moduleGroups[2].count}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{moduleGroups[2].title}</h3>
                  <p className="text-white text-opacity-90 text-xs">{moduleGroups[2].description}</p>
                </div>
              </div>
            </div>

            {/* Quản lý Dự án */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[3] } })}
              className="col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[3].color} p-4 h-full text-white relative overflow-hidden min-h-[105px]`}>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Briefcase className="w-8 h-8" />
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">{moduleGroups[3].count}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{moduleGroups[3].title}</h3>
                  <p className="text-white text-opacity-90 text-xs">{moduleGroups[3].description}</p>
                </div>
              </div>
            </div>

            {/* Quản lý Khách hàng */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[5] } })}
              className="col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[5].color} p-4 h-full text-white relative overflow-hidden min-h-[105px]`}>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-8 h-8" />
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">{moduleGroups[5].count}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{moduleGroups[5].title}</h3>
                  <p className="text-white text-opacity-90 text-xs">{moduleGroups[5].description}</p>
                </div>
              </div>
            </div>

            {/* ROW 3: Báo cáo (5 cols) + Logistics (4 cols) + Tuân thủ (3 cols) */}
            {/* Báo cáo & Phân tích */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[6] } })}
              className="col-span-5 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[6].color} p-4 h-full text-white relative overflow-hidden min-h-[120px]`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10 h-full flex items-center space-x-4">
                  <PieChart className="w-10 h-10 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{moduleGroups[6].title}</h3>
                      <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">{moduleGroups[6].count}</span>
                    </div>
                    <p className="text-white text-opacity-90 text-sm mb-3">{moduleGroups[6].description}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {moduleGroups[6].modules.slice(0, 4).map((module, idx) => (
                        <div key={idx} className="flex items-center space-x-1 text-xs">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <span className="text-white text-opacity-75 truncate">{module.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quản lý Logistics */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[7] } })}
              className="col-span-4 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-amber-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[7].color} p-4 h-full text-white relative overflow-hidden min-h-[120px]`}>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -ml-8 -mb-8"></div>
                <div className="relative z-10 h-full flex items-center space-x-4">
                  <Truck className="w-10 h-10 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{moduleGroups[7].title}</h3>
                      <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">{moduleGroups[7].count}</span>
                    </div>
                    <p className="text-white text-opacity-90 text-sm mb-3">{moduleGroups[7].description}</p>
                    <div className="space-y-1">
                      {moduleGroups[7].modules.slice(0, 3).map((module, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <span className="text-white text-opacity-75">{module.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tuân thủ & Rủi ro */}
            <div
              onClick={() => navigate('/admin/adminPanelmanagement', { state: { module: moduleGroups[8] } })}
              className="col-span-3 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-rose-200 group cursor-pointer overflow-hidden"
            >
              <div className={`${moduleGroups[8].color} p-4 h-full text-white relative overflow-hidden min-h-[120px]`}>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <AlertTriangle className="w-8 h-8" />
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">{moduleGroups[8].count}</span>
                  </div>
                  <h3 className="font-bold text-base mb-2">{moduleGroups[8].title}</h3>
                  <p className="text-white text-opacity-90 text-xs mb-3">{moduleGroups[8].description}</p>
                  <div className="mt-auto space-y-1">
                    {moduleGroups[8].modules.slice(0, 2).map((module, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <span className="text-white text-opacity-75 truncate">{module.name}</span>
                      </div>
                    ))}
                    <div className="text-xs text-white text-opacity-60">+{moduleGroups[8].modules.length - 2} khác</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
};

export default AdminHomeDashboard;