import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Download,
  Landmark,
  Clock,
  Archive,
} from "lucide-react";
import Pagination from "../../../Layouts/Pagination";
import SearchFilter from "./SearchFilter";
import DataTable from "./DataTable";
import {
  getAllHeritages,
  deleteHeritage,
  exportHeritages,
} from "../../../../services/heritageService";
import { fetchTags } from "../../../../services/tagService";
import { fetchCategories } from "../../../../services/categoryService";
import {
  HeritageResponse,
  TableColumn,
} from "../../../../types/heritage";
import { SortBy } from "../../../../types/enum";
import { toast } from "react-hot-toast";
import HeritageFormInline from "./HeritageFormInline";
import HeritageFormUpdate from "./HeritageFormUpdate";
import HeritageDetail from "./HeritageDetail";

const HeritageManagement: React.FC = () => {
  const [heritages, setHeritages] = useState<HeritageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [exportMode, setExportMode] = useState<"current" | "all">("current");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);

  const [confirmDelete, setConfirmDelete] = useState<HeritageResponse | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "update" | "detail">("list");
  const [selectedHeritageId, setSelectedHeritageId] = useState<number | null>(null);

  const loadHeritages = async () => {
    setLoading(true);
    try {
      const heritageResult = await getAllHeritages({
        page: currentPage,
        pageSize: itemsPerPage,
        keyword: searchTerm || undefined,
        categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        tagIds: selectedTags.length > 0 ? selectedTags.map(Number) : undefined,
        sortBy: sortBy ? (sortBy as SortBy) : undefined,
      });

      setHeritages(heritageResult.result?.items || []);
      setTotalPages(heritageResult.result?.totalPages || 1);
      setTotalElements(heritageResult.result?.totalElements || 0);
    } catch (error) {
      console.error("Error fetching heritages:", error);
      toast.error("Không thể tải danh sách di sản");
    } finally {
      setLoading(false);
    }
  };

  // Handle Export
  const handleExport = async (mode: "current" | "all") => {
    setExporting(true);
    try {
      await exportHeritages({
        page: mode === "current" ? currentPage : 0,
        pageSize: itemsPerPage,
        keyword: searchTerm || undefined,
        categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        tagIds: selectedTags.length ? selectedTags.map(Number) : undefined,
        sortBy: sortBy ? (sortBy as SortBy) : undefined,
      });

      toast.success("Xuất dữ liệu thành công!");
    } catch (error: any) {
      toast.error(error.message || "Xuất dữ liệu thất bại");
    } finally {
      setExporting(false);
    }
  };



  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const categoryResponse = await fetchCategories();
        const tagResponse = await fetchTags();
        setCategories([
          { label: "Tất cả danh mục", value: "" },
          ...(categoryResponse.result || []).map((c) => ({
            label: c.name,
            value: String(c.id),
          })),
        ]);
        setTags([
          { label: "Tất cả Tag", value: "" },
          ...(tagResponse.result || []).map((t) => ({
            label: t.name,
            value: String(t.id),
          })),
        ]);
      } catch (error) {
        console.error("Error fetching filters:", error);
        toast.error("Không thể tải danh mục và tag");
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (mode === "list") {
      loadHeritages();
    }
  }, [currentPage, searchTerm, selectedCategory, selectedTags, sortBy, mode]);

  const stats = useMemo(() => {
    return {
      total: totalElements,
      active: 0,
      pending: 0,
      archived: 0,
    };
  }, [totalElements]);

  const columns: TableColumn<HeritageResponse>[] = [
    {
      key: "id",
      label: "ID",
      render: (value: number) => <span className="font-mono">{value}</span>,
    },
    {
      key: "name",
      label: "Tên di sản",
      render: (value: string) =>
        value.length > 30 ? (
          <span title={value}>{value.slice(0, 30)}...</span>
        ) : (
          value
        ),
    },
    { key: "categoryName", label: "Danh mục" },
    {
      key: "tags",
      label: "Tag",
      render: (_: any, item: HeritageResponse) => {
        if (!item.tags?.length) {
          return <span className="text-gray-400 italic">Không có tag</span>;
        }
        const displayTags = item.tags.slice(0, 2);
        const remainingCount = item.tags.length - 2;
        return (
          <div className="flex flex-wrap gap-1 items-center">
            {displayTags.map((tag: any) => (
              <span
                key={`heritage-${item.id}-tag-${tag.id}`}
                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {tag.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span
                className="text-xs text-gray-500"
                title={item.tags.slice(2).map((t: any) => t.name).join(", ")}
              >
                +{remainingCount}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  const handleDeleteHeritage = (heritage: HeritageResponse) => {
    setConfirmDelete(heritage);
  };

  const confirmDeleteHeritage = async () => {
    if (!confirmDelete) return;
    try {
      await deleteHeritage(confirmDelete.id);
      toast.success("Xoá di sản thành công!");
      await loadHeritages();
    } catch (error: any) {
      toast.error(error.message || "Xoá di sản thất bại");
    } finally {
      setConfirmDelete(null);
    }
  };

  if (mode === "create") {
    return (
      <HeritageFormInline
        onCancel={() => setMode("list")}
        onSuccess={() => {
          setMode("list");
          loadHeritages();
        }}
      />
    );
  }

  if (mode === "update" && selectedHeritageId) {
    return (
      <HeritageFormUpdate
        heritageId={selectedHeritageId}
        onCancel={() => setMode("list")}
        onSuccess={() => {
          setMode("list");
          loadHeritages();
        }}
      />
    );
  }

  if (mode === "detail" && selectedHeritageId) {
    return (
      <HeritageDetail
        heritageId={selectedHeritageId}
        onBack={() => setMode("list")}
        onEdit={() => setMode("update")}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Di Sản</h2>
        <div className="flex gap-2">
          <div className="relative inline-block text-left">
  <div>
    <button
      onClick={() => setShowExportMenu((prev) => !prev)}
      disabled={exporting || loading}
      className="bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 flex items-center gap-2 shadow transition active:scale-[0.98] disabled:opacity-50"
    >
      <Download size={16} />
      {exporting ? "Đang xuất..." : "Xuất dữ liệu"}
    </button>
  </div>

  {showExportMenu && (
    <div
      className="absolute right-0 mt-2 w-52 origin-top-right bg-white 
                 border border-gray-200 rounded-md shadow-lg z-50"
    >
      <div className="py-1">
        <button
          onClick={() => {
            setShowExportMenu(false);
            handleExport("current");
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M4 4h16v4H4zM4 12h10v8H4z" />
          </svg>
          Chỉ trang hiện tại
        </button>

        <button
          onClick={() => {
            setShowExportMenu(false);
            handleExport("all");
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M4 4h16v16H4z" />
          </svg>
          Tất cả dữ liệu
        </button>
      </div>
    </div>
  )}
</div>


          <button
            onClick={() => setMode("create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Plus size={16} />
            Thêm di sản
          </button>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <Landmark className="text-blue-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Tổng di sản</p>
            <p className="text-xl font-semibold">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <Landmark className="text-green-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Hoạt động</p>
            <p className="text-xl font-semibold">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <Clock className="text-yellow-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Chờ duyệt</p>
            <p className="text-xl font-semibold">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <Archive className="text-gray-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Lưu trữ</p>
            <p className="text-xl font-semibold">{stats.archived}</p>
          </div>
        </div>
      </div> */}

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        filters={[
          {
            label: "Lọc theo danh mục",
            value: "category",
            options: categories || [],
          },
        ]}
        onFilterChange={(key, value) => {
          if (key === "category") {
            setSelectedCategory(value);
            setCurrentPage(1);
          }
        }}
        selectedTags={selectedTags}
        onTagChange={(tags) => {
          setSelectedTags(tags);
          setCurrentPage(1);
        }}
        tags={tags}
        sortBy={sortBy}
        onSortChange={(value) => {
          setSortBy(value);
          setCurrentPage(1);
        }}
      />

      <DataTable
        data={heritages}
        columns={columns}
        onEdit={(heritage) => {
          setSelectedHeritageId(heritage.id);
          setMode("update");
        }}
        onDelete={handleDeleteHeritage}
        onView={(heritage) => {
          setSelectedHeritageId(heritage.id);
          setMode("detail");
        }}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalElements}
      />

      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-center">
              Xác nhận xoá di sản
            </h3>
            <p className="mb-6 text-center">
              Bạn có chắc muốn xoá <b>{confirmDelete.name}</b>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDeleteHeritage}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Xoá
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeritageManagement;