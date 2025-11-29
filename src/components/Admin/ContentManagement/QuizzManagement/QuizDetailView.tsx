import React, { useState } from "react";
import { QuizDetailAdminResponse, QuizQuestionResponse } from "../../../../types/quiz";
import {
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Calendar,
  ListChecks,
  Users,
  Award,
  Edit,
  ClipboardList
} from "lucide-react";

interface Props {
  quiz: QuizDetailAdminResponse;
  onBack: () => void;
  onEdit: () => void;
}

const QuizDetailView: React.FC<Props> = ({ quiz, onBack, onEdit }) => {
  const [showStats, setShowStats] = useState(false);
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null);

  const getOption = (q: QuizQuestionResponse, option: string) => {
    return q[`option${option}` as keyof QuizQuestionResponse] as string;
  };

  const getQuizLevelLabel = (level: string | null) => {
    switch (level) {
      case "EASY": return "Khởi động";
      case "MEDIUM": return "Thử thách";
      case "HARD": return "Đỉnh cao";
      default: return "Khởi động";
    }
  };

  const getQuizCategoryLabel = (category: string | null) => {
    switch (category) {
      case "RITUAL": return "Phần lễ";
      case "GAME": return "Phần hội";
      case "UNKNOWN": return "Cái gì cũng được";
      default: return "Phần lễ";
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6 pb-8 px-4">

        {/* Back button */}
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Banner */}
        {quiz.bannerUrl && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={quiz.bannerUrl}
              alt={quiz.title}
              className="w-full h-80 object-cover"
            />
          </div>
        )}

        {/* Main content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-8">

          {/* Title + Edit */}
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>

            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 
                        rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all 
                        font-medium text-gray-700"
            >
              <Edit size={18} className="text-indigo-600" />
              Chỉnh sửa
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-gray-200">
            <div>
              <p className="text-sm text-gray-500 font-medium">ID Quiz</p>
              <p className="text-lg font-semibold">#{quiz.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng số câu hỏi</p>
              <p className="text-lg font-semibold">{quiz.totalQuestions}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Loại truy cập</p>
              <span
                className={`inline-block px-4 py-1.5 text-sm font-medium border-2 rounded-full ${
                  quiz.premiumType === 1
                    ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                    : "bg-green-50 text-green-700 border-green-300"
                }`}
              >
                {quiz.premiumType === 1 ? "Thành viên" : "Miễn phí"}
              </span>
            </div>
          </div>

          {/* Questions */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">
              Danh sách câu hỏi ({quiz.questions.length})
            </h2>

            {quiz.questions.length === 0 ? (
              <p className="text-gray-500">Chưa có câu hỏi nào.</p>
            ) : (
              <div className="space-y-3">
                {quiz.questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="border-2 border-gray-200 rounded-2xl overflow-hidden"
                  >
                    {/* Thanh ngang */}
                    <button
                      className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-all"
                      onClick={() =>
                        setOpenQuestionIndex(openQuestionIndex === index ? null : index)
                      }
                    >
                      <span className="font-medium">Câu {index + 1}</span>
                      <span>
                        {openQuestionIndex === index ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </span>
                    </button>

                    {/* Nội dung câu hỏi */}
                    {openQuestionIndex === index && (
                      <div className="p-6 bg-gray-50 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                            {getQuizLevelLabel(q.quizLevel)}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-200">
                            {getQuizCategoryLabel(q.quizCategory)}
                          </span>
                        </div>

                        <p className="font-semibold text-lg">{q.question}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {["A", "B", "C", "D"].map((o) => (
                            <div
                              key={o}
                              className={`p-4 rounded-xl border-2 ${
                                q.correctOption === o
                                  ? "bg-green-50 border-green-400"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <span className="font-bold mr-2">{o}.</span>
                              {getOption(q, o)}
                              {q.correctOption === o && (
                                <span className="ml-2 text-xs font-bold text-green-700">
                                  ✓ Đáp án đúng
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar thống kê */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl p-6 z-40 overflow-y-auto transform transition-transform duration-500 ${
          showStats ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Thống Kê Trò Chơi
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-blue-50 flex flex-col items-center shadow-sm">
            <ListChecks className="w-5 h-5 text-blue-700 mb-1" />
            <p className="font-bold text-base">{quiz.totalQuestions}</p>
            <p className="text-xs text-gray-500">Số câu hỏi</p>
          </div>

          <div className="p-3 rounded-lg bg-yellow-50 flex flex-col items-center shadow-sm">
            <Users className="w-5 h-5 text-yellow-700 mb-1" />
            <p className="font-bold text-base">{quiz.totalAttempts}</p>
            <p className="text-xs text-gray-500">Lượt làm</p>
          </div>

          <div className="p-3 rounded-lg bg-green-50 flex flex-col items-center shadow-sm">
            <Award className="w-5 h-5 text-green-700 mb-1" />
            <p className="font-bold text-base">{quiz.totalClearCount}</p>
            <p className="text-xs text-gray-500">Số lần hoàn thành</p>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 flex flex-col items-center shadow-sm">
            <ClipboardList className="w-5 h-5 text-purple-700 mb-1" />
            <p className="font-bold text-base">{quiz.results?.length ?? 0}</p>
            <p className="text-xs text-gray-500">Người hoàn thành</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 shadow-sm">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Ngày tạo</p>
              <p className="font-semibold">
                {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Ngày cập nhật</p>
              <p className="font-semibold">
                {new Date(quiz.updatedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle sidebar */}
      <div
        onClick={() => setShowStats(!showStats)}
        className={`fixed z-50 cursor-pointer px-4 py-2 rounded-l-lg shadow-lg 
          bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition
          ${showStats ? "right-96 top-6" : "right-0 top-40"}`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-sm font-semibold">Thống Kê</span>
        {showStats ? <ChevronRight /> : <ChevronLeft />}
      </div>
    </div>
  );
};

export default QuizDetailView;
