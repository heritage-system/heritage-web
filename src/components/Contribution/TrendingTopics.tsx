import React from 'react';

const TrendingTopics: React.FC = () => {
  const topics = ["AI & Machine Learning", "Web Development", "Startup", "Design System", "Mobile Development"];
  
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Chủ đề nổi bật</h3>
      <div className="space-y-3">
        {topics.map((topic, index) => (
          <div key={index} className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded cursor-pointer">
            <span className="text-gray-700 hover:text-black">{topic}</span>
            <span className="text-xs text-gray-500">{Math.floor(Math.random() * 100) + 20}+</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
