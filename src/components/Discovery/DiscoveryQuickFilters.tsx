interface DiscoveryQuickFiltersProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: '🎭' },
  { id: 'festivals', name: 'Lễ hội', icon: '🎉' },
  { id: 'performances', name: 'Biểu diễn', icon: '🎪' },
  { id: 'music', name: 'Âm nhạc', icon: '🎵' },
  { id: 'crafts', name: 'Thủ công', icon: '🏺' }
];

const DiscoveryQuickFilters: React.FC<DiscoveryQuickFiltersProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-gradient-to-r from-yellow-700 to-red-700 text-white'
              : 'bg-white text-gray-700 border border-yellow-300 hover:bg-yellow-50'
          }`}
        >
          <span className="mr-1">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default DiscoveryQuickFilters;
