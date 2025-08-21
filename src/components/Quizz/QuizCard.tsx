import { 
  Target, 
  TrendingUp, 
  Zap, 
  Play, 
  Users, 
  Star, 
  Flame,
  Gamepad2,
  Puzzle,
  Gift,
  Timer,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '../../types/quiz';

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const navigate = useNavigate();

  const difficultyIcons: Record<string, React.ElementType> = {
    Easy: Target,
    Medium: TrendingUp,
    Hard: Zap,
  };
  const DifficultyIcon = difficultyIcons[quiz.difficulty] || Target;

  const handlePlayClick = () => {
    navigate('/quizdetailview');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:scale-105">
      <div className="relative">
        <img
          src={quiz.image}
          alt={quiz.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`${quiz.difficultyColor} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
            <DifficultyIcon className="w-4 h-4 mr-1" />
            {quiz.difficulty}
          </span>
          <span className="bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {quiz.category}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {quiz.isHot && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <Flame className="w-4 h-4 mr-1" />
              Hot
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
            {quiz.badge}
          </span>
        </div>
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={handlePlayClick} 
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg"
          >
            <Play className="w-5 h-5 text-yellow-600" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
          {quiz.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {quiz.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Puzzle className="w-4 h-4 mr-1" />
            {quiz.questions} câu hỏi
          </div>
          <div className="flex items-center">
            <Timer className="w-4 h-4 mr-1" />
            {quiz.time}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
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
        </div>

        <div className="bg-gray-100 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Phần thưởng:</span>
            </div>
            <span className="text-sm text-yellow-600 font-medium">{quiz.reward}</span>
          </div>
        </div>
        
        <button 
          onClick={handlePlayClick} 
          className="w-full bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center"
        >
          <Gamepad2 className="w-5 h-5 mr-2" />
          Chơi ngay
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
