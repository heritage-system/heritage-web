import { 
  ChevronRight,
} from 'lucide-react';
import QuizCard from './QuizCard';
import QuizzData from './QuizzData';
import { Quiz } from '../../types/quiz';
import React from 'react';

const QuizGrid: React.FC = () => {
  return (
    <section className="mt-4">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {QuizzData.map((quiz: Quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>

    <div className="text-center mt-12">
      <button className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center mx-auto">
        <ChevronRight className="w-5 h-5 mr-2" />
        Xem thêm quiz khác
      </button>
    </div>
  </div>
</section>

  );
};

export default QuizGrid;
