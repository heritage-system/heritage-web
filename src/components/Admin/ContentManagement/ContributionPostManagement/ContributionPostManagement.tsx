import React, { useState } from "react";
import { FileText, Clock, XCircle, CheckCircle } from "lucide-react";
import ContributionTable from "./ContributionTable";
import ContributionView from "./ContributionView";
import ConfirmDialog from "./ConfirmDialog";

// Enums - updated to match backend
const ContributionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

// Interfaces
interface Contribution {
  id: number;
  title: string;
  coverImageUrl: string;
  htmlContent: string;
  contributorName: string;
  contributorEmail: string;
  status: string;
  premiumType: string;
  createdAt: string;
  approvedAt?: string;
  heritageTags: string[];
  staffApprovals: number[];
  requiredApprovals: number;
  assignedStaffIds: number[];
}

interface TabCounts {
  pending: number;
  approved: number;
  rejected: number;
  all: number;
}

// Tab definitions
const TABS = [
  {
    key: "pending" as const,
    label: "Chờ duyệt",
    icon: Clock,
    status: ContributionStatus.PENDING,
  },
  {
    key: "approved" as const,
    label: "Đã duyệt",
    icon: CheckCircle,
    status: ContributionStatus.APPROVED,
  },
  {
    key: "rejected" as const,
    label: "Đã từ chối",
    icon: XCircle,
    status: ContributionStatus.REJECTED,
  },
  {
    key: "all" as const,
    label: "Tất cả",
    icon: FileText,
    status: undefined,
  },
];

const ContributionPostManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof TabCounts>("pending");
  const [tabCounts, setTabCounts] = useState<TabCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });
  const [showView, setShowView] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleView = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setShowView(true);
  };

  const handleAction = (contribution: Contribution, action: "approve" | "reject") => {
    setSelectedContribution(contribution);
    setActionType(action);
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!selectedContribution || !actionType) return;

    setLoading(true);

    try {
      // TODO: Replace with actual API calls
      if (actionType === "approve") {
        // Example API call:
        // await fetch(`/api/contributions/${selectedContribution.id}/approve`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ staffId: CURRENT_STAFF_ID })
        // });
        
        console.log("Approving contribution:", selectedContribution.id);
      } else if (actionType === "reject") {
        // Example API call:
        // await fetch(`/api/contributions/${selectedContribution.id}/reject`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ staffId: CURRENT_STAFF_ID })
        // });
        
        console.log("Rejecting contribution:", selectedContribution.id);
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoading(false);
      setShowConfirm(false);
      setActionType(null);
      setSelectedContribution(null);
      
      // Trigger refresh to reload data
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error performing action:", error);
      setLoading(false);
      // TODO: Show error notification
    }
  };

  const getActionMessage = () => {
    if (!selectedContribution) return "";

    switch (actionType) {
      case "approve":
        const currentApprovals = selectedContribution.staffApprovals?.length || 0;
        const requiredApprovals = selectedContribution.requiredApprovals || 1;
        const newCount = currentApprovals + 1;
        
        if (newCount >= requiredApprovals) {
          return `Bạn có chắc muốn duyệt bài "${selectedContribution.title}"? Bài viết sẽ được chuyển sang trạng thái ĐÃ DUYỆT (${newCount}/${requiredApprovals} người duyệt).`;
        } else {
          return `Bạn có chắc muốn duyệt bài "${selectedContribution.title}"? Tiến độ: ${newCount}/${requiredApprovals} người duyệt.`;
        }
      case "reject":
        return `Bạn có chắc muốn từ chối bài "${selectedContribution.title}"? Bài viết sẽ bị từ chối ngay lập tức.`;
      default:
        return "";
    }
  };

  const currentTabStatus = TABS.find((tab) => tab.key === activeTab)?.status;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Quản Lý Bài Đăng Đóng Góp
        </h2>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key];

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <ContributionTable
        filterStatus={currentTabStatus}
        onView={handleView}
        onAction={handleAction}
        refreshTrigger={refreshTrigger}
        onCountsUpdate={setTabCounts}
      />

      <ContributionView
        open={showView}
        onClose={() => setShowView(false)}
        contribution={selectedContribution}
      />

      <ConfirmDialog
        open={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setActionType(null);
        }}
        onConfirm={confirmAction}
        title="Xác nhận thao tác"
        message={getActionMessage()}
        type={actionType === "reject" ? "danger" : "info"}
        loading={loading}
      />
    </div>
  );
};

export default ContributionPostManagement;