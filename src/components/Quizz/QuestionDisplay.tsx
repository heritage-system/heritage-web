import { motion } from "framer-motion";
import { CheckCircle, Feather, Flame, Gem, XCircle } from "lucide-react";

interface QuestionDisplayProps {
  id: number;
  question: string;
  options: string[];
  difficulty?: string;
  playerAnswer?: number;
  showResult?: boolean;
  correctIndex?: number;
  onSelect: (index: number) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  id,
  question,
  options,
  difficulty,
  playerAnswer,
  showResult,
  correctIndex,
  onSelect,
}) => {
  return (
    <div className="rounded-xl shadow-sm px-5 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-end mb-2 mt-2">
        <span
          className={`flex items-center gap-1 font-bold ${
            difficulty === "EASY"
              ? "text-green-600"
              : difficulty === "MEDIUM"
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {difficulty === "EASY" && (
            <>
              <Feather className="w-5 h-5" /> KHỞI ĐỘNG
            </>
          )}
          {difficulty === "MEDIUM" && (
            <>
              <Flame className="w-5 h-5" /> THỬ THÁCH
            </>
          )}
          {difficulty === "HARD" && (
            <>
              <Gem className="w-5 h-5" /> ĐỈNH CAO
            </>
          )}
        </span>
      </div>

      {/* Nội dung câu hỏi */}
      <h3 className="text-lg md:text-lg font-semibold text-gray-900 mb-4">
        {question}
      </h3>

      {/* Danh sách đáp án */}
      <div className="space-y-3 relative overflow-hidden min-h-[200px] flex flex-col justify-center">
        {options.map((opt, i) => {
          const isSelected = playerAnswer === i;
          const isCorrect = showResult && isSelected && correctIndex === i;
          const isWrong = showResult && isSelected && i !== correctIndex;

          let cls =
            "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ";

          if (isCorrect)
            cls += "border-green-500 bg-green-50 text-green-800";
          else if (isWrong)
            cls += "border-red-500 bg-red-50 text-red-800";
          else if (isSelected)
            cls += "border-blue-500 bg-blue-50 text-blue-800";
          else
            cls += "border-gray-200 hover:border-gray-300 hover:bg-gray-50";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className={cls}
              onClick={() => !showResult && onSelect(i)} // ❗ chỉ cho chọn khi chưa nộp bài
            >
              {/* Ký tự A, B, C, D */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 font-bold text-sm ${
                  isCorrect
                    ? "border-green-500 bg-green-500 text-white"
                    : isWrong
                    ? "border-red-500 bg-red-500 text-white"
                    : isSelected
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-400 text-black"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </div>

              <span className="flex-1 text-black font-semibold">{opt}</span>

              {/* ✅ Đúng thì hiện CheckCircle, ❌ Sai thì hiện XCircle */}
              {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
              {isWrong && <XCircle className="w-5 h-5 text-red-600" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionDisplay;
