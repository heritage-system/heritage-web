import React, { useState, useEffect } from "react";
import PanoramaTourTable from "./PanoramaTourTable";
import PanoramaTourFilters from "./PanoramaTourFilters";
import PanoramaTourDetailView from "./PanoramaTourDetailView";
import PanoramaTourFormCreate from "./PanoramaTourFormCreate";
import Pagination from "../../../Layouts/Pagination";

import { SortBy } from "../../../../types/enum";
import {
  searchPanoramaTourForAdmin,
  getPanoramaTourDetailForAdmin,
  createPanoramaTour,
  updatePanoramaTour,
  deletePanoramaTour
} from "../../../../services/panoramaTourService";

import {
  PanoramaTourSearchForAdminResponse,
  PanoramaTourSearchRequest,
  PanoramaTourCreationRequest
} from "../../../../types/panoramaTour";

import { toast } from "react-hot-toast";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";

type ViewMode = "list" | "detail" | "create" | "edit";

const PanoramaTourManagement: React.FC = () => {
  const [panoramaTours, setPanoramaTours] = useState<PanoramaTourSearchForAdminResponse[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPanoramaTour, setSelectedPanoramaTour] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async () => {
    const req = {
      keyword: searchTerm || undefined,
      sortBy:
        sortBy === "date"
          ? SortBy.DateDesc
          : sortBy === "name"
          ? SortBy.NameAsc
          : undefined,
      page: currentPage,
      pageSize: itemsPerPage,
    };

    const res = await searchPanoramaTourForAdmin(req);

    if (res.code === 200 && res.result) {
      setPanoramaTours(res.result.items);
      setTotalElements(res.result.totalElements);
      setTotalPages(res.result.totalPages);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, sortBy, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const goToDetail = async (id: number) => {
    const res = await   getPanoramaTourDetailForAdmin(id);
    if (res.code === 200) {
      console.log(res.result)
      setSelectedPanoramaTour(res.result);
      setViewMode("detail");
    }
  };

  const goToEdit = async (id?: number) => {
    if (!id) {
      setSelectedPanoramaTour(null);
      setViewMode("create");
      return;
    }

    const base = panoramaTours.find((q) => q.id === id);
    const res = await getPanoramaTourDetailForAdmin(id);

    if (res.code === 200) {
      setSelectedPanoramaTour({
        ...res.result,
        // bannerUrl: base?.bannerUrl ?? "",
        // isPremium: base?.isPremium ?? false,
      });
      setViewMode("edit");
    }
  };

  // ✅ Mở modal xoá
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  //✅ Xác nhận xoá bên trong modal
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await deletePanoramaTour(deleteId);

      if (res.code === 200) {
        toast.success("Xóa tour thành công!");

        setPanoramaTours((prev) => prev.filter((q) => q.id !== deleteId));

        fetchData();
      } else {
        toast.error("Xóa thất bại: " + (res.message ?? "Không rõ lỗi"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi gọi API xóa tour!");
    }

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleSave = async (data: PanoramaTourCreationRequest) => {
    try {
      let res;

      if (viewMode === "create") {
        res = await createPanoramaTour(data as PanoramaTourCreationRequest);
      } else {
        res = await updatePanoramaTour(selectedPanoramaTour.id, data as PanoramaTourCreationRequest);
      }

      const isSuccess =
        ((viewMode === "create" && res.code === 201) ||
          (viewMode === "edit" && res.code === 200)) &&
        res.result === true;

      if (isSuccess) {
        toast.success("Lưu thành công!");

        setViewMode("list");
        setSelectedPanoramaTour(null);
        fetchData();
      } else {
        toast.error("Lưu thất bại: " + (res.message ?? "Không rõ lỗi"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lưu!");
    }
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Quản Lý VR 360°</h2>

            <button
              onClick={() => goToEdit()}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Thêm VR 360°
            </button>
          </div>

          <PanoramaTourFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />

          <PanoramaTourTable
            panoramaTours={panoramaTours}
             onView={goToDetail}
             onEdit={goToEdit}
            onDelete={handleDelete} 
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalElements}
          />
        </>
      )}

      {viewMode === "detail" && selectedPanoramaTour && (
        <PanoramaTourDetailView
          panoramaTour={selectedPanoramaTour}
          onBack={() => setViewMode("list")}
          onEdit={() => goToEdit(selectedPanoramaTour.id)}
        />
      )}

      {(viewMode === "create" || viewMode === "edit") && (
        <PanoramaTourFormCreate
          mode={viewMode}
          panoramaTour={selectedPanoramaTour}
          onSave={handleSave}
          onCancel={() => setViewMode("list")}
        />
      )}

      <PortalModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        centered
        size="sm"
      >
        <div className="p-6 bg-white rounded-lg w-[380px]">
          <h2 className="text-xl font-bold mb-4 text-center">Xác nhận xóa</h2>

          <p className="text-gray-600 mb-6 text-center">
            Bạn có chắc muốn xóa tour này? Hành động này không thể hoàn tác.
          </p>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded bg-gray-300"
              onClick={() => setShowDeleteModal(false)}
            >
              Hủy
            </button>

            <button
              className="px-4 py-2 rounded bg-red-600 text-white"
              onClick={confirmDelete}
            >
              Xóa
            </button>
          </div>
        </div>
      </PortalModal>
    </div>
  );
};

export default PanoramaTourManagement;