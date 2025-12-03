import { useState, useEffect, useCallback } from "react";
import { Button, Spin, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import PremiumPackageList from "./PremiumPackageList";
import PremiumPackageModal from "./PremiumPackageModal";
import PremiumPackageDetailManagement from "./PremiumPackageDetailManagement";
import { toast } from "react-hot-toast";
import { SortBy } from "../../../../types/enum";

import {
  PremiumPackageResponse,
  PremiumPackageCreateRequest,
  PremiumPackageUpdateRequest
} from "../../../../types/premiumPackage";

import {
  searchPremiumPackagesAsync,
  createPremiumPackage,
  updatePremiumPackage,
  deletePremiumPackage
} from "../../../../services/PremiumPackageService";

import { TablePaginationConfig } from "antd/es/table";

type ViewMode = "list" | "detail";

const PremiumPackageManagement = () => {
  const [packages, setPackages] = useState<PremiumPackageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PremiumPackageResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
 const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const loadPackages = useCallback(async (
    page?: number,
    term?: string,
  ) => {
    const currentPage = page ?? 1;
    const searchTermValue = term ?? searchTerm;
    
    setLoading(true);
    try {
      const res = await searchPremiumPackagesAsync({
        name: searchTermValue || undefined,
        page: currentPage,
        sortBy: sortBy,
      });

      if (res.code === 200 && res.result) {
        setPackages(res.result.items || []);
        setPagination({
          current: res.result.currentPages,
          pageSize: res.result.pageSizes,
          total: res.result.totalElements,
        });
      } else {
        toast.error(res.message || "Lỗi khi tải dữ liệu");
      }
    } catch {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCreate = async (data: PremiumPackageCreateRequest) => {
    try {
      setLoading(true);
      const res = await createPremiumPackage(data);
      if (res.code === 200 || res.code === 201) {
        toast.success("Tạo gói premium thành công");
        setIsModalVisible(false);
        setEditingPackage(null);
        await loadPackages(1);
      } else {
        toast.error(res.message || "Tạo gói premium thất bại");
      }
    } catch (error: any) {
      console.error("Error creating package:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi tạo gói premium");
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
        
        // Refresh based on current view mode
        if (viewMode === "detail" && selectedPackageId) {
          // If in detail view, refresh detail view will be handled by PremiumPackageDetailManagement
          // Just refresh the list in background - use current pagination state
          const currentPage = pagination.current || 1;
          await loadPackages(currentPage);
        } else {
          const currentPage = pagination.current || 1;
          await loadPackages(currentPage);
        }
      } else {
        toast.error(res.message || "Cập nhật gói premium thất bại");
      }
    } catch (error: any) {
      console.error("Error updating package:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi cập nhật gói premium");
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
        const currentPage = pagination.current || 1;
        await loadPackages(currentPage);
      } else {
        toast.error(res.message || "Xóa gói premium thất bại");
      }
    } catch (error: any) {
      console.error("Error deleting package:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi xóa gói premium");
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
    const currentPage = pagination.current || 1;
    loadPackages(currentPage);
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

  const PremiumListAny = PremiumPackageList as any;

  return (
    <Spin spinning={loading}>
      <h2 className="text-2xl font-bold mb-4">Quản lý Gói Premium</h2>
      <div className="flex items-center justify-between mb-4 gap-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm theo tên..."
          value={searchTerm}
          onChange={handleSearchChange}
          prefix={<SearchOutlined className="text-gray-500 text-lg" />}
          className="border rounded-lg px-3 py-2.5 w-64 text-base"
          style={{ height: 44 }}
        />

        <Select
          placeholder={
            <span style={{ color: "black", fontWeight: 500, fontSize: 16 }}>
              Sắp xếp
            </span>
          }
          value={sortBy}
          onChange={(value: SortBy) => setSortBy(value)}
          className="w-64"
          style={{ height: 44, fontSize: 16 }}
        >
          <Select.Option value={SortBy.NameAsc}>Tên A → Z</Select.Option>
          <Select.Option value={SortBy.NameDesc}>Tên Z → A</Select.Option>
          <Select.Option value={SortBy.DateAsc}>Ngày cũ → mới</Select.Option>
          <Select.Option value={SortBy.DateDesc}>Ngày mới → cũ</Select.Option>
        </Select>
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingPackage(null);
          setIsModalVisible(true);
        }}
        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg h-11"
      >
        Thêm gói
      </Button>
    </div>


      <PremiumListAny
        packages={packages}
        onDelete={handleDelete}
        onView={handleViewDetail}
        onEdit={handleOpenEditModal}
        onPageChange={(page: number) => loadPackages(page)}
        loading={loading}
      />

      <PremiumPackageModal
        visible={isModalVisible}
        editingPackage={editingPackage}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onClose={() => setIsModalVisible(false)}
        loading={loading}
      />
    </Spin>
  );
};

export default PremiumPackageManagement;
