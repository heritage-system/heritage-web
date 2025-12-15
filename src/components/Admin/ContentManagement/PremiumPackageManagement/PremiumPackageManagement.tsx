import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import PremiumPackageList from "./PremiumPackageList";
import PremiumPackageModal from "./PremiumPackageModal";
import PremiumPackageDetailManagement from "./PremiumPackageDetailManagement";
import { toast } from "react-hot-toast";
import { SortBy } from "../../../../types/enum";

import {
  PremiumPackageResponse,
  PremiumPackageCreateRequest,
  PremiumPackageUpdateRequest,
} from "../../../../types/premiumPackage";

import {
  searchPremiumPackagesAsync,
  createPremiumPackage,
  updatePremiumPackage,
  deletePremiumPackage,
} from "../../../../services/PremiumPackageService";

type ViewMode = "list" | "detail";

const PremiumPackageManagement = () => {
  const [packages, setPackages] = useState<PremiumPackageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PremiumPackageResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy | undefined>(SortBy.DateDesc);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchPremiumPackagesAsync({
        name: searchTerm || undefined,
        sortBy,
        page: currentPage,
        pageSize,
      });

      if (res.code === 200 && res.result) {
        setPackages(res.result.items || []);
        setTotalElements(res.result.totalElements || 0);
        // Nếu backend trả về totalPages thì dùng, không thì tính
        // setTotalPages(res.result.totalPages || Math.ceil(res.result.totalElements / pageSize));
      }
    } catch {
      toast.error("Không thể tải danh sách gói premium");
    setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, pageSize]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const handleCreate = async (data: PremiumPackageCreateRequest) => {
    try {
      setLoading(true);
      const res = await createPremiumPackage(data);
      if (res.code === 200 || res.code === 201) {
        toast.success("Tạo gói premium thành công");
        setIsModalVisible(false);
        setEditingPackage(null);
        loadPackages();
      } else {
        toast.error(res.message || "Tạo thất bại");
      }
    } catch {
      toast.error("Lỗi khi tạo gói premium");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: PremiumPackageUpdateRequest) => {
    try {
      setLoading(true);
      const res = await updatePremiumPackage(data);
      if (res.code === 200) {
        toast.success("Cập nhật gói premium thành công");
        setIsModalVisible(false);
        setEditingPackage(null);
        loadPackages();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch {
      toast.error("Lỗi khi cập nhật gói premium");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const res = await deletePremiumPackage(id);
      if (res.code === 200) {
        toast.success("Xóa gói premium thành công");
        loadPackages();
      } else {
        toast.error(res.message || "Xóa thất bại");
      }
    } catch {
      toast.error("Lỗi khi xóa gói premium");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id: number) => {
    setSelectedPackageId(id);
    setViewMode("detail");
  };

  const handleBackFromDetail = () => {
    setViewMode("list");
    setSelectedPackageId(null);
    loadPackages();
  };

  const handleOpenEditModal = (pkg: PremiumPackageResponse) => {
    setEditingPackage(pkg);
    setIsModalVisible(true);
  };

  if (viewMode === "detail" && selectedPackageId) {
    return (
      <PremiumPackageDetailManagement
        packageId={selectedPackageId}
        onBack={handleBackFromDetail}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Gói Premium</h2>
        <button
          onClick={() => {
            setEditingPackage(null);
            setIsModalVisible(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm"
        >
          + Thêm gói mới
        </button>
      </div>

      {/* SEARCH + SORT + PAGE SIZE - ĐẸP CHUẨN NHƯ CÁC TRANG KHÁC */}
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm tên gói, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       transition-all shadow-sm text-base"
          />
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sắp xếp:</label>
          <select
            value={sortBy || ""}
            onChange={(e) => setSortBy((e.target.value as SortBy) || undefined)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       text-sm font-medium bg-white shadow-sm"
          >
            <option value="">Mặc định</option>
            <option value={SortBy.DateDesc}>Mới nhất</option>
            <option value={SortBy.DateAsc}>Cũ nhất</option>
            <option value={SortBy.NameAsc}>Tên: A to Z</option>
            <option value={SortBy.NameDesc}>Tên: Z to A</option>
          </select>
        </div>

        {/* Hiển thị số mục */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       text-sm font-medium bg-white shadow-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n} / trang</option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh sách gói */}
      <PremiumPackageList
    packages={packages}
    loading={loading}
    onView={handleViewDetail}
    onEdit={handleOpenEditModal}
    onDelete={handleDelete}
    currentPage={currentPage}
    pageSize={pageSize}
    total={totalElements}
    onPageChange={setCurrentPage}
  />

      {/* Modal tạo/sửa */}
      <PremiumPackageModal
        visible={isModalVisible}
        editingPackage={editingPackage}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onClose={() => {
          setIsModalVisible(false);
          setEditingPackage(null);
        }}
        loading={loading}
      />
    </div>
  );
};

export default PremiumPackageManagement;