import React, { useEffect, useState } from "react";
import {
  FileText,
  Trophy,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Eye,
  Crown,
  MessageSquare,
  Image as ImageIcon,
  Upload,
  BookmarkPlus,
  Search,
  CircleSlash,
  RotateCcw 
} from "lucide-react";

import { getListContributionOverview, disableContributionStatus, reactiveContributionStatus } from "../../../services/contributionService";
import {
  ContributionOverviewItemListResponse,
  ContributionOverviewSearchRequest,
} from "../../../types/contribution";
import {
  ContributionStatus
} from "../../../types/enum";
import SectionLoader from "../../Layouts/LoadingLayouts/SectionLoader";
import Pagination from "../../Layouts/Pagination";
import { toast } from "react-hot-toast";

interface ContributionsSectionProps {
  onMenuChange: (key: string) => void;
  onSelectContribution: (id: number | null) => void;
}

const TABS: { key: ContributionStatus | "ALL"; label: string; icon: any }[] = [
  { key: "ALL", label: "Tất cả", icon: FileText },
  { key: ContributionStatus.PENDING, label: "Chờ duyệt", icon: Clock },
  { key: ContributionStatus.APPROVED, label: "Đã duyệt", icon: CheckCircle },
  { key: ContributionStatus.REJECTED, label: "Từ chối", icon: XCircle },
  { key: ContributionStatus.DISABLE, label: "Vô hiệu hóa", icon: CircleSlash },
];

const ContributionsSection: React.FC<ContributionsSectionProps> = ({
  onMenuChange,
  onSelectContribution,
}) => {
  const [contributions, setContributions] = useState<
    ContributionOverviewItemListResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [total, setTotal] = useState<number>(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Tab status
  const [activeTab, setActiveTab] = useState<ContributionStatus | "ALL">("ALL");

  // Fetch API
  const fetchContributions = async (
    searchKeyword?: string,
    isInitial = false,
    page: number = 1,
    status?: ContributionStatus | "ALL"
  ) => {
    try {
      setLoading(true);
      const res = await getListContributionOverview({
        page,
        pageSize,
        keyword: searchKeyword || undefined,
        contributionStatus: status && status !== "ALL" ? status : undefined,
      } as ContributionOverviewSearchRequest);

      if (res.code === 200 && res.result) {
        setContributions(res.result.items);

        if (isInitial) {
          setTotal(res.result.totalElements || res.result.items.length);
        }

        setTotalPages(res.result.totalPages);
      }
    } catch (err) {
      console.error("Error loading contributions:", err);
      toast.error("Không thể tải danh sách đóng góp");
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu
  useEffect(() => {
    fetchContributions(undefined, true, 1, activeTab);
  }, []);

  // Khi search keyword thay đổi
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchContributions(keyword, false, 1, activeTab);
    }, 500);

    return () => clearTimeout(handler);
  }, [keyword, activeTab]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchContributions(keyword, false, page, activeTab);
  };

  const renderContributionItem = (
    item: ContributionOverviewItemListResponse,
    idx: number
  ) => {
    const getStatusConfig = () => {
      switch (item.status) {
        case "APPROVED":
          return {
            bg: "bg-green-100",
            text: "text-green-700",
            icon: CheckCircle,
            label: "Đã duyệt",
          };
        case "PENDING":
          return {
            bg: "bg-amber-100",
            text: "text-amber-700",
            icon: Clock,
            label: "Chờ duyệt",
          };
        case "REJECTED":
          return {
            bg: "bg-red-100",
            text: "text-red-700",
            icon: XCircle,
            label: "Từ chối",
          };
        case "DISABLE":
          return {
            bg: "bg-red-100",
            text: "text-red-900",
            icon: CircleSlash,
            label: "Vô hiệu hóa",
          };
        default:
          return {
            bg: "bg-gray-100",
            text: "text-gray-700",
            icon: FileText,
            label: item.status,
          };
      }
    };

    const canDisable = (approvedAt?: string) => {
      if (!approvedAt) return false;
      const approvedDate = new Date(approvedAt);
      const now = new Date();

      const diff = now.getTime() - approvedDate.getTime();
      const diffDays = diff / (1000 * 60 * 60 * 24);

      return diffDays <= 3; // còn trong 3 ngày
    };  

    const onDisableContribution = async (item: ContributionOverviewItemListResponse) => {
      if (item.status !== "APPROVED") {
        toast.error("Chỉ có thể vô hiệu hóa nội dung đã duyệt");
        return;
      }

      // if (!canDisable(item.approvedAt)) {
      //   toast.error("Đã quá hạn 3 ngày vô hiệu hóa nội dung");
      //   return;
      // }

      try {      
        var result =  await disableContributionStatus(item.id);

        if(result.code === 200 || result.code === 201) {
          toast.success("Đã vô hiệu hóa nội dung");
        }
        else {
          toast.error("Không thể vô hiệu hóa nội dung");
        }
        fetchContributions(keyword, false, currentPage, activeTab);
      } catch (err) {
        toast.error("Không thể vô hiệu hóa nội dung");
        console.error(err);
      }
    };

    const onReactiveContribution = async (item: ContributionOverviewItemListResponse) => {
      if (item.status !== "DISABLE") {
        toast.error("Chỉ có thể vô hiệu hóa nội dung đã duyệt");
        return;
      }
      try {      
        var result =  await reactiveContributionStatus(item.id);

        if(result.code === 200 || result.code === 201) {
          toast.success("Tái kích hoạt thành công nội dung");
        }
        else {
          toast.error("Không thể tái kích hoạt nội dung");
        }
        fetchContributions(keyword, false, currentPage, activeTab);
      } catch (err) {
        toast.error("Không thể tái kích hoạt nội dung");
        console.error(err);
      }
    };

    const status = getStatusConfig();
    const StatusIcon = status.icon;

    return (
      <div
        key={idx}
        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1"
      >
        <div className="flex items-center justify-between">
          {/* Thumbnail */}
          <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
            {item.mediaUrl ? (
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-gray-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 ml-6">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
              {item.isPremium && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center">
                  <Crown className="w-4 h-4 mr-1" />
                  Premium
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Status */}
              <span
                className={`px-3 py-1 ${status.bg} ${status.text} rounded-full text-xs font-semibold flex items-center`}
              >
                <StatusIcon className="w-4 h-4 mr-2" />
                {status.label}
              </span>

              {/* Views */}
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {item.view}
              </span>

              {/* Comments */}
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                {item.comments}
              </span>

              {/* Saves */}
              <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium flex items-center">
                <BookmarkPlus className="w-4 h-4 mr-1" />
                {item.saves}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 ml-4">
            {item.status === "PENDING" && (<button onClick={() => (window.location.href = `contribution-form/${item.id}`)} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </button>)}
            {item.status === "APPROVED"  && (
              <button
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center"
                onClick={() => onDisableContribution(item)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Vô hiệu hóa               
              </button>
            )}
            {item.status === "DISABLE" && (
              <button
                className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center"
                onClick={() => onReactiveContribution(item)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Kích hoạt lại
              </button>
            )}
            <button
              onClick={() => onSelectContribution(item.id)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 
                        text-white rounded-lg text-sm font-semibold flex items-center shadow hover:opacity-90"
            >
              <Eye className="w-4 h-4 mr-2" />
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-3">
            <Upload className="w-9 h-9 text-yellow-700" />
            Đóng góp đã gửi
          </h2>
          <p className="text-gray-600 text-base">
            Danh sách các đóng góp nội dung bạn đã gửi
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Total contributions card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-amber-200 shadow">
            <div className="text-2xl font-bold text-amber-700">{total}</div>
            <div className="text-sm text-amber-600 font-medium">Tổng đóng góp</div>
          </div>
          <button
            onClick={() => (window.location.href = `contribution-form`)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white rounded-2xl hover:from-yellow-700 hover:to-amber-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Thêm đóng góp
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
                fetchContributions(keyword, false, 1, tab.key);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-yellow-600 to-red-700 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="mb-6 flex items-center gap-3 bg-white rounded-2xl shadow px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm đóng góp..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 outline-none px-2 py-2 text-sm text-gray-700 rounded-lg"
        />
      </div>

      {/* List */}
      <div className="space-y-6">
        {loading ? (
          <SectionLoader show={loading} text="Đang tải dữ liệu..." />
        ) : contributions.length === 0 ? (
          <div className="py-10 text-center text-gray-500">Không có đóng góp nào</div>
        ) : (
          contributions.map(renderContributionItem)
        )}
      </div>

      {/* Pagination */}
      {!loading && contributions.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={pageSize}
            totalItems={total}
          />
        </div>
      )}
    </div>
  );
};

export default ContributionsSection;
