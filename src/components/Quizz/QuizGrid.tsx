import { useState, useEffect } from "react";
import QuizCard from "./QuizCard";
import QuizCardSkeleton from "./QuizCardSkeleton";
import TestView from "./QuizDetailView";
import { QuizListResponse } from "../../types/quiz";
import { searchQuizz } from "../../services/quizService";
import Pagination from "../Layouts/Pagination";
import Spinner from "../../components/Layouts/LoadingLayouts/Spinner";
const QuizGrid: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizListResponse | null>(null);
  const [quizList, setQuizList] = useState<QuizListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6;

  // 🧠 Gọi API khi component load hoặc đổi trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await searchQuizz({ page: currentPage, pageSize });
        if (response.code === 200 && response.result?.items) {
          setQuizList(response.result.items);
          setTotalPages(response.result.totalPages || 1);
          setTotalItems(response.result.totalElements || response.result.items.length);
        } else {
          setError("Không tìm thấy dữ liệu quiz nào");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  // ✅ Nếu chọn quiz thì hiển thị chi tiết
  if (selectedQuiz) {
    return (
      <div className="max-w-7xl mx-auto">
        <TestView 
          id={selectedQuiz.id} 
          onBack={() => setSelectedQuiz(null)} 
          onQuizCompleted={(quizId, numberOfClear) => {
            setQuizList((prev) =>
              prev.map((q) =>
                q.id === quizId ? { ...q, numberOfClear } : q
              )
            );
          }}
          />
      </div>
    );
  }

  // ✅ Nếu đang loading
  if (loading) {
    return (
      <section className="mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ✅ Nếu có lỗi
  if (error) {
    return (
      <div className="text-center text-red-600 font-medium mt-8">
        {error}
      </div>
    );
  }
  // ✅ Nếu có dữ liệu
  return (
    <section className="mt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {quizList.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            Không có quiz nào để hiển thí
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizList.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onPlay={() => setSelectedQuiz(quiz)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && !loading &&(
          <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={pageSize}
                totalItems={totalItems}
              />
            </div>
          )}
      </div>
    </section>
  );
};

export default QuizGrid;
