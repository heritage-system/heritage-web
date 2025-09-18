import React from 'react';
import { Heart, MessageCircle, BookmarkPlus, Share2, MoreHorizontal } from 'lucide-react';
import { ContributionSearchResponse } from '../../types/contribution';

interface ArticleMetaProps {
  contribution: ContributionSearchResponse;
  formatDate: (date: Date) => string;
  formatPrice: (price: number) => string;
}

const ArticleMeta: React.FC<ArticleMetaProps> = ({ contribution, formatDate, formatPrice }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>{formatDate(contribution.postedAt)}</span>
        <span>·</span>
        <span>{contribution.readTime}</span>
        <span>·</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
          {formatPrice(contribution.price)}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 cursor-pointer">
          <Heart className="h-4 w-4" />
          <span className="text-sm">{contribution.claps}</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 cursor-pointer">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{contribution.comments}</span>
        </div>
        <BookmarkPlus className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
        <Share2 className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
        <MoreHorizontal className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
      </div>
    </div>
  );
};

export default ArticleMeta;
