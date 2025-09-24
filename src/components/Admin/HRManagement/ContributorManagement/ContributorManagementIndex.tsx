import React, { useState, useCallback } from "react";
import {
  Plus,
  Users,
  Clock,
  XCircle,
  Ban,
  UserCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ContributorStatus } from "../../../../types/enum";
import ContributorTable from "./ContributorTable";
import ContributorForm from "./ContributorForm";
import ContributorView from "./ContributorView";
import ConfirmDialog from "./ConfirmDialog";
import {
  searchContributors,
  disableContributor,
  approveContributor,
  rejectContributor,
  reactivateContributor
} from "../../../../services/contributorService";
import {
  ContributorSearchResponse,
  ContributorResponse,
} from "../../../../types/contributor";

// Tab definitions with proper status mapping
const TABS = [
  {
    key: "applied",
    label: "Chờ duyệt",
    icon: Clock,
    status: ContributorStatus.APPLIED,
  },
  {
    key: "rejected",
    label: "Đã từ chối",
    icon: XCircle,
    status: ContributorStatus.REJECTED,
  },
   {
    key: "active",
    label: "Đang hoạt động",
    icon: UserCheck,
    status: ContributorStatus.ACTIVE,
  },
  {
    key: "suspended",
    label: "Đã đình chỉ",
    icon: Ban,
    status: ContributorStatus.SUSPENDED,
  },
  {
    key: "all",
    label: "Tất cả",
    icon: Users,
    status: undefined,
  },
];

const ContributorManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("applied"); // Start with pending applications
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showConfirmAction, setShowConfirmAction] = useState(false);

  // Selected contributor and action
  const [selectedContributor, setSelectedContributor] =
    useState<ContributorResponse | null>(null);
  const [actionType, setActionType] = useState<
  "delete" | "approve" | "reject" | "restore" | null
>(null);

  // Refresh callback for child components
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    loadTabCounts();
  }, []);

  // Normalize status for consistent comparison
  const normalizeStatus = (
    status: ContributorStatus | string
  ): string => {
    if (typeof status === "string") {
      return status.toUpperCase();
    }
    return status;
  };

  // Load counts for each tab
  const loadTabCounts = async () => {
    try {
      const counts: Record<string, number> = {};

      const allRes = await searchContributors({
        keyword: "",
        page: 1,
        pageSize: 1000,
        sortBy: "IDDESC" as any,
      });

      if (allRes.code === 200 && allRes.result) {
        const allContributors = allRes.result.items;
        counts["all"] = allContributors.length;

        counts["applied"] = allContributors.filter(
          (c) =>
            normalizeStatus(c.status) ===
            ContributorStatus.APPLIED
        ).length;
        counts["active"] = allContributors.filter(
          (c) =>
            normalizeStatus(c.status) ===
            ContributorStatus.ACTIVE
        ).length;
        counts["rejected"] = allContributors.filter(
          (c) =>
            normalizeStatus(c.status) ===
            ContributorStatus.REJECTED
        ).length;
        counts["suspended"] = allContributors.filter(
          (c) =>
            normalizeStatus(c.status) ===
            ContributorStatus.SUSPENDED
        ).length;

        setTabCounts(counts);
      }
    } catch (error) {
      console.error("Load tab counts error:", error);
    }
  };

  React.useEffect(() => {
    loadTabCounts();
  }, []);

  const handleAdd = () => {
    setSelectedContributor(null);
    setShowForm(true);
  };

  const handleEdit = (contributor: ContributorSearchResponse) => {
    setSelectedContributor(
      contributor as unknown as ContributorResponse
    );
    setShowForm(true);
  };

  const handleView = (contributor: ContributorSearchResponse) => {
    setSelectedContributor(
      contributor as unknown as ContributorResponse
    );
    setShowView(true);
  };

  const handleAction = (
    contributor: ContributorSearchResponse,
    action: "delete" | "approve" | "reject" | "restore"
  ) => {
    setSelectedContributor(
      contributor as unknown as ContributorResponse
    );
    setActionType(action);
    setShowConfirmAction(true);
  };

  const confirmAction = async () => {
    if (!selectedContributor || !actionType) return;

    try {
      setLoading(true);
      let res;
      switch (actionType) {
        case "delete":
          res = await disableContributor(selectedContributor.id);
          break;
        case "approve":
          res = await approveContributor(selectedContributor.id);
          break;
        case "reject":
          res = await rejectContributor(selectedContributor.id);
          break;
        case "restore":
          res = await reactivateContributor(selectedContributor.id);
          break;
      }

      if (res && res.code === 200) {
        let message = "";
        switch (actionType) {
          case "delete":
            message = "Đình chỉ cộng tác viên thành công!";
            break;
          case "approve":
            message = "Phê duyệt cộng tác viên thành công!";
            break;
          case "reject":
            message = "Từ chối cộng tác viên thành công!";
            break;
          case "restore":
            message = "Khôi phục cộng tác viên thành công!";
            break;
        }
        toast.success(message);

        setShowConfirmAction(false);
        setActionType(null);
        setSelectedContributor(null);
        handleRefresh();
      } else {
        toast.error(res?.message || "Thao tác thất bại!");
      }
    } catch (error) {
      console.error("Confirm action error:", error);
      toast.error("Thao tác thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setShowConfirmAction(false);
      setActionType(null);
    }
  };

  const getActionMessage = () => {
    switch (actionType) {
      case "delete":
        return `Bạn có chắc muốn đình chỉ cộng tác viên "${selectedContributor?.userFullName}"? Họ sẽ không thể thực hiện các hoạt động đóng góp.`;
      case "approve":
        return `Bạn có chắc muốn phê duyệt cộng tác viên "${selectedContributor?.userFullName}"? Họ sẽ có thể bắt đầu thực hiện các hoạt động đóng góp.`;
      case "reject":
        return `Bạn có chắc muốn từ chối đơn của "${selectedContributor?.userFullName}"? Đơn đăng ký sẽ bị từ chối và họ cần nộp lại đơn mới.`;
      case "restore":
        return `Bạn có chắc muốn khôi phục cộng tác viên "${selectedContributor?.userFullName}"? Họ sẽ có thể tiếp tục hoạt động.`;
      default:
        return "";
    }
  };

  const currentTabStatus = TABS.find(
    (tab) => tab.key === activeTab
  )?.status;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Quản Lý Cộng Tác Viên
        </h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Thêm Cộng Tác Viên
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key] || 0;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${
                    isActive
                      ? `border-blue-500 text-blue-600`
                      : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${
                      isActive
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Table */}
      <ContributorTable
        filterStatus={currentTabStatus}
        onEdit={handleEdit}
        onView={handleView}
        onAction={handleAction}
        refreshTrigger={refreshTrigger}
        onDataChange={loadTabCounts}
      />

      {/* Modals */}
      <ContributorForm
        open={showForm}
        onClose={() => setShowForm(false)}
        contributor={selectedContributor}
        onSuccess={handleRefresh}
      />

      <ContributorView
        open={showView}
        onClose={() => setShowView(false)}
        contributor={selectedContributor}
      />

      <ConfirmDialog
        open={showConfirmAction}
        onClose={() => setShowConfirmAction(false)}
        onConfirm={confirmAction}
        title="Xác nhận thao tác"
        message={getActionMessage()}
        confirmText="Xác nhận"
        cancelText="Hủy"
        type={
          actionType === "approve"
            ? "info"
            : actionType === "reject"
            ? "danger"
            : "warning"
        }
        loading={loading}
      />
    </div>
  );
};

export default ContributorManagement;
