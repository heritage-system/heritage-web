import React, { useEffect, useState, useCallback } from "react";
import { Plus, Users, UserCheck, Ban, Loader2, AlertCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

import UserTable from "./UserTable";
import SearchFilter from "./SearchFilter";
import CreateUser from "./CreateUser";
import ViewUser from "./ViewUser";
import ConfirmStatusChange from "./ConfirmStatusChange";
import Pagination from "../../../Layouts/Pagination";

import {
  searchMembersForAdmin,
  createUserByAdmin,
  changeUserStatusForAdmin,
  getUserDetailForAdmin,
} from "../../../../services/userService";

import {
  UserSearchRequest,
  UserSearchResponse,
  UserDetailResponse,
  UserCreationByAdminRequest,
} from "../../../../types/user";
import { UserStatus, SortBy } from "../../../../types/enum";
import { PageResponse } from "../../../../types/pageResponse";
import { ApiResponse } from "../../../../types/apiResponse";

// Cấu hình trạng thái hiển thị
const statusConfig: Partial<Record<UserStatus, { label: string; color: string; icon: any }>> = {
  [UserStatus.ACTIVE]: { label: "Hoạt động", color: "bg-green-100 text-green-800", icon: UserCheck },
  [UserStatus.INACTIVE]: { label: "Không hoạt động", color: "bg-gray-100 text-gray-800", icon: Ban },
  [UserStatus.BANNED]: { label: "Bị cấm", color: "bg-red-100 text-red-800", icon: Ban },
};

// Tabs chỉ hiển thị 4 trạng thái
const tabs = [
  { key: "all" as const, label: "Tất cả", icon: Users },
  { key: UserStatus.PENDING_APPROVE, label: "Chờ xác nhận", icon: Clock },
  { key: UserStatus.ACTIVE, label: "Hoạt động", icon: UserCheck },
  { key: UserStatus.INACTIVE, label: "Không hoạt động", icon: Ban },
  { key: UserStatus.BANNED, label: "Bị cấm", icon: Ban },
] as const;

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<"all" | UserStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("DATEDESC");
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const [totalItemsFromBackend, setTotalItemsFromBackend] = useState(0);
  const [totalPagesFromBackend, setTotalPagesFromBackend] = useState(1);
  const [users, setUsers] = useState<UserSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tabCounts, setTabCounts] = useState({
    all: 0,
    [UserStatus.PENDING_APPROVE]: 0,
    [UserStatus.ACTIVE]: 0,
    [UserStatus.INACTIVE]: 0,
    [UserStatus.BANNED]: 0,
  });

  const [showCreate, setShowCreate] = useState(false);

  // NEW: Dùng pattern giống StaffManagement - mở modal ngay, data load sau
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [viewingUserData, setViewingUserData] = useState<UserDetailResponse | null>(null);

  const [statusChangeInfo, setStatusChangeInfo] = useState<{
  user: UserSearchResponse;
  newStatus: UserStatus;
} | null>(null);

  const [changingStatusUser, setChangingStatusUser] = useState<{
    user: UserSearchResponse;
    newStatus: UserStatus;
  } | null>(null);

  const fetchTabCounts = useCallback(async () => {
    try {
      const params: UserSearchRequest = {
        page: 1,
        pageSize: 9999,
        sortBy: SortBy.DateDesc,
      };

      const response: ApiResponse<PageResponse<UserSearchResponse>> =
        await searchMembersForAdmin(params);

      if (!response.result) return;

      const list = response.result.items || [];

      const filtered = list.filter(
        (u) =>
          (u.roleName === "MEMBER" || u.roleName === "USER") &&
           u.userStatus !== UserStatus.PENDING_VERIFICATION &&
          u.userStatus !== UserStatus.DELETED
      );

      const counts = {
        all: filtered.length,
        [UserStatus.PENDING_APPROVE]: filtered.filter((u) => u.userStatus === UserStatus.PENDING_APPROVE).length,
        [UserStatus.ACTIVE]: filtered.filter((u) => u.userStatus === UserStatus.ACTIVE).length,
        [UserStatus.INACTIVE]: filtered.filter((u) => u.userStatus === UserStatus.INACTIVE).length,
        [UserStatus.BANNED]: filtered.filter((u) => u.userStatus === UserStatus.BANNED).length,
      };

      setTabCounts(counts);
    } catch (err) {
      console.error("fetchTabCounts error:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: UserSearchRequest = {
        keyword: searchTerm.trim() || undefined,
        status: activeTab === "all" ? undefined : activeTab,
        role: undefined,
        sortBy: sortBy as SortBy,
        page: currentPage,
        pageSize: itemsPerPage,
      };

      const response: ApiResponse<PageResponse<UserSearchResponse>> =
        await searchMembersForAdmin(params);

      if (response.result) {
        const pageData = response.result;
        const rawItems = pageData.items || [];

        const filteredItems = rawItems.filter(
          (u) =>
            (u.roleName === "MEMBER" || u.roleName === "USER") &&
             u.userStatus !== UserStatus.PENDING_VERIFICATION &&
            u.userStatus !== UserStatus.DELETED
        );

        setUsers(filteredItems);
        setTotalItemsFromBackend(pageData.totalElements);
        setTotalPagesFromBackend(pageData.totalPages || 1);
        if (pageData.pageSizes) setItemsPerPage(pageData.pageSizes);
      } else {
        setUsers([]);
        setTotalItemsFromBackend(0);
        setTotalPagesFromBackend(1);
        setTabCounts({ all: 0,[UserStatus.PENDING_APPROVE]: 0, [UserStatus.ACTIVE]: 0, [UserStatus.INACTIVE]: 0, [UserStatus.BANNED]: 0 });
        if (response.message) setError(response.message);
      }
    } catch (err: any) {
      setError("Không thể tải dữ liệu người dùng");
      setUsers([]);
      setTabCounts({ all: 0, [UserStatus.PENDING_APPROVE]: 0, [UserStatus.ACTIVE]: 0, [UserStatus.INACTIVE]: 0, [UserStatus.BANNED]: 0 });
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, currentPage, itemsPerPage, sortBy]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchTabCounts();
  }, [fetchTabCounts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, sortBy]);

  const handleCreate = async (data: UserCreationByAdminRequest) => {
    try {
      const res = await createUserByAdmin(data);
      if (res.code === 201 || res.result) {
        setShowCreate(false);
        await Promise.all([fetchUsers(), fetchTabCounts()]);
        toast.success("Tạo người dùng thành công!");
      }
    } catch {
      toast.error("Tạo người dùng thất bại");
    }
  };

  // FIXED: Click 1 lần mở modal ngay
  const handleView = async (user: UserSearchResponse) => {
    setViewingUserId(user.id);
    setViewingUserData(null); // Reset → hiện loading

    try {
      const res = await getUserDetailForAdmin(Number(user.id));
      if (res.result) {
        setViewingUserData(res.result);
      } else {
        toast.error("Không tìm thấy thông tin người dùng");
        setViewingUserId(null);
      }
    } catch {
      toast.error("Lỗi tải dữ liệu người dùng");
      setViewingUserId(null);
    }
  };

  const closeViewModal = () => {
    setViewingUserId(null);
    setViewingUserData(null);
  };

  const confirmChangeStatus = async () => {
  if (!statusChangeInfo || isChangingStatus) return;

  setIsChangingStatus(true);
  try {
    const res = await changeUserStatusForAdmin(
      Number(statusChangeInfo.user.id),
      statusChangeInfo.newStatus
    );

    if (res.code === 200 || res.result === true) {
      await Promise.all([fetchUsers(), fetchTabCounts()]);
      setStatusChangeInfo(null); // Đóng modal
      toast.success(`Đã chuyển trạng thái thành công thành "${statusConfig[statusChangeInfo.newStatus]?.label}"`);
    } else {
      toast.error(res.message || "Cập nhật thất bại");
    }
  } catch {
    toast.error("Có lỗi xảy ra");
  } finally {
    setIsChangingStatus(false);
  }
};

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItemsFromBackend);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Người Dùng</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-md transition"
        >
          <Plus size={20} />
          Thêm người dùng
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
              onClick={() => setActiveTab(tab.key)}
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

      {/* Search & Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table / Empty / Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <Users size={80} className="mx-auto text-gray-400 mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Chưa có thành viên nào</h3>
          <p className="text-gray-600 mb-8">Hãy tạo thành viên đầu tiên!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 shadow-lg transition"
          >
            Tạo thành viên đầu tiên
          </button>
        </div>
      ) : (
        <>
         <UserTable
            data={users}
            onView={handleView}
            onStatusChange={(user, status) => {
              setStatusChangeInfo({ user, newStatus: status }); 
            }}
          />

          <div className="flex justify-between items-center text-sm text-gray-600 mt-6 bg-white rounded-xl shadow-sm border p-4">
            <div>
              Hiển thị {startItem} - {endItem} của {totalItemsFromBackend} thành viên
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPagesFromBackend}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItemsFromBackend}
            />
          </div>
        </>
      )}

      {/* Modals */}
      <CreateUser open={showCreate} onClose={() => setShowCreate(false)} onSave={handleCreate} />

      {/* VIEW USER - ĐÃ BỎ {viewingUser && ...} */}
      <ViewUser
        isOpen={!!viewingUserId}
        user={viewingUserData}
        onClose={closeViewModal}
      />

      {/* Confirm Status Change */}
      <ConfirmStatusChange
        isOpen={!!statusChangeInfo}
        user={statusChangeInfo?.user ?? null}
        newStatus={statusChangeInfo?.newStatus ?? null}
        isLoading={isChangingStatus}
        message={`Bạn có chắc muốn chuyển trạng thái thành "${
          statusChangeInfo ? statusConfig[statusChangeInfo.newStatus]?.label || "mới" : ""
        }"?`}
        onCancel={() => setStatusChangeInfo(null)}
        onConfirm={confirmChangeStatus}
      />
    </div>
  );
}