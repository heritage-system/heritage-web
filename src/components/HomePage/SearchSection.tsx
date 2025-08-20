import React from "react";
import { 
  Search, 
  Calendar, 
  Play, 
  Star,
  Globe,
  BookOpen,
} from "lucide-react";

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const categories = [
    { id: 'all', name: 'Tất cả', icon: Globe, color: 'from-purple-500 to-pink-500' },
    { id: 'festival', name: 'Lễ hội', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { id: 'performance', name: 'Biểu diễn', icon: Play, color: 'from-green-500 to-emerald-500' },
    { id: 'ritual', name: 'Nghi lễ', icon: Star, color: 'from-orange-500 to-red-500' },
    { id: 'music', name: 'Âm nhạc', icon: BookOpen, color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tìm kiếm{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Di sản
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá kho tàng văn hóa phong phú của Việt Nam
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm lễ hội, biểu diễn, nghi lễ, âm nhạc..."
              className="w-full pl-12 pr-4 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
