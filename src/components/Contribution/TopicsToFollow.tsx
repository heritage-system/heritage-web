import React from 'react';

const TopicsToFollow: React.FC = () => {
  const topics = ["React", "JavaScript", "Python", "Design", "Startup", "AI", "Blockchain", "Mobile"];
  
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Theo dõi chủ đề</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((tag) => (
          <button
            key={tag}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicsToFollow;
