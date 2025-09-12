import React, { useState, useMemo, useEffect } from "react";
import {
  Edit,
  Eye,
  Plus,
  Trash2,
  Upload,
  Landmark,
  Clock,
  Archive,
  BarChart3,
  X,
} from "lucide-react";
import Pagination from "../../Layouts/Pagination";
import SearchFilter from "../SearchFilter";
import { fetchHeritages, deleteHeritage } from "../../../services/heritageService";
import { fetchTags } from "../../../services/tagService";
import { fetchCategories } from "../../../services/categoryService";
import { HeritageAdmin, TableColumn, TableProps } from "../../../types/heritage";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Table component
function DataTable<T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  loading = false,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 mb-2 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- MAIN COMPONENT ----------------
const HeritageManagement: React.FC = () => {
  const [heritages, setHeritages] = useState<HeritageAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);

  const [confirmDelete, setConfirmDelete] = useState<HeritageAdmin | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const heritageResult = await fetchHeritages({
          page: currentPage,
          pageSize: itemsPerPage,
          keyword: searchTerm,
          categoryId: selectedCategory,
          tagId: selectedTag,
        });

        setHeritages(heritageResult.result?.items || []);
        setTotalPages(heritageResult.result?.totalPages || 1);
        setTotalElements(heritageResult.result?.totalElements || 0);

        const categoryResponse = await fetchCategories();
        const catList = categoryResponse.result || [];
        setCategories([
          { label: "Tất cả danh mục", value: "" },
          ...catList.map((c) => ({
            label: c.name,
            value: String(c.id),
          })),
        ]);

        const tagResponse = await fetchTags();
        const tagList = tagResponse.result || [];
        setTags([
          { label: "Tất cả Tag", value: "" },
          ...tagList.map((t) => ({
            label: t.name,
            value: String(t.id),
          })),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, selectedTag]);

  const stats = useMemo(() => {
    return {
      total: totalElements,
      active: 0,
      pending: 0,
      archived: 0,
      views: 0,
    };
  }, [totalElements]);

  const columns: TableColumn<HeritageAdmin>[] = [
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
      render: (_: any, item: HeritageAdmin) =>
        item.tags && item.tags.length > 0 ? (
          <div>
            {item.tags.map((tag: any) => (
              <div key={tag.id}>{tag.name}</div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 italic">Không có tag</span>
        ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      key: "description",
      label: "Mô tả",
      render: (desc: string) => (
        <span title={desc}>{desc.slice(0, 30)}...</span>
      ),
    },
    {
      key: "isFeatured",
      label: "Nổi bật",
      render: (val: boolean) => (val ? "Có" : "Không"),
    },
  ];

  const handleDeleteHeritage = (heritage: HeritageAdmin) => {
    setConfirmDelete(heritage);
  };

  const confirmDeleteHeritage = async () => {
    if (!confirmDelete) return;
    try {
      await deleteHeritage(confirmDelete.id);
      toast.success("Xoá di sản thành công!");
      const heritageResult = await fetchHeritages({
        page: currentPage,
        pageSize: itemsPerPage,
        keyword: searchTerm,
        categoryId: selectedCategory,
        tagId: selectedTag,
      });
      setHeritages(heritageResult.result?.items || []);
      setTotalPages(heritageResult.result?.totalPages || 1);
      setTotalElements(heritageResult.result?.totalElements || 0);
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        toast.error("Bạn không có quyền xoá di sản này!");
      } else if (error?.response?.status === 404) {
        toast.error("Di sản không tồn tại!");
      } else {
        toast.error(error.message || "Xoá di sản thất bại");
      }
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý di sản</h2>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2">
            <Upload size={16} />
            Import
          </button>
          <button
            onClick={() => navigate("/admin/create-heritage")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Thêm di sản
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        filters={[
          { label: "Lọc theo danh mục", value: "category", options: categories || [] },
          { label: "Lọc theo Tag", value: "tag", options: tags || [] },
        ]}
        onFilterChange={(key, value) => {
          if (key === "category") {
            setSelectedCategory(value);
            setCurrentPage(1);
          }
          if (key === "tag") {
            setSelectedTag(value);
            setCurrentPage(1);
          }
        }}
      />

      <DataTable
        data={heritages}
        columns={columns}
        onEdit={(heritage) => navigate(`/admin/heritage/edit/${heritage.id}`)}
        onDelete={handleDeleteHeritage}
        onView={(heritage) => navigate(`/admin/heritage/${heritage.id}`)}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalElements}
      />

      {/* Modal xác nhận xoá */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-center">
              Xác nhận xoá di sản
            </h3>
            <p className="mb-6 text-center">
              Bạn có chắc muốn xoá di sản <b>{confirmDelete.name}</b>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDeleteHeritage}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Xoá
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default HeritageManagement;
