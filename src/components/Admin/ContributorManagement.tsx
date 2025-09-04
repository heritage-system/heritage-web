import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Edit, Eye, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  searchContributors,
  deleteContributor,
  createContributor,
  updateContributor,
  getContributorDetail,
} from "../../services/contributorService";
import {
  ContributorSearchResponse,
  ContributorCreateRequest,
  ContributorUpdateRequest,
  ContributorResponse,
} from "../../types/contributor";
import { ContributorStatus } from "../../types/enum";
import Pagination from "../Layouts/Pagination";

const ContributorManagement: React.FC = () => {
  const [contributors, setContributors] = useState<ContributorSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(1);

  // Modal state
  const [selectedContributor, setSelectedContributor] = useState<ContributorResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ContributorCreateRequest | ContributorUpdateRequest>({
    userEmail: "",
    bio: "",
    expertise: "",
    documentsUrl: "",
    verified: true,
    status: ContributorStatus.APPLIED,
  });

  // 🔹 Fetch Contributors
  const loadContributors = async () => {
    setLoading(true);
    try {
      const res = await searchContributors({
        keyword: searchTerm,
        page: currentPage,
        pageSize: itemsPerPage,
      });

      if (res.code === 200 && res.result) {
        setContributors(res.result.items);
        setTotalPages(res.result.totalPages);
      } else {
        setContributors([]);
        setTotalPages(1);
      }
    } catch {
      toast.error("Không thể tải dữ liệu contributor");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadContributors();
  }, [searchTerm, currentPage, itemsPerPage]);

  // Handlers
  const handleAdd = () => {
    setSelectedContributor(null);
    setFormData({
      userEmail: "",
      bio: "",
      expertise: "",
      documentsUrl: "",
      verified: true,
      status: ContributorStatus.APPLIED,
    });
    setShowForm(true);
  };

  const handleEdit = async (item: ContributorSearchResponse) => {
    try {
      const res = await getContributorDetail(item.id);
      if (res.code === 200 && res.result) {
        setSelectedContributor(res.result);
        setFormData(res.result);
        setShowForm(true);
      }
    } catch {
      toast.error("Không thể tải chi tiết contributor");
    }
  };

  const handleView = async (item: ContributorSearchResponse) => {
    try {
      const res = await getContributorDetail(item.id);
      if (res.code === 200 && res.result) {
        setSelectedContributor(res.result);
        setShowView(true);
      }
    } catch {
      toast.error("Không thể tải chi tiết contributor");
    }
  };

  const handleDelete = (item: ContributorSearchResponse) => {
    setSelectedContributor(item as unknown as ContributorResponse);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedContributor) return;
    try {
      const res = await deleteContributor(selectedContributor.id);
      if (res.code === 200) {
        toast.success("Xóa contributor thành công!");
        await loadContributors();
      } else {
        toast.error(res.message || "Xóa contributor thất bại!");
      }
    } catch {
      toast.error("Xóa contributor thất bại. Vui lòng thử lại!");
    }
    setShowConfirmDelete(false);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveContributor = async (data: ContributorCreateRequest | ContributorUpdateRequest) => {
    try {
      if (selectedContributor) {
        const res = await updateContributor(selectedContributor.id, data as ContributorUpdateRequest);
        if (res.code === 200) toast.success("Cập nhật contributor thành công!");
        else toast.error(res.message || "Cập nhật thất bại!");
      } else {
        const res = await createContributor(data as ContributorCreateRequest);
        if (res.code === 200) toast.success("Thêm contributor thành công!");
        else toast.error(res.message || "Thêm contributor thất bại!");
      }
      await loadContributors();
      setShowForm(false);
    } catch {
      toast.error("Thao tác thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý Contributor</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Thêm contributor
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm contributor..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-md w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Tên Contributor</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Cập nhật</th>
              <th className="px-6 py-3 text-left">Số lượng di tích</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">Đang tải...</td>
              </tr>
            ) : contributors.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">Không có dữ liệu</td>
              </tr>
            ) : (
              contributors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{c.id}</td>
                  <td className="px-6 py-4">{c.userFullName}</td>
                  <td className="px-6 py-4">{c.userEmail}</td>
                  <td className="px-6 py-4">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "-"}</td>
                  <td className="px-6 py-4">{c.count ?? 0}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleView(c)} className="text-blue-600 hover:text-blue-900"><Eye size={16} /></button>
                    <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-900"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(c)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={contributors.length}
      />

      {/* Form Modal - CHỈ CÓ MỘT MODAL DUY NHẤT */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-96 relative">
            <button
              className="absolute top-2 right-2"
              onClick={() => setShowForm(false)}
            >
              <X />
            </button>
            <h3 className="text-xl font-bold mb-4">
              {selectedContributor ? "Cập nhật" : "Thêm"} Contributor
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedContributor) {
                  saveContributor(formData as ContributorUpdateRequest);
                } else {
                  saveContributor(formData as ContributorCreateRequest);
                }
              }}
              className="flex flex-col gap-2"
            >
              {/* Email chỉ Create */}
              {!selectedContributor && "userEmail" in formData && (
                <input
                  type="email"
                  name="userEmail"
                  placeholder="Email"
                  value={formData.userEmail || ""}
                  onChange={(e) =>
                    setFormData((prev) =>
                      "userEmail" in prev ? { ...prev, userEmail: e.target.value } : prev
                    )
                  }
                  required
                  className="border px-2 py-1 rounded"
                />
              )}

              {/* Các field chung */}
              <input
                type="text"
                name="bio"
                placeholder="Bio"
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="border px-2 py-1 rounded"
              />
              <input
                type="text"
                name="expertise"
                placeholder="Expertise"
                value={formData.expertise || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expertise: e.target.value }))
                }
                className="border px-2 py-1 rounded"
              />
              <input
                type="text"
                name="documentsUrl"
                placeholder="Documents URL"
                value={formData.documentsUrl || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, documentsUrl: e.target.value }))
                }
                className="border px-2 py-1 rounded"
              />

              {/* Status + Verified chỉ Update */}
              {selectedContributor &&
                "status" in formData &&
                "verified" in formData && (
                  <>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) =>
                          "status" in prev
                            ? { ...prev, status: e.target.value as ContributorStatus }
                            : prev
                        )
                      }
                      className="border px-2 py-1 rounded"
                    >
                      {Object.values(ContributorStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <select
                      name="verified"
                      value={formData.verified ? "true" : "false"}
                      onChange={(e) =>
                        setFormData((prev) =>
                          "verified" in prev
                            ? { ...prev, verified: e.target.value === "true" }
                            : prev
                        )
                      }
                      className="border px-2 py-1 rounded"
                    >
                      <option value="true">Verified</option>
                      <option value="false">Not Verified</option>
                    </select>
                  </>
                )}

              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1 rounded mt-2 hover:bg-blue-700"
              >
                {selectedContributor ? "Cập nhật" : "Thêm"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && selectedContributor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-96 relative">
            <button className="absolute top-2 right-2" onClick={() => setShowView(false)}>
              <X />
            </button>
            <h3 className="text-xl font-bold mb-4">Chi tiết Contributor</h3>
            <div className="flex flex-col gap-2">
              <p><strong>ID:</strong> {selectedContributor.id}</p>
              <p><strong>Email:</strong> {selectedContributor.userEmail}</p>
              <p><strong>Full Name:</strong> {selectedContributor.userFullName}</p>
              <p><strong>Bio:</strong> {selectedContributor.bio}</p>
              <p><strong>Expertise:</strong> {selectedContributor.expertise}</p>
              <p><strong>Documents URL:</strong> {selectedContributor.documentsUrl}</p>
              <p><strong>Status:</strong> {selectedContributor.status}</p>
              <p><strong>Verified:</strong> {selectedContributor.verified ? "Yes" : "No"}</p>
              <p><strong>Created At:</strong> {new Date(selectedContributor.createdAt).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {selectedContributor.updatedAt ? new Date(selectedContributor.updatedAt).toLocaleString() : "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && selectedContributor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-80 relative text-center">
            <p className="mb-4">
              Bạn có chắc muốn xóa contributor <strong>{selectedContributor.userFullName}</strong> không?
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700">
                Xóa
              </button>
              <button onClick={() => setShowConfirmDelete(false)} className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorManagement;