import { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Zap, 
  Search, 
  Filter, 
  Flame,
} from 'lucide-react';

const QuizFilter = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'Tất cả', icon: Filter },
    { id: 'beginner', label: 'Cơ bản', icon: Target },
    { id: 'intermediate', label: 'Trung cấp', icon: TrendingUp },
    { id: 'advanced', label: 'Nâng cao', icon: Zap },
    { id: 'hot', label: 'Thịnh hành', icon: Flame }
  ];

  return (
    <section className="bg-white py-8 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm quiz theo chủ đề, độ khó..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizFilter;
