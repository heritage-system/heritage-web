import { 
  Star,
  Play, 
  Gamepad2,
  Puzzle,
  BarChart2,
  Gift,
} from 'lucide-react';
import { QuizListResponse } from "../../types/quiz";

interface QuizCardProps {
  quiz: QuizListResponse;
  onPlay: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onPlay }) => {
 
  const Icon = quiz.isPremium ? Star : Gamepad2;
  const isCompleted = quiz.numberOfClear === quiz.totalQuestions;
  return (
    <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:scale-105">
      <div className="relative">
        <img
          src={quiz.bannerUrl}
          alt={quiz.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
            <Puzzle className="w-4 h-4 mr-1" />
            {quiz.totalQuestions} câu hỏi
          </span>
          {/* <span className="bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {quiz.category}
          </span> */}
        </div>      
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={onPlay} 
            disabled={quiz.isPremium}
            className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
              quiz.isPremium
                ? "bg-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                : "bg-white/90 hover:bg-white text-yellow-600"
            }`}
          >
            <Play  className="w-5 h-5 text-yellow-600" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h4
          className="text-lg font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors truncate"
          title={quiz.title} 
        >
          {quiz.title}
        </h4>

        {/* <p className="text-gray-600 mb-4 line-clamp-2">
          {quiz.description}
        </p> */}
        
        {/* <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-yellow-600">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-gray-900 ml-1">{quiz.rating}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              {quiz.players}
            </div>
          </div>        
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">{quiz.completedBy.toLocaleString()}</span>
          </div>
        </div> */}

       <div
  className={`rounded-lg p-3 mb-4 ${
    isCompleted ? "bg-green-100" : "bg-gray-100"
  }`}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <BarChart2
        className={`w-4 h-4 mr-2 ${
          isCompleted ? "text-green-600" : "text-yellow-600"
        }`}
      />
      <span
        className={`text-sm font-medium ${
          isCompleted ? "text-green-700" : "text-gray-700"
        }`}
      >
        Tiến độ:
      </span>
    </div>
    <span
      className={`text-sm font-medium ${
        isCompleted ? "text-green-700" : "text-yellow-600"
      }`}
    >
      {quiz.numberOfClear ?? 0}/{quiz.totalQuestions}
    </span>
  </div>
</div>
        <button
          //onClick={!quiz.isPremium ? onPlay : undefined} 
          onClick={onPlay} 
          //disabled={quiz.isPremium} // 🔥 disable UI
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center transition-all bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white hover:shadow-lg`}
        >
          <Icon className="w-5 h-5 mr-2" />
          {quiz.isPremium && !quiz.isUnlock ? "Mở khóa" : "Chơi ngay"}
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
