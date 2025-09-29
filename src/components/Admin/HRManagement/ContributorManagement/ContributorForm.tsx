import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createContributor,
  updateContributor,
  getContributorDetail,
  searchDropdownUser,
} from "../../../../services/contributorService";
import {
  ContributorCreateRequest,
  ContributorUpdateRequest,
  ContributorResponse,
  DropdownUserResponse,
} from "../../../../types/contributor";
import { ContributorStatus } from "../../../../types/enum";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";

interface ContributorFormProps {
  open: boolean;
  onClose: () => void;
  contributor: ContributorResponse | null;
  onSuccess: () => void;
}

const ContributorForm: React.FC<ContributorFormProps> = ({
  open,
  onClose,
  contributor,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    bio: string;
    expertise: string;
    status: ContributorStatus;
    documentsUrl: string;
    isPremiumEligible: boolean;
  }>({
    bio: "",
    expertise: "",
    status: ContributorStatus.APPLIED,
    documentsUrl: "",
    isPremiumEligible: false
  });

  const [userOptions, setUserOptions] = useState<DropdownUserResponse[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isEditing = !!contributor;

  // debounce
  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const loadUserOptions = async (keyword: string = "") => {
    if (loadingUsers) return;
    setLoadingUsers(true);
    try {
      const res = await searchDropdownUser(keyword);
      setUserOptions(res.code === 200 && res.result ? res.result : []);
    } catch (error) {
      console.error("Load user options error:", error);
      toast.error("Không thể tải danh sách người dùng");
      setUserOptions([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const debouncedLoadUsers = useCallback(debounce(loadUserOptions, 300), []);

  const normalizeStatus = (status: ContributorStatus | string): ContributorStatus => {
    if (typeof status === "string") {
      const upper = status.toUpperCase();
      // convert string enum name to enum value if exists
      if (upper in ContributorStatus) {
        return ContributorStatus[upper as keyof typeof ContributorStatus];
      }
      return ContributorStatus.APPLIED;
    }
    return status;
  };

  useEffect(() => {
    const loadContributorDetail = async () => {
      if (isEditing && contributor) {
        try {
          const res = await getContributorDetail(contributor.id);
          if (res.code === 200 && res.result) {
            setFormData({
              bio: res.result.bio || "",
              expertise: res.result.expertise || "",
              status: normalizeStatus(res.result.status),
              documentsUrl: res.result.documentsUrl || "", 
              isPremiumEligible: res.result.isPremiumEligible
            });
          }
        } catch (error) {
          console.error("Load contributor detail error:", error);
          toast.error("Không thể tải chi tiết cộng tác viên");
        }
      }
    };

    if (open) {
      if (isEditing) {
        loadContributorDetail();
      } else {
        // reset full formData including documentsUrl
        setFormData({
          bio: "",
          expertise: "",
          status: ContributorStatus.APPLIED,
          documentsUrl: "",
          isPremiumEligible: false
        });
        setSelectedUserId(undefined);
        setUserSearchTerm("");
        setUserOptions([]);
        setShowUserDropdown(false);
        loadUserOptions();
      }
    }
  }, [open, isEditing, contributor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserDropdown && !target.closest(".user-dropdown-container")) {
        setShowUserDropdown(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserDropdown, open]);

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "status"
          ? (value as ContributorStatus)
          : value,
    }));
  };

  const handleUserSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserSearchTerm(value);
    setSelectedUserId(undefined);
    setShowUserDropdown(true);
    debouncedLoadUsers(value);
  };

  const handleUserSelect = (user: DropdownUserResponse) => {
    setSelectedUserId(user.id);
    setUserSearchTerm(`${user.fullName} (${user.email})`);
    setShowUserDropdown(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      if (isEditing && contributor) {
        const updateData: ContributorUpdateRequest = {
          bio: formData.bio,
          expertise: formData.expertise,
          status: String(formData.status),
          isPremiumEligible: formData.isPremiumEligible,
          // ensure your ContributorUpdateRequest type (frontend & backend) supports documentsUrl if you want to send it
          ...(formData.documentsUrl ? { documentsUrl: formData.documentsUrl } : {}),
        } as any;

        const res = await updateContributor(contributor.id, updateData);
      if (Number(res.code) === 200) {
          toast.success("Cập nhật cộng tác viên thành công!");
          const updated = await getContributorDetail(contributor.id);
          if (updated.code === 200 && updated.result) {
            setFormData({
              bio: updated.result.bio || "",
              expertise: updated.result.expertise || "",
              status: normalizeStatus(updated.result.status),
              documentsUrl: updated.result.documentsUrl || "",
              isPremiumEligible: updated.result.isPremiumEligible || false
            });
          }
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || "Cập nhật thất bại!");
        }
      } else {
        if (!selectedUserId) {
          toast.error("Vui lòng chọn người dùng!");
          return;
        }
        const createData: ContributorCreateRequest = {
          userId: selectedUserId,
          bio: formData.bio,
          expertise: formData.expertise,
          isPremiumEligible: formData.isPremiumEligible
          // create currently doesn't send documentsUrl (kept for apply flow)
        };
        const res = await createContributor(createData);
        if (res.code === 201) {
          toast.success("Thêm cộng tác viên thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || "Thêm cộng tác viên thất bại!");
        }
      }
    } catch (error: any) {
      console.error("Save contributor error:", error);
      toast.error(error.message || "Thao tác thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<ContributorStatus, string> = {
    [ContributorStatus.APPLIED]: "Chờ duyệt",
    [ContributorStatus.REJECTED]: "Từ chối",
    [ContributorStatus.ACTIVE]: "Duyệt",
    [ContributorStatus.SUSPENDED]: "Đình chỉ",
  };

  return (
    <PortalModal
      open={open}
      onClose={onClose}
      size="lg"
      ariaLabel={isEditing ? "Cập nhật cộng tác viên" : "Thêm cộng tác viên"}
      centered
      contentClassName="bg-white rounded-2xl p-6 shadow-xl w-[600px] max-w-full"
    >
      <div className="bg-white rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold">
              {isEditing ? "Cập nhật" : "Thêm"} Cộng Tác Viên
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {isEditing
                ? "Chỉnh sửa thông tin và trạng thái cộng tác viên"
                : "Thêm người dùng mới vào danh sách cộng tác viên"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SHOW USER INFO WHEN EDITING */}
          {isEditing && contributor && (
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Người dùng:</span>{" "}
                {contributor.userFullName ?? "-"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Email:</span>{" "}
                {contributor.userEmail ?? "-"}
              </p>
              {contributor.documentsUrl && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Tài liệu:</span>{" "}
                <a
                  href={contributor.documentsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Xem tài liệu
                </a>
              </p>
             )}
            </div>
          )}


          {/* CREATE: user selector */}
          {!isEditing && (
            <div className="relative user-dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn người dùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên hoặc email để tìm kiếm..."
                value={userSearchTerm}
                onChange={handleUserSearch}
                onFocus={() => {
                  setShowUserDropdown(true);
                  if (userOptions.length === 0) loadUserOptions();
                }}
                disabled={loading}
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
              {showUserDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {loadingUsers ? (
                    <div className="p-4 text-sm text-blue-500 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Đang tải...
                    </div>
                  ) : userOptions.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      {userSearchTerm ? "Không tìm thấy người dùng nào" : "Nhập để tìm kiếm người dùng"}
                    </div>
                  ) : (
                    userOptions.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 text-sm transition-colors"
                      >
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* BIO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleFormChange}
              rows={3}
              disabled={loading}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Nhập tiểu sử..."
            />
          </div>

          {/* EXPERTISE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên môn</label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleFormChange}
              disabled={loading}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Nhập chuyên môn..."
            />
          </div>

          {/* DOCUMENTS URL - visible when editing */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tài liệu (URL)</label>
              <input
                type="url"
                name="documentsUrl"
                value={formData.documentsUrl}
                onChange={handleFormChange}
                disabled={loading}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nhập đường dẫn tài liệu..."
              />
            </div>
          )}

          {/* IS PREMIUM ELIGIBLE */}
<div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-red-50">
  <span className="text-sm font-medium text-gray-900">
    Cho phép đăng bài <span className="text-red-600 font-semibold">Premium</span>
  </span>

  <button
    type="button"
    role="switch"
    aria-checked={formData.isPremiumEligible}
    onClick={() =>
      setFormData((prev) => ({
        ...prev,
        isPremiumEligible: !prev.isPremiumEligible,
      }))
    }
    disabled={loading}
    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
      formData.isPremiumEligible
        ? "bg-gradient-to-r from-yellow-600 to-red-600"
        : "bg-gray-300"
    } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
        formData.isPremiumEligible ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
</div>


          {/* STATUS (editable when not ACTIVE) */}
          {isEditing && formData.status !== ContributorStatus.ACTIVE && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                disabled={loading}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {Object.values(ContributorStatus).map((status) => (
                  <option key={status} value={status}>
                    {statusMap[status as ContributorStatus] || status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || (!isEditing && !selectedUserId)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Đang cập nhật..." : "Đang thêm..."}
                </>
              ) : isEditing ? (
                "Cập nhật"
              ) : (
                "Thêm"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </PortalModal>
  );
};

export default ContributorForm;
