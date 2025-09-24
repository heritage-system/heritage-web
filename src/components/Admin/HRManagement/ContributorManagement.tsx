import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { Edit, Eye, Plus, Trash2, X, Check, Ban, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  searchContributors,
  disableContributor,
  createContributor,
  updateContributor,
  getContributorDetail,
  approveContributor,
  rejectContributor,
  searchDropdownUser,
} from "../../../services/contributorService";
import {
  ContributorSearchResponse,
  ContributorCreateRequest,
  ContributorUpdateRequest,
  ContributorResponse,
  DropdownUserResponse,
} from "../../../types/contributor";
import { ContributorStatus, SortBy } from "../../../types/enum";
import Pagination from "../../Layouts/Pagination";
import PortalModal from "../../Layouts/ModalLayouts/PortalModal";

const ContributorManagement: React.FC = () => {
  const [contributors, setContributors] = useState<ContributorSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.IdDesc);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [selectedContributor, setSelectedContributor] = useState<ContributorResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showConfirmAction, setShowConfirmAction] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'approve' | 'reject' | null>(null);

  const [formData, setFormData] = useState<ContributorCreateRequest | ContributorUpdateRequest>({
    bio: "",
    expertise: "",
  });

  const [userOptions, setUserOptions] = useState<DropdownUserResponse[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Debounce search để tránh gọi API quá nhiều
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const loadContributors = async () => {
    setLoading(true);
    try {
      const res = await searchContributors({
        keyword: searchTerm,
        page: currentPage,
        pageSize: itemsPerPage,
        sortBy: sortBy,
      });

      if (res.code === 200 && res.result) {
        setContributors(res.result.items);
        setTotalPages(res.result.totalPages);
      } else {
        setContributors([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Load contributors error:", error);
      toast.error("Không thể tải dữ liệu cộng tác viên");
    }
    setLoading(false);
  };

  const loadUserOptions = async (keyword: string = "") => {
    if (loadingUsers) return;
    
    setLoadingUsers(true);
    try {
      const res = await searchDropdownUser(keyword);
      if (res.code === 200 && res.result) {
        setUserOptions(res.result);
      } else {
        setUserOptions([]);
      }
    } catch (error) {
      console.error("Load user options error:", error);
      toast.error("Không thể tải danh sách người dùng");
      setUserOptions([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Debounced search function
  const debouncedLoadUsers = useCallback(
    debounce((keyword: string) => {
      loadUserOptions(keyword);
    }, 300),
    []
  );

  useEffect(() => {
    loadContributors();
  }, [searchTerm, currentPage, itemsPerPage, sortBy]);

  // Load initial users when form opens - FIX: Load ngay khi form mở
  useEffect(() => {
    if (showForm && !selectedContributor) {
      loadUserOptions();
    }
  }, [showForm, selectedContributor]);

  const handleAdd = () => {
  setSelectedContributor(null);
  setFormData({ bio: "", expertise: "" });
  setSelectedUserId(undefined);
  setUserSearchTerm("");
  setShowUserDropdown(false); // Reset dropdown state
  setShowForm(true);
};

  // Thêm vào useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserDropdown && !target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  const handleEdit = async (item: ContributorSearchResponse) => {
    try {
      const res = await getContributorDetail(item.id);
      if (res.code === 200 && res.result) {
        setSelectedContributor(res.result);
        setFormData({
          bio: res.result.bio || "",
          expertise: res.result.expertise || "",
          verified: res.result.verified,
          status: res.result.status,
        });
        setShowForm(true);
      }
    } catch (error) {
      console.error("Edit contributor error:", error);
      toast.error("Không thể tải chi tiết cộng tác viên");
    }
  };

  const handleView = async (item: ContributorSearchResponse) => {
    try {
      const res = await getContributorDetail(item.id);
      if (res.code === 200 && res.result) {
        setSelectedContributor(res.result);
        setShowView(true);
      }
    } catch (error) {
      console.error("View contributor error:", error);
      toast.error("Không thể tải chi tiết cộng tác viên");
    }
  };

  const handleAction = (item: ContributorSearchResponse, action: 'delete' | 'approve' | 'reject') => {
    setSelectedContributor(item as unknown as ContributorResponse);
    setActionType(action);
    setShowConfirmAction(true);
  };

  // FIX: Cải thiện confirmAction để refresh table đúng cách
  const confirmAction = async () => {
    if (!selectedContributor || !actionType) return;

    try {
      let res;
      switch (actionType) {
        case 'delete':
          res = await disableContributor(selectedContributor.id);
          break;
        case 'approve':
          res = await approveContributor(selectedContributor.id);
          break;
        case 'reject':
          res = await rejectContributor(selectedContributor.id);
          break;
      }

      if (res && res.code === 200) {
        let message = "";
        switch (actionType) {
          case 'delete':
            message = "Vô hiệu hóa cộng tác viên thành công!";
            break;
          case 'approve':
            message = "Phê duyệt cộng tác viên thành công!";
            break;
          case 'reject':
            message = "Từ chối cộng tác viên thành công!";
            break;
        }
        toast.success(message);
        
        // Close modal first
        setShowConfirmAction(false);
        setActionType(null);
        setSelectedContributor(null);
        
        // Then refresh table
        await loadContributors();
      } else {
        toast.error(res?.message || "Thao tác thất bại!");
        setShowConfirmAction(false);
        setActionType(null);
      }
    } catch (error) {
      console.error("Confirm action error:", error);
      toast.error("Thao tác thất bại. Vui lòng thử lại!");
      setShowConfirmAction(false);
      setActionType(null);
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUserSearch = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setUserSearchTerm(value);
  setSelectedUserId(undefined); 
  setShowUserDropdown(true); 
  debouncedLoadUsers(value);
};

  const saveContributor = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedContributor) {
        // Update contributor
        const updateData = formData as ContributorUpdateRequest;
        const res = await updateContributor(selectedContributor.id, updateData);
        if (res.code === 200) {
          toast.success("Cập nhật cộng tác viên thành công!");
          setShowForm(false);
          // Refresh table ngay sau khi update
          await loadContributors();
        } else {
          toast.error(res.message || "Cập nhật thất bại!");
        }
      } else {
        // Create contributor
        if (!selectedUserId) {
          toast.error("Vui lòng chọn người dùng!");
          return;
        }
        const createData: ContributorCreateRequest = {
          ...formData,
          userId: selectedUserId,
        };
        const res = await createContributor(createData);
        if (res.code === 201) {
          toast.success("Thêm cộng tác viên thành công!");
          setShowForm(false);
          
          // Reset form state
          setFormData({ bio: "", expertise: "" });
          setSelectedUserId(undefined);
          setUserSearchTerm("");
          setUserOptions([]);
          
          // Refresh table ngay sau khi create
          await loadContributors();
        } else {
          toast.error(res.message || "Thêm cộng tác viên thất bại!");
        }
      }
    } catch (error: any) {
      console.error("Save contributor error:", error);
      toast.error(error.message || "Thao tác thất bại. Vui lòng thử lại!");
    }
  };

  // Chuyển đổi status sang tiếng Việt
  const getStatusText = (status: ContributorStatus | string | number) => {
    switch (status) {
      case ContributorStatus.APPLIED:
      case "APPLIED":
      case 0:
        return "Đã Ứng Tuyển";

      case ContributorStatus.APPROVED:
      case "APPROVED": 
      case 1:
        return "Đã Phê Duyệt";

      case ContributorStatus.ACTIVE:
      case "ACTIVE":
      case 2:
        return "Đang Hoạt Động";

      case ContributorStatus.REJECTED:
      case "REJECTED":
      case 3:
        return "Đã Từ Chối";

      case ContributorStatus.SUSPENDED:
      case "SUSPENDED":
      case 4:
        return "Tạm Ngưng";

      default:
        return String(status);
    }
  };

  const getStatusBadge = (status: ContributorStatus | string | number) => {
    const getStatusConfig = (statusValue: any) => {
      switch (statusValue) {
        case ContributorStatus.APPLIED:
        case "APPLIED":
        case 0:
          return { color: "bg-yellow-100 text-yellow-800", text: "Đã Ứng Tuyển" };

        case ContributorStatus.APPROVED:
        case "APPROVED":
        case 1:
          return { color: "bg-blue-100 text-blue-800", text: "Đã Phê Duyệt" };

        case ContributorStatus.ACTIVE:
        case "ACTIVE":
        case 2:
          return { color: "bg-green-100 text-green-800", text: "Đang Hoạt Động" };

        case ContributorStatus.REJECTED:
        case "REJECTED":
        case 3:
          return { color: "bg-red-100 text-red-800", text: "Đã Từ Chối" };

        case ContributorStatus.SUSPENDED:
        case "SUSPENDED":
        case 4:
          return { color: "bg-gray-100 text-gray-800", text: "Tạm Ngưng" };

        default:
          return { color: "bg-gray-200 text-gray-600", text: String(statusValue) };
      }
    };

    const config = getStatusConfig(status);
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getActionMessage = () => {
    switch (actionType) {
      case 'delete':
        return `Bạn có chắc muốn vô hiệu hóa cộng tác viên ${selectedContributor?.userFullName}?`;
      case 'approve':
        return `Bạn có chắc muốn phê duyệt cộng tác viên ${selectedContributor?.userFullName}?`;
      case 'reject':
        return `Bạn có chắc muốn từ chối cộng tác viên ${selectedContributor?.userFullName}?`;
      default:
        return "";
    }
  };

  const getSortText = (sortValue: SortBy) => {
    switch (sortValue) {
      case SortBy.IdAsc:
        return "ID tăng dần";
      case SortBy.IdDesc:
        return "ID giảm dần";
      case SortBy.NameAsc:
        return "Tên A-Z";
      case SortBy.NameDesc:
        return "Tên Z-A";
      case SortBy.DateAsc:
        return "Ngày tăng dần";
      case SortBy.DateDesc:
        return "Ngày giảm dần";
      default:
        return "Mặc định";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản Lý Cộng Tác Viên</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Thêm Cộng Tác Viên
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm cộng tác viên..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-md w-64"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="border px-3 py-2 rounded-md"
        >
          {Object.values(SortBy).map((sort) => (
            <option key={sort} value={sort}>
              {getSortText(sort)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Cộng Tác Viên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số bài đăng</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">Đang tải...</td>
              </tr>
            ) : contributors.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">Không có dữ liệu</td>
              </tr>
            ) : (
              contributors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.userFullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.userEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(c.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('vi-VN') : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.count ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleView(c)} 
                      className="text-blue-600 hover:text-blue-900"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleEdit(c)} 
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    {c.status === ContributorStatus.APPLIED && (
                      <>
                        <button 
                          onClick={() => handleAction(c, 'approve')} 
                          className="text-green-600 hover:text-green-900"
                          title="Phê duyệt"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction(c, 'reject')} 
                          className="text-red-600 hover:text-red-900"
                          title="Từ chối"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {c.status !== ContributorStatus.SUSPENDED && (
                      <button 
                        onClick={() => handleAction(c, 'delete')} 
                        className="text-red-600 hover:text-red-900"
                        title="Vô hiệu hóa"
                      >
                        <Ban size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={contributors.length}
      />

      {/* Form Modal */}
      <PortalModal
        open={showForm}
        onClose={() => setShowForm(false)}
        size="lg"
        ariaLabel="Form cộng tác viên"
        centered
         contentClassName="bg-white rounded-2xl p-6 shadow-xl w-[500px] max-w-full"
      >
        <div className="bg-white rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {selectedContributor ? "Cập nhật" : "Thêm"} Cộng Tác Viên
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={saveContributor} className="space-y-4">
            {!selectedContributor && (
              <div className="relative user-dropdown-container"> 
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn người dùng *
                </label>
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={userSearchTerm}
                  onChange={handleUserSearch}
                  onFocus={() => {
                    setShowUserDropdown(true);
                    if (userOptions.length === 0) loadUserOptions();
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Dropdown menu */}
                {showUserDropdown && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {loadingUsers ? (
                      <div className="p-3 text-sm text-blue-500 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                        Đang tải...
                      </div>
                    ) : userOptions.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        {userSearchTerm ? "Không tìm thấy người dùng nào" : "Nhập để tìm kiếm người dùng"}
                      </div>
                    ) : (
                      userOptions.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setUserSearchTerm(`${user.fullName} (${user.email})`);
                            setShowUserDropdown(false);
                          }}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                        >
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-gray-500 text-xs">{user.email}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiểu sử
              </label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleFormChange}
                rows={3}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiểu sử..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chuyên môn
              </label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise || ""}
                onChange={handleFormChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập chuyên môn..."
              />
            </div>

            {selectedContributor && 'status' in formData && 'verified' in formData && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(ContributorStatus).map((status) => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="verified"
                      checked={formData.verified || false}
                      onChange={handleFormChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Đã xác minh</span>
                  </label>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-medium"
              >
                {selectedContributor ? "Cập nhật" : "Thêm"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </PortalModal>

      {/* View Modal */}
      <PortalModal
        open={showView}
        onClose={() => setShowView(false)}
        size="lg"
        ariaLabel="Chi tiết cộng tác viên"
        centered
        contentClassName="bg-white rounded-2xl p-6 shadow-xl"
      >
        {selectedContributor && (
          <div className="bg-white rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Chi tiết Cộng Tác Viên</h3>
              <button
                onClick={() => setShowView(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>ID:</strong>
                <p className="text-gray-600">{selectedContributor.id}</p>
              </div>
              <div>
                <strong>Email:</strong>
                <p className="text-gray-600">{selectedContributor.userEmail}</p>
              </div>
              <div>
                <strong>Họ tên:</strong>
                <p className="text-gray-600">{selectedContributor.userFullName}</p>
              </div>
              <div>
                <strong>Trạng thái:</strong>
                <p className="mt-1">{getStatusBadge(selectedContributor.status)}</p>
              </div>
              <div className="md:col-span-2">
                <strong>Tiểu sử:</strong>
                <p className="text-gray-600 mt-1">{selectedContributor.bio || "Chưa có thông tin"}</p>
              </div>
              <div className="md:col-span-2">
                <strong>Chuyên môn:</strong>
                <p className="text-gray-600 mt-1">{selectedContributor.expertise || "Chưa có thông tin"}</p>
              </div>
              <div>
                <strong>Đã xác minh:</strong>
                <p className="text-gray-600">{selectedContributor.verified ? "Có" : "Không"}</p>
              </div>
              <div>
                <strong>Số di tích:</strong>
                <p className="text-gray-600">{selectedContributor.count ?? 0}</p>
              </div>
              <div>
                <strong>Ngày tạo:</strong>
                <p className="text-gray-600">{new Date(selectedContributor.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <strong>Cập nhật cuối:</strong>
                <p className="text-gray-600">
                  {selectedContributor.updatedAt ? new Date(selectedContributor.updatedAt).toLocaleString('vi-VN') : "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>
        )}
      </PortalModal>

      {/* Confirm Action Modal */}
      <PortalModal
        open={showConfirmAction}
        onClose={() => setShowConfirmAction(false)}
        size="sm"
        ariaLabel="Xác nhận hành động"
        centered
        contentClassName="bg-white rounded-2xl p-6 shadow-xl"
      >
        <div className="bg-white rounded-xl text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận</h3>
          <p className="text-gray-600 mb-6">{getActionMessage()}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={confirmAction}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
            >
              Xác nhận
            </button>
            <button
              onClick={() => setShowConfirmAction(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      </PortalModal>
    </div>
  );
};

export default ContributorManagement;