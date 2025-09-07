import React from 'react';

interface TagsProps {
  tags: string[];
}

const Tags: React.FC<TagsProps> = ({ tags }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export default Tags;
