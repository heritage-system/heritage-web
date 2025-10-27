import { useState, useEffect } from "react";
import { ChevronLeft, ArrowLeft, ArrowRight, Send,BarChart2,CheckCircle,XCircle ,Trophy} from "lucide-react";
import QuestionDisplay from "./QuestionDisplay";
import { QuizDetailResponse } from "../../types/quiz";
import { getQuizDetail, saveQuizResult } from "../../services/quizService";
import Spinner from "../../components/Layouts/LoadingLayouts/Spinner";
interface TestViewProps {
  id: number;
  onBack: () => void;
  onQuizCompleted?: (quizId: number, numberOfClear: number) => void;
}

const TestView: React.FC<TestViewProps> = ({ id, onBack, onQuizCompleted }) => {
  const [quizDetail, setQuizDetail] = useState<QuizDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ✅ Lưu trạng thái từng câu hỏi: { [questionId]: { selected: number, showResult: boolean } }
  const [answersState, setAnswersState] = useState<Record<number, { selected: number; showResult: boolean }>>({});

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await getQuizDetail(id);
        if (response.code === 200 && response.result) {
          setQuizDetail(response.result);
        } else {
          setError("Không tìm thấy chi tiết quiz.");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu quiz.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswersState((prev) => {
      const updated = {
        ...prev,
        [questionId]: { selected: answerIndex, showResult: true },
      };

      // Nếu đã trả lời hết tất cả câu hỏi
      if (quizDetail && Object.keys(updated).length === quizDetail.questions.length) {
        (async () => {
          const correctCount = Object.entries(updated).filter(([qId, val]) => {
            const question = quizDetail.questions.find(q => q.id === Number(qId));
            if (!question) return false;
            const correctIndex =
              question.correctOption === "A" ? 0 :
              question.correctOption === "B" ? 1 :
              question.correctOption === "C" ? 2 : 3;
            return val.selected === correctIndex;
          }).length;

          // ✅ Chỉ lưu khi điểm mới cao hơn kỷ lục cũ
          if (correctCount > (quizDetail.numberOfClear ?? 0)) {
            try {
              const response = await saveQuizResult({
                quizId: quizDetail.id,
                numberOfClear: correctCount,
              });

              if (response.code === 201 && response.result) {
                console.log("Lưu kết quả thành công!");
                setIsSubmitted(true);
                onQuizCompleted?.(quizDetail.id, correctCount);
              } else {
                console.warn("Lưu kết quả thất bại:", response.message);
                setIsSubmitted(true);
              }
            } catch (error) {
              console.error("Lỗi khi lưu kết quả:", error);
              setIsSubmitted(true);
            }
          } else {
            setIsSubmitted(true);
          }
        })();
      }

      return updated;
    });
  };



  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNextQuestion = () => {
    if (quizDetail && currentQuestionIndex < quizDetail.questions.length - 1)
      setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setShowSubmitModal(false);

    // ✅ Gọi API lưu kết quả
    try {
      const totalQuestions = quizDetail?.questions.length ?? 0;
      const numberOfClear = getCorrectCount();

      if (!quizDetail) return;

      if (numberOfClear > (quizDetail.numberOfClear ?? 0)) {
        const response = await saveQuizResult({
          quizId: quizDetail.id,
          numberOfClear: numberOfClear,
        });

        if (response.code === 201 && response.result) {
          setIsSubmitted(true);
          onQuizCompleted?.(quizDetail.id, numberOfClear);
          console.log("Lưu kết quả thành công!");
        } else {
          console.warn("Lưu kết quả thất bại:", response.message);
        }
      }
      else {
        setIsSubmitted(true);
      }
      
    } catch (error) {
      console.error("Lỗi khi lưu kết quả:", error);
    }
  };

  const getAnsweredCount = () => Object.keys(answersState).length;

  
  const getCorrectCount = () => {
    return Object.entries(answersState).filter(([qId, val]) => {
      const question = quizDetail?.questions.find(q => q.id === Number(qId));
      if (!question) return false;
      const correctIndex =
        question.correctOption === "A" ? 0 :
        question.correctOption === "B" ? 1 :
        question.correctOption === "C" ? 2 : 3;
      return val.selected === correctIndex;
    }).length;
  };

  const getWrongCount = () => getAnsweredCount() - getCorrectCount();


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pb-60">
        <div className="text-center">
          <div className="mb-4">
            <Spinner size={40} thickness={5}/>
          </div>
          <div className="text-xl font-semibold text-gray-700">Đang tải thông tin...</div>
          <div className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
  );
  if (error) return <div className="text-center py-12 text-red-600 font-medium">{error}</div>;
  if (!quizDetail) return <div className="text-center py-12 text-gray-500">Không có dữ liệu quiz.</div>;

  const questions = quizDetail.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answersState[currentQuestion.id];

  // ✅ Chuyển correctOption (A,B,C,D) sang index 0–3
  const correctIndex =
    currentQuestion.correctOption === "A"
      ? 0
      : currentQuestion.correctOption === "B"
      ? 1
      : currentQuestion.correctOption === "C"
      ? 2
      : 3;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl rounded-3xl mx-auto shadow-2xl border-4 border-[#cfa86a]/30 relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <button
              onClick={() => {
                if (isSubmitted || getAnsweredCount() === 0) onBack();
                else setShowBackModal(true);
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Quay lại danh sách
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quizDetail.title}</h1>
          </div>

          {/* Progress */}
          <div className="mb-6 px-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
             <div className="flex items-center gap-6">
                {/* Tiến độ */}
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium">Tiến độ:</span>
                </div>

                {/* Đúng */}
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Đúng: {getCorrectCount()}</span>
                </div>

                {/* Sai */}
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span>Sai: {getWrongCount()}</span>
                </div>
              </div>
              <span>{getAnsweredCount()}/{questions.length} câu</span>
            </div>      
           
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentQuestionIndex === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Câu trước
            </button>

            <div className="text-center">
              <span className="text-lg font-semibold text-gray-900">
                Câu {currentQuestionIndex + 1}
              </span>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentQuestionIndex === questions.length - 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Câu sau
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
        
        {/* Current Question */}
        <div className="rounded-xl shadow-sm px-12 pt-2 mb-4">        
          {/* Hiển thị kết quả nếu đã nộp bài */}
          {isSubmitted ? (
            <div className="rounded-xl shadow-sm p-10 text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Kết quả</h2>

              <div className="flex justify-center gap-10">
                {/* Đúng */}
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-10 h-10 text-green-600 mb-2" />
                  <span className="text-xl font-semibold text-green-600">{getCorrectCount()}</span>
                  <span className="text-gray-700 text-sm">Câu đúng</span>
                </div>

                {/* Sai */}
                <div className="flex flex-col items-center">
                  <XCircle className="w-10 h-10 text-red-600 mb-2" />
                  <span className="text-xl font-semibold text-red-600">{getWrongCount()}</span>
                  <span className="text-gray-700 text-sm">Câu sai</span>
                </div>

                {/* Tỷ lệ đúng */}
                <div className="flex flex-col items-center">
                  <BarChart2 className="w-10 h-10 text-blue-600 mb-2" />
                  <span className="text-xl font-semibold text-blue-600">
                    {((getCorrectCount() / questions.length) * 100).toFixed(0)}%
                  </span>
                  <span className="text-gray-700 text-sm">Tỷ lệ đúng</span>
                </div>
              </div>
              {getCorrectCount() > (quizDetail.numberOfClear ?? 0) && (
                <div className="flex justify-center items-center gap-2 text-amber-700 font-semibold text-lg">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  <span>Kỷ lục mới được xác lập!</span>
                </div>
              )}


              {/* Nút quay lại */}
              <div className="mt-8">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </div>
          ) : (
            <QuestionDisplay
              id={currentQuestion.id}
              question={currentQuestion.question}
              options={[
                currentQuestion.optionA,
                currentQuestion.optionB,
                currentQuestion.optionC,
                currentQuestion.optionD,
              ]}
              playerAnswer={currentAnswer?.selected}
              showResult={!!currentAnswer?.showResult}
              correctIndex={correctIndex}
              onSelect={(i) => handleAnswerSelect(currentQuestion.id, i)}
              difficulty={currentQuestion.quizLevel}
            />
          )}

        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="rounded-xl shadow-sm p-6">
            <div className="text-center">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center mx-auto"
              >
                <Send className="w-5 h-5 mr-2" />
                Kết thúc
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận kết thúc</h3>
            <p className="text-gray-600 mb-6">
              Bạn đã trả lời {getAnsweredCount()}/{questions.length} câu hỏi. 
              Bạn có chắc chắn muốn kết thúc sớm không?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Kết thúc
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận quay lại</h3>
            <p className="text-gray-600 mb-6">
              Bạn đang làm dở bài quiz này. Nếu quay lại, tiến độ sẽ bị <b>mất</b>.  
              Bạn có chắc chắn muốn rời khỏi không?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBackModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ở lại
              </button>
              <button
                onClick={() => {
                  setShowBackModal(false);
                  onBack();
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TestView;
