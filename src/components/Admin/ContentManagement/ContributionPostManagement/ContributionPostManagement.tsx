import React, { useState, useEffect, useCallback } from "react";
import { FileText, Clock, XCircle, CheckCircle, Search, CircleSlash } from "lucide-react";
import {
  getListContributionsOverviewForStaff,
  getContributionOverviewForStaff,
  approveContributionAcceptance,
  rejectContributionAcceptance,
} from "../../../../services/contributionAcceptanceService";
import {
  disableContributionStatusAdmin,
  reactiveContributionStatusAdmin
} from "../../../../services/contributionService";
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
  { key: "disable" as const, label: "Vô hiệu hóa", icon: CircleSlash, status: ContributionStatus.DISABLE },
  { key: "all" as const, label: "Tất cả", icon: FileText, status: undefined },
];

interface TabCounts {
  pending: number;
  approved: number;
  rejected: number;
  disable: number;
  all: number;
}

const ContributionPostManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof TabCounts>("pending");
  const [tabCounts, setTabCounts] = useState<TabCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    disable: 0,
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
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showReactiveConfirm, setReactiveShowConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<ContributionOverviewItemListResponse | null>(null);
  const [selectedContributionId, setSelectedContributionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const currentTabStatus = TABS.find((tab) => tab.key === activeTab)?.status;

  // Fetch tab counts
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

      const [pending, approved, rejected, disable, all] = await Promise.all([
        fetchCount(ContributionStatus.PENDING),
        fetchCount(ContributionStatus.APPROVED),
        fetchCount(ContributionStatus.REJECTED),
        fetchCount(ContributionStatus.DISABLE),
        fetchCount(undefined),
      ]);

      setTabCounts({ pending, approved, rejected, disable, all });
    } catch (error) {
      console.error("Error fetching tab counts:", error);
    }
  }, []);

  // Fetch contributions
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
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, currentTabStatus, sortBy, page, pageSize]);

  const loadDetail = useCallback(async (acceptanceId: number) => {
    try {
      const response = await getContributionOverviewForStaff(acceptanceId);
      if (response?.result) {
        setSelectedContribution(response.result as any);
      }
    } catch (error) {
      console.error("Error reloading contribution detail:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllTabCounts();
  }, [fetchAllTabCounts, refreshTrigger]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const handleView = (item: ContributionOverviewItemListResponse) => {
    setSelectedContribution(item);
    setSelectedContributionId(item.id);
    setShowDetail(true);
  };

  const handleAction = (item: ContributionOverviewItemListResponse, action: "approve" | "reject" | "disable" | "reactive") => {
    setSelectedContribution(item);
    if (action === "approve") setShowConfirm(true);
    else if (action === "reject") setShowRejectDialog(true);
    else if (action === "disable") setShowDisableConfirm(true);
    else if (action === "reactive") setReactiveShowConfirm(true);
  };

  const handleApproveFromDetail = () => {
    if (selectedContribution) setShowConfirm(true);
  };

  const handleRejectFromDetail = () => {
    if (selectedContribution) setShowRejectDialog(true);
  };

  const confirmApprove = async () => {
    if (!selectedContribution) return;
    setLoading(true);
    try {
      await approveContributionAcceptance(selectedContribution.acceptanceId);
      setContributions((prev) => prev.filter((i) => i.acceptanceId !== selectedContribution.acceptanceId));

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
      if (activeTab !== "pending") setRefreshTrigger((p) => p + 1);
    } catch {
      alert("Có lỗi khi duyệt bài!");
    } finally {
      setLoading(false);
    }
  };

  const confirmDisable = async () => {
    if (!selectedContribution) return;
    setLoading(true);
    try {
      await disableContributionStatusAdmin(selectedContribution.id);
      setContributions((prev) => prev.filter((i) => i.acceptanceId !== selectedContribution.acceptanceId));

      setTabCounts((prev) => ({
        ...prev,
        approved: Math.max(prev.approved - 1, 0),
        disable: prev.disable + 1,
      }));

      setShowDisableConfirm(false);
      if (showDetail) {
        setShowDetail(false);
        setSelectedContributionId(null);
      }
      setSelectedContribution(null);
      if (activeTab !== "approved") setRefreshTrigger((p) => p + 1);
    } catch {
      alert("Có lỗi khi vô hiệu bài!");
    } finally {
      setLoading(false);
    }
  };
  const confirmReactive = async () => {
    if (!selectedContribution) return;
    setLoading(true);
    try {
      await reactiveContributionStatusAdmin(selectedContribution.id);
      setContributions((prev) => prev.filter((i) => i.acceptanceId !== selectedContribution.acceptanceId));

      setTabCounts((prev) => ({
        ...prev,
        disable: Math.max(prev.disable - 1, 0),
        approved: prev.approved + 1,
      }));

      setReactiveShowConfirm(false);
      if (showDetail) {
        setShowDetail(false);
        setSelectedContributionId(null);
      }
      setSelectedContribution(null);
      if (activeTab !== "disable") setRefreshTrigger((p) => p + 1);
    } catch {
      alert("Có lỗi khi tái kích hoạt bài!");
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

      const updated = await getContributionOverviewForStaff(selectedContribution.acceptanceId);
      if (updated?.result) setSelectedContribution(updated.result as any);

      setContributions((prev) =>
        prev.filter((i) => i.acceptanceId !== selectedContribution.acceptanceId)
      );

      setTabCounts((prev) => ({
        ...prev,
        pending: Math.max(prev.pending - 1, 0),
        rejected: prev.rejected + 1,
      }));

      setShowRejectDialog(false);
      if (showDetail) {
        setShowDetail(false);
        setSelectedContributionId(null);
      }
      if (activeTab !== "pending") setRefreshTrigger((p) => p + 1);
    } catch {
      alert("Có lỗi khi từ chối bài!");
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
      {/* Detail View */}
      {showDetail && selectedContributionId ? (
        <ContributionDetailSection
          contributionId={selectedContributionId}
          onBack={handleBackFromDetail}
          forStaff={true}
          onApprove={handleApproveFromDetail}
          onReject={handleRejectFromDetail}
        />
      ) : (
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Bài Đăng Đóng Góp</h2>

          {/* Tabs */}
          <div className="border-b border-gray-200">
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
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                    <span
                      className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* SEARCH + SORT + PAGE SIZE - ĐẸP CHUẨN NHƯ CATEGORY/TAG */}
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề, người gửi, email..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sắp xếp:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white shadow-sm"
              >
                <option value={SortBy.DateDesc}>Mới nhất</option>
                <option value={SortBy.DateAsc}>Cũ nhất</option>
                <option value={SortBy.NameAsc}>Tên: A to Z</option>
                <option value={SortBy.NameDesc}>Tên: Z to A</option>
                <option value={SortBy.IdAsc}>ID tăng dần</option>
                <option value={SortBy.IdDesc}>ID giảm dần</option>
              </select>
            </div>

            {/* Số mục / trang */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white shadow-sm"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / trang
                  </option>
                ))}
              </select>
            </div>
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

      {/* Dialogs */}
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

      {/* Dialogs */}
      <ConfirmDialog
        open={showDisableConfirm}
        onClose={() => setShowDisableConfirm(false)}
        onConfirm={confirmDisable}
        title="Xác nhận vô hiệu hóa"
        message={`Bạn có chắc muốn vô hiệu hóa bài "${selectedContribution?.title}"?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        type="info"
        loading={loading}
      />

      <ConfirmDialog
        open={showReactiveConfirm}
        onClose={() => setReactiveShowConfirm(false)}
        onConfirm={confirmReactive}
        title="Xác nhận tái kích hoạt"
        message={`Bạn có chắc muốn tái kích hoạt bài "${selectedContribution?.title}"?`}
        confirmText="Xác nhận"
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