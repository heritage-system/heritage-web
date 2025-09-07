import React from 'react';
import { Contribution } from '../../types/contribution';

interface AuthorInfoProps {
  contribution: Contribution;
  isFollowing: boolean;
  onToggleFollow: (contributorId: number) => void;
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ contribution, isFollowing, onToggleFollow }) => {
  return (
    <div className="flex items-center space-x-3">
      <img
        src={contribution.avatarUrl}
        alt={contribution.contributorName}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex items-center space-x-2 text-sm">
        <span className="font-medium text-gray-900 hover:underline cursor-pointer">
          {contribution.contributorName}
        </span>
        <span className="text-gray-500">·</span>
        <button
          onClick={() => onToggleFollow(contribution.contributorId)}
          className={`text-sm ${
            isFollowing
              ? 'text-green-600 font-medium'
              : 'text-green-600 hover:text-green-700'
          }`}
        >
          {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </button>
      </div>
    </div>
  );
};

export default AuthorInfo;
