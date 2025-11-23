import React, { useState, useEffect } from "react";
import QuizTable from "./QuizTable";
import QuizFilters from "./QuizFilters";
import QuizDetailView from "./QuizDetailView";
import QuizFormCreate from "./QuizFormCreate";
import Pagination from "../../../Layouts/Pagination";

import { SortBy } from "../../../../types/enum";
import {
  searchQuizz,
  getQuizDetailAdmin,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../../../../services/quizService";

import {
  QuizListResponse,
  QuizCreationRequest,
  QuizUpdateRequest,
} from "../../../../types/quiz";

import { toast } from "react-hot-toast";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";

type ViewMode = "list" | "detail" | "create" | "edit";

const QuizzManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizListResponse[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

    const res = await searchQuizz(req);

    if (res.code === 200 && res.result) {
      setQuizzes(res.result.items);
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
  const res = await getQuizDetailAdmin(id);
  if (res.code === 200) {
    setSelectedQuiz(res.result);
    setViewMode("detail");
  }
};

  const goToEdit = async (id?: number) => {
    if (!id) {
      setSelectedQuiz(null);
      setViewMode("create");
      return;
    }

    const base = quizzes.find((q) => q.id === id);
    const res = await getQuizDetailAdmin(id);

    if (res.code === 200) {
      setSelectedQuiz({
        ...res.result,
        bannerUrl: base?.bannerUrl ?? "",
        isPremium: base?.isPremium ?? false,
      });
      setViewMode("edit");
    }
  };

  // ✅ Mở modal xoá
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // ✅ Xác nhận xoá bên trong modal
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await deleteQuiz(deleteId);

      if (res.code === 200) {
        toast.success("Xóa quiz thành công!");

        setQuizzes((prev) => prev.filter((q) => q.id !== deleteId));

        fetchData();
      } else {
        toast.error("Xóa thất bại: " + (res.message ?? "Không rõ lỗi"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi gọi API xóa quiz!");
    }

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleSave = async (data: QuizCreationRequest | QuizUpdateRequest) => {
    try {
      let res;

      if (viewMode === "create") {
        res = await createQuiz(data as QuizCreationRequest);
      } else {
        res = await updateQuiz(data as QuizUpdateRequest);
      }

      const isSuccess =
        ((viewMode === "create" && res.code === 201) ||
          (viewMode === "edit" && res.code === 200)) &&
        res.result === true;

      if (isSuccess) {
        toast.success("Lưu quiz thành công!");

        setViewMode("list");
        setSelectedQuiz(null);
        fetchData();
      } else {
        toast.error("Lưu thất bại: " + (res.message ?? "Không rõ lỗi"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lưu quiz!");
    }
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Quản Lý Trò Chơi</h2>

            <button
              onClick={() => goToEdit()}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Thêm quiz
            </button>
          </div>

          <QuizFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <QuizTable
            quizzes={quizzes}
            onView={goToDetail}
            onEdit={goToEdit}
            onDelete={handleDelete} // ✅ Đã sửa để mở modal
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

      {viewMode === "detail" && selectedQuiz && (
        <QuizDetailView
          quiz={selectedQuiz}
          onBack={() => setViewMode("list")}
          onEdit={() => goToEdit(selectedQuiz.id)}
        />
      )}

      {(viewMode === "create" || viewMode === "edit") && (
        <QuizFormCreate
          mode={viewMode}
          quiz={selectedQuiz}
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
            Bạn có chắc muốn xóa quiz này? Hành động này không thể hoàn tác.
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

export default QuizzManagement;
