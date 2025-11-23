import React from "react";
import { QuizQuestionCreationRequest } from "../../../../types/quiz";
import { QuizCategory, QuizLevel } from "../../../../types/enum";
import { Edit, Trash2 } from "lucide-react";

type OptionKey = "optionA" | "optionB" | "optionC" | "optionD";

interface Props {
  question: QuizQuestionCreationRequest & { tempId: string };
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const QuizQuestionItem: React.FC<Props> = ({
  question,
  index,
  onEdit,
  onDelete,
}) => {
  const getQuizLevelLabel = (level: number | null) => {
  switch (level) {
    case QuizLevel.EASY: return "Khởi động";
    case QuizLevel.MEDIUM: return "Thử thách";
    case QuizLevel.HARD: return "Đỉnh cao";
    default: return "Khởi động";
  }
};

const getQuizCategoryLabel = (category: number | null) => {
  switch (category) {
    case QuizCategory.RITUAL: return "Phần lễ";
    case QuizCategory.GAME: return "Phần hội";
    case QuizCategory.UNKNOWN: return "Không có";
    default: return "Phần lễ";
  }
};

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-semibold text-gray-800">
            Câu {index + 1}
          </span>

          <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
            {getQuizLevelLabel(question.quizLevel ?? null)}
          </span>

          <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
            {getQuizCategoryLabel(question.quizCategory ?? null)}
          </span>
        </div>

        <div className="flex gap-2">
         <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-900 p-1"
          >
            <Edit size={16} />
          </button>

          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-gray-900 font-medium mb-4">{question.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(["A", "B", "C", "D"] as const).map((o) => {
          const key: OptionKey = `option${o}` as OptionKey;

          return (
            <div
              key={o}
              className={`p-3 rounded-lg border ${
                question.correctOption === o
                  ? "bg-green-50 border-green-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <strong className="mr-2">{o}.</strong>
              <span>{question[key]}</span>

              {question.correctOption === o && (
                <span className="ml-2 text-xs text-green-700">
                  (Đáp án đúng)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizQuestionItem;