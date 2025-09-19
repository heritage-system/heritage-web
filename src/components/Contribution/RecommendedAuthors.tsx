import React from 'react';
import { ContributionSearchResponse } from '../../types/contribution';

interface RecommendedAuthorsProps {
  contributors: ContributionSearchResponse[];
  followingAuthors: number[];
  onToggleFollow: (contributorId: number) => void;
}

const RecommendedAuthors: React.FC<RecommendedAuthorsProps> = ({ 
  contributors, 
  followingAuthors, 
  onToggleFollow 
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Tác giả đề xuất</h3>
      <div className="space-y-4">
        {contributors.slice(0, 3).map((contributor) => (
          <div key={contributor.contributorId} className="flex items-center space-x-3">
            <img
              src={contributor.avatarUrl}
              alt={contributor.contributorName}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{contributor.contributorName}</p>
              <p className="text-xs text-gray-500">Chuyên gia {contributor.tags[0]}</p>
            </div>
            <button
              onClick={() => onToggleFollow(contributor.contributorId)}
              className={`text-xs px-3 py-1 rounded-full border ${
                followingAuthors.includes(contributor.contributorId)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
              }`}
            >
              {followingAuthors.includes(contributor.contributorId) ? 'Đã theo dõi' : 'Theo dõi'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedAuthors;
