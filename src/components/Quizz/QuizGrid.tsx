import { useState, useEffect } from "react";
import QuizCard from "./QuizCard";
import QuizCardSkeleton from "./QuizCardSkeleton";
import TestView from "./QuizDetailView";
import UnlockQuizPopup from "./UnlockQuizPopup";
import { QuizListResponse } from "../../types/quiz";
import { searchQuizz, unlockQuiz } from "../../services/quizService";
import { tradePointToUnlockQuiz } from "../../services/userPointService";
import Pagination from "../Layouts/Pagination";
import Spinner from "../../components/Layouts/LoadingLayouts/Spinner";
import toast from 'react-hot-toast';
import {PointHistoriesReason} from "../../types/enum";
import { useAuth } from '../../hooks/useAuth';
const QuizGrid: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizListResponse | null>(null);
  const [quizList, setQuizList] = useState<QuizListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
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

  const handleGoBack = () => {
    setSelectedQuiz(null)
    setCanPlay(false); 
  };
  // ✅ Nếu chọn quiz thì hiển thị chi tiết
  if (selectedQuiz && canPlay) {    
    return (
      <div className="max-w-7xl mx-auto">
        <TestView 
          id={selectedQuiz.id} 
          onBack={() => handleGoBack()} 
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

  const handleQuizClick = (quiz: QuizListResponse) => {
    // Nếu quiz premium nhưng chưa mở khóa → bật popup
    if (quiz.isPremium && !quiz.isUnlock) {
      setSelectedQuiz(quiz);
      setIsPopupOpen(true);
      return;
    }

    // Nếu quiz free hoặc premium đã mở → vào TestView
    setSelectedQuiz(quiz);
    setCanPlay(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedQuiz(null); 
  };

  
  const handleUnlock = async (quizId: number) => {
    if (!quizId || !selectedQuiz) return;

    setUnlockLoading(true);

    try {
      const res = await unlockQuiz(quizId);

      if (res.code === 201 && res.result === true) {

        
        setCanPlay(true);

      
        setQuizList(prev =>
          prev.map(q =>
            q.id === quizId ? { ...q, isUnlock: true } : q
          )
        );

      
        setSelectedQuiz(prev =>
          prev ? { ...prev, isUnlock: true } : prev
        );

        toast.success("Mở khóa thành công!");
      } else {
        toast.error("Không mở khóa được nội dung");
      }

    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi mở khóa");
    } finally {
      setUnlockLoading(false);
    }
  };


  const onUnlockWithPoints = async (quizId: number) => {
    if (!quizId || !selectedQuiz) return;
    setUnlockLoading(true);
    try {

      const payload = {
        changeAmount: 60,
        reason: PointHistoriesReason.UNLOCK_QUIZ,      
        referenceId: quizId
      };
      const res = await tradePointToUnlockQuiz(payload);

      if (res.code === 201 && res.result === true) {

        
        setCanPlay(true);

      
        setQuizList(prev =>
          prev.map(q =>
            q.id === quizId ? { ...q, isUnlock: true } : q
          )
        );

      
        setSelectedQuiz(prev =>
          prev ? { ...prev, isUnlock: true } : prev
        );

        toast.success("Mở khóa thành công!");
      } else {
        toast.error("Không mở khóa được nội dung");
      }

    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi mở khóa");
    } finally {
      setUnlockLoading(false);
    }
  };

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
                onPlay={() => handleQuizClick(quiz)}
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

           {isPopupOpen && selectedQuiz && (
              <UnlockQuizPopup quiz={selectedQuiz} onClose={handleClosePopup}  onHandleUnlock={handleUnlock} unlockLoading={unlockLoading} onUnlockWithPoints={onUnlockWithPoints} isAuthenticated={isLoggedIn}/>
            )}

      </div>
    </section>
  );
};

export default QuizGrid;
