
// Quick Filters Component
const DiscoveryQuickFilters = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🎭' },
    { id: 'festivals', name: 'Lễ hội', icon: '🎉' },
    { id: 'performances', name: 'Biểu diễn', icon: '🎪' },
    { id: 'music', name: 'Âm nhạc', icon: '🎵' },
    { id: 'crafts', name: 'Thủ công', icon: '🏺' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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