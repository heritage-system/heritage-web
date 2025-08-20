import { 
  ChevronRight,
} from 'lucide-react';
import QuizCard from './QuizCard';
import QuizzData from './QuizzData';
import { Quiz } from '../../types/quiz';
import React from 'react';

const QuizGrid: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Quiz <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tương tác</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thử thách kiến thức của bạn với các quiz thú vị về di sản văn hóa Việt Nam
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {QuizzData.map((quiz: Quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center mx-auto">
            <ChevronRight className="w-5 h-5 mr-2" />
            Xem thêm quiz khác
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuizGrid;
