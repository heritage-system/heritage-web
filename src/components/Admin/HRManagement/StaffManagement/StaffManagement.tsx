// components/StaffManagement/StaffManagement.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Plus, Users, UserCheck, Ban, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import SearchFilter from "./SearchFilter";
import StaffTable from "./StaffTable";
import CreateStaff from "./CreateStaff";
import ViewStaff from "./ViewStaff";
import UpdateStaff from "./UpdateStaff";
import Pagination from "../../../Layouts/Pagination";

import {
  searchStaffForAdmin,
  getStaffDetailForAdmin,
  updateStaffForAdmin,
} from "../../../../services/staffService";
import { createUserByAdmin } from "../../../../services/userService";

import {
  StaffSearchResponse,
  StaffDetailResponse,
  StaffUpdateRequest,
} from "../../../../types/staff";
import { UserCreationByAdminRequest } from "../../../../types/user";
import { StaffRole, StaffStatus, SortBy } from "../../../../types/enum";

// Config
const statusConfig: Record<StaffStatus, { label: string; color: string; icon: any }> = {
  [StaffStatus.ACTIVE]: { label: "Hoạt động", color: "bg-green-100 text-green-800", icon: UserCheck },
  [StaffStatus.INACTIVE]: { label: "Tạm ngưng", color: "bg-gray-100 text-gray-800", icon: Ban },
  [StaffStatus.SUSPENDED]: { label: "Bị đình chỉ", color: "bg-red-100 text-red-800", icon: Ban },
  [StaffStatus.RETIRED]: { label: "Đã nghỉ việc", color: "bg-gray-500 text-white", icon: Ban },
  [StaffStatus.PENDING]: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: Ban },
};

const roleConfig: Record<StaffRole, { label: string; color: string }> = {
  [StaffRole.CONTENT_REVIEWER]: { label: "Duyệt nội dung", color: "bg-blue-100 text-blue-800" },
  [StaffRole.EVENT_MANAGER]: { label: "Quản lý sự kiện", color: "bg-purple-100 text-purple-800" },
  [StaffRole.SUPPORT_STAFF]: { label: "Hỗ trợ", color: "bg-indigo-100 text-indigo-800" },
  [StaffRole.COORDINATOR]: { label: "Điều phối viên", color: "bg-teal-100 text-teal-800" },
  [StaffRole.MODERATOR]: { label: "Kiểm duyệt", color: "bg-orange-100 text-orange-800" },
  [StaffRole.ADMIN_ASSISTANT]: { label: "Trợ lý Admin", color: "bg-red-100 text-red-800" },
};

const tabs = [
  { key: "all" as const, label: "Tất cả", icon: Users },
  { key: StaffStatus.ACTIVE, label: "Hoạt động", icon: UserCheck },
  { key: StaffStatus.INACTIVE, label: "Tạm ngưng", icon: Ban },
  { key: StaffStatus.SUSPENDED, label: "Bị đình chỉ", icon: Ban },
  { key: StaffStatus.RETIRED, label: "Đã nghỉ việc", icon: Ban },
] as const;

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function StaffManagement() {
  const [activeTab, setActiveTab] = useState<"all" | StaffStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("DATEDESC" as SortBy);

  const [staffs, setStaffs] = useState<StaffSearchResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tabCounts, setTabCounts] = useState({
    all: 0,
    [StaffStatus.ACTIVE]: 0,
    [StaffStatus.INACTIVE]: 0,
    [StaffStatus.SUSPENDED]: 0,
    [StaffStatus.RETIRED]: 0,
  });

  // Modal states - tách riêng hoàn toàn
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingStaffId, setViewingStaffId] = useState<number | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [viewingStaffData, setViewingStaffData] = useState<StaffDetailResponse | null>(null);
  const [editingStaffData, setEditingStaffData] = useState<StaffDetailResponse | null>(null);

  // Fetch tab counts
  const fetchTabCounts = useCallback(async () => {
    try {
      const res = await searchStaffForAdmin({ page: 1, pageSize: 9999, sortBy: "DATEDESC" as SortBy });
      if (res.result?.items) {
        const items = res.result.items;
        setTabCounts({
          all: items.length,
          [StaffStatus.ACTIVE]: items.filter(s => s.staffStatus === StaffStatus.ACTIVE).length,
          [StaffStatus.INACTIVE]: items.filter(s => s.staffStatus === StaffStatus.INACTIVE).length,
          [StaffStatus.SUSPENDED]: items.filter(s => s.staffStatus === StaffStatus.SUSPENDED).length,
          [StaffStatus.RETIRED]: items.filter(s => s.staffStatus === StaffStatus.RETIRED).length,
        });
      }
    } catch (err) {
      console.error("Lỗi tải số lượng tab:", err);
    }
  }, []);

  // Fetch staff list
  const fetchStaffs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        keyword: debouncedSearchTerm.trim() || undefined,
        status: activeTab === "all" ? undefined : activeTab,
        sortBy,
        page: currentPage,
        pageSize: itemsPerPage,
      };

      const res = await searchStaffForAdmin(params);
      if (res.result) {
        setStaffs(res.result.items || []);
        setTotalItems(res.result.totalElements);
        setTotalPages(res.result.totalPages || 1);
      } else {
        setStaffs([]);
        setTotalItems(0);
        toast.error(res.message || "Không tải được danh sách nhân viên");
      }
    } catch (err: any) {
      setError("Không thể kết nối đến server");
      setStaffs([]);
      toast.error(err?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearchTerm, currentPage, itemsPerPage, sortBy]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchTerm]);

  useEffect(() => {
    fetchTabCounts();
  }, [fetchTabCounts]);

  // Handlers - tối ưu với useCallback
  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
    setViewingStaffId(null);
    setEditingStaffId(null);
  }, []);

  const closeCreateModal = useCallback(() => setShowCreateModal(false), []);

 const openViewModal = useCallback(async (staff: StaffSearchResponse) => {
  setViewingStaffId(staff.id);
  setViewingStaffData(null); // reset trước khi load

  try {
    const res = await getStaffDetailForAdmin(staff.id);
    if (res.result) {
      setViewingStaffData(res.result);
    } else {
      toast.error("Không tìm thấy thông tin nhân viên");
      closeViewModal();
    }
  } catch (err) {
    toast.error("Không tải được thông tin nhân viên");
    closeViewModal();
  }
}, []);

  const closeViewModal = useCallback(() => {
    setViewingStaffId(null);
    setViewingStaffData(null);
  }, []);

  const openEditModal = useCallback(async (staff: StaffSearchResponse) => {
  setEditingStaffId(staff.id);
  setEditingStaffData(null); // reset

  try {
    const res = await getStaffDetailForAdmin(staff.id);
    if (res.result) {
      setEditingStaffData(res.result);
    } else {
      toast.error("Không tải được thông tin");
      closeEditModal();
    }
  } catch {
    toast.error("Lỗi tải dữ liệu");
    closeEditModal();
  }
}, []);

  const closeEditModal = useCallback(() => {
    setEditingStaffId(null);
    setEditingStaffData(null);
  }, []);

  const handleCreate = async (data: UserCreationByAdminRequest) => {
    try {
      const payload = { ...data, roleName: "STAFF" };
      const res = await createUserByAdmin(payload);
      if (res.code === 201 || res.result) {
        toast.success("Tạo nhân viên thành công!");
        closeCreateModal();
        await Promise.all([fetchStaffs(), fetchTabCounts()]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Tạo nhân viên thất bại");
    }
  };

  const handleUpdate = async (staffId: number, data: StaffUpdateRequest) => {
    try {
      const res = await updateStaffForAdmin(staffId, data);
      if (res.result === true) {
        toast.success("Cập nhật thành công!");
        closeEditModal();
        await Promise.all([fetchStaffs(), fetchTabCounts()]);
      }
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Nhân Viên</h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openCreateModal();
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-md transition"
        >
          <Plus size={20} />
          Thêm nhân viên
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = tab.key === "all" ? tabCounts.all : tabCounts[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab.key);
              }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
              <span>
                {tab.label} <span className="text-gray-500">({count})</span>
              </span>
            </button>
          );
        })}
      </div>

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : staffs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <Users size={80} className="mx-auto text-gray-400 mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Chưa có nhân viên nào</h3>
          <p className="text-gray-600 mb-8">Hãy thêm nhân viên đầu tiên!</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openCreateModal();
            }}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 shadow-lg transition"
          >
            Thêm nhân viên đầu tiên
          </button>
        </div>
      ) : (
        <>
          <StaffTable
            data={staffs}
            statusConfig={statusConfig}
            roleConfig={roleConfig}
            onView={openViewModal}
            onEdit={openEditModal}
          />

          <div className="flex justify-between items-center text-sm text-gray-600 mt-6 bg-white rounded-xl shadow-sm border p-4">
            <div>Hiển thị {startItem} - {endItem} của {totalItems} nhân viên</div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </>
      )}

      <CreateStaff
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        onSave={handleCreate}
      />

        <ViewStaff
        isOpen={!!viewingStaffId}  
        staff={viewingStaffData}  
        onClose={closeViewModal}
      />

      <UpdateStaff
        isOpen={!!editingStaffId}
        staff={editingStaffData}
        onClose={closeEditModal}
        onSave={(data) => handleUpdate(editingStaffId!, data)}
      />
    </div>
  );
}