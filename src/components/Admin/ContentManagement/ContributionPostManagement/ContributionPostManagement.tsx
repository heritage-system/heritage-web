import React, { useState, useEffect, useCallback } from "react";
import { FileText, Clock, XCircle, CheckCircle, Search } from "lucide-react";
import {
  getListContributionsOverviewForStaff,
  getContributionOverviewForStaff,
  approveContributionAcceptance,
  rejectContributionAcceptance,
} from "../../../../services/contributionAcceptanceService";
import {
  ContributionOverviewItemListResponse,
  ContributionOverviewSearchRequest,
  ContributionAcceptanceDecisionRequest,
} from "../../../../types/contribution";
import { PageResponse } from "../../../../types/pageResponse";
import ContributionTable from "./ContributionTable";
import ContributionDetailSection from "../../../../components/ViewProfile/Contribution/ContributionDetailSection";
import ConfirmDialog from "./ConfirmDialog";
import RejectDialog from "./RejectDialog";
import { ContributionStatus, SortBy } from "../../../../types/enum";

const TABS = [
  { key: "pending" as const, label: "Chờ duyệt", icon: Clock, status: ContributionStatus.PENDING },
  { key: "approved" as const, label: "Đã duyệt", icon: CheckCircle, status: ContributionStatus.APPROVED },
  { key: "rejected" as const, label: "Đã từ chối", icon: XCircle, status: ContributionStatus.REJECTED },
  { key: "all" as const, label: "Tất cả", icon: FileText, status: undefined },
];

interface TabCounts {
  pending: number;
  approved: number;
  rejected: number;
  all: number;
}

const ContributionPostManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof TabCounts>("pending");
  const [tabCounts, setTabCounts] = useState<TabCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  const [contributions, setContributions] = useState<ContributionOverviewItemListResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.IdDesc);

  const [showDetail, setShowDetail] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<ContributionOverviewItemListResponse | null>(null);
  const [selectedContributionId, setSelectedContributionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const currentTabStatus = TABS.find((tab) => tab.key === activeTab)?.status;

  // Fetch all tab counts
  const fetchAllTabCounts = useCallback(async () => {
    try {
      const fetchCount = async (status?: ContributionStatus) => {
        const params: ContributionOverviewSearchRequest = {
          contributionStatus: status,
          page: 1,
          pageSize: 1,
        };
        const response = await getListContributionsOverviewForStaff(params);
        return response?.result?.totalElements || 0;
      };

      const [pending, approved, rejected, all] = await Promise.all([
        fetchCount(ContributionStatus.PENDING),
        fetchCount(ContributionStatus.APPROVED),
        fetchCount(ContributionStatus.REJECTED),
        fetchCount(undefined),
      ]);

      setTabCounts({ pending, approved, rejected, all });
    } catch (error) {
      console.error("❌ Error fetching tab counts:", error);
    }
  }, []);

  // Fetch contributions for current tab
  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);
      const params: ContributionOverviewSearchRequest = {
        keyword: keyword || undefined,
        contributionStatus: currentTabStatus,
        sortBy,
        page,
        pageSize,
      };

      const response = await getListContributionsOverviewForStaff(params);
      if (response?.result) {
        const data: PageResponse<ContributionOverviewItemListResponse> = response.result;
        setContributions(data.items);
        setTotalItems(data.totalElements);
      }
    } catch (error) {
      console.error("❌ Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, currentTabStatus, sortBy, page, pageSize]);

  // Load detail for refresh after reject
  const loadDetail = useCallback(async (acceptanceId: number) => {
    try {
      const response = await getContributionOverviewForStaff(acceptanceId);
      if (response?.result) {
        setSelectedContribution(response.result as any);
      }
    } catch (error) {
      console.error("❌ Error reloading contribution detail:", error);
    }
  }, []);

  // Load counts once on mount and after actions
  useEffect(() => {
    fetchAllTabCounts();
  }, [fetchAllTabCounts, refreshTrigger]);

  // Load contributions when filters change
  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const handleView = (item: ContributionOverviewItemListResponse) => {
    setSelectedContribution(item); 
    setSelectedContributionId(item.id);
    setShowDetail(true);
  };

  const handleAction = (item: ContributionOverviewItemListResponse, action: "approve" | "reject") => {
    setSelectedContribution(item);
    if (action === "approve") setShowConfirm(true);
    else setShowRejectDialog(true);
  };

  // Approve từ detail view
  const handleApproveFromDetail = () => {
    if (selectedContribution) {
      setShowConfirm(true);
    }
  };

  // Reject từ detail view
  const handleRejectFromDetail = () => {
    if (selectedContribution) {
      setShowRejectDialog(true);
    }
  };

  const confirmApprove = async () => {
    if (!selectedContribution) return;
    setLoading(true);
    try {
      await approveContributionAcceptance(selectedContribution.acceptanceId);
      setContributions((prev) => prev.filter((item) => item.acceptanceId !== selectedContribution.acceptanceId));

      setTabCounts((prev) => ({
        ...prev,
        pending: Math.max(prev.pending - 1, 0),
        approved: prev.approved + 1,
      }));

      setShowConfirm(false);
      
      if (showDetail) {
        setShowDetail(false);
        setSelectedContributionId(null);
      }
      
      setSelectedContribution(null);
      if (activeTab !== "pending") setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Error approving contribution:", error);
      alert("Có lỗi xảy ra khi duyệt bài!");
    } finally {
      setLoading(false);
    }
  };

  const confirmReject = async (note: string) => {
    if (!selectedContribution) return;
    setLoading(true);
    try {
      const request: ContributionAcceptanceDecisionRequest = { note };
      await rejectContributionAcceptance(selectedContribution.acceptanceId, request);

      const updatedDetail = await getContributionOverviewForStaff(selectedContribution.acceptanceId);
      if (updatedDetail?.result) {
        setSelectedContribution(updatedDetail.result as any);
      }

      setContributions((prev) =>
        prev.filter((item) => item.acceptanceId !== selectedContribution.acceptanceId)
      );

      setTabCounts((prev) => ({
        ...prev,
        pending: Math.max(prev.pending - 1, 0),
        rejected: prev.rejected + 1,
      }));

      setShowRejectDialog(false);

      // Nếu đang ở detail view, quay về list
      if (showDetail) {
        setShowDetail(false);
        setSelectedContributionId(null);
      }

      if (activeTab !== "pending") setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Error rejecting contribution:", error);
      alert("Có lỗi xảy ra khi từ chối bài!");
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromDetail = () => {
    setShowDetail(false);
    setSelectedContributionId(null);
    setSelectedContribution(null);
  };

  return (
    <>
      {/* Main Content */}
      {showDetail && selectedContributionId ? (
        <ContributionDetailSection
          contributionId={selectedContributionId}
          onBack={handleBackFromDetail}
          forStaff={true}
          onApprove={handleApproveFromDetail}
          onReject={handleRejectFromDetail}
        />
      ) : (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Quản Lý Bài Đăng Đóng Góp</h2>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const count = tabCounts[tab.key];
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setPage(1);
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchContributions()}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value={SortBy.IdDesc}>Mới nhất</option>
              <option value={SortBy.IdAsc}>Cũ nhất</option>
              <option value={SortBy.NameAsc}>Tên A-Z</option>
              <option value={SortBy.NameDesc}>Tên Z-A</option>
            </select>
          </div>

          {/* Table */}
          <ContributionTable
            data={contributions}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onView={handleView}
            onAction={handleAction}
            loading={loading}
            activeTabStatus={currentTabStatus}
          />
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmApprove}
        title="Xác nhận duyệt bài"
        message={`Bạn có chắc muốn duyệt bài "${selectedContribution?.title}"?`}
        confirmText="Duyệt"
        cancelText="Hủy"
        type="info"
        loading={loading}
      />

      <RejectDialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={confirmReject}
        loading={loading}
      />
    </>
  );
};

export default ContributionPostManagement;