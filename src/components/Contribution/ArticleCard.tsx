import React from 'react';
import AuthorInfo from './AuthorInfo';
import ArticleMeta from './ArticleMeta';
import Tags from './Tags';
import { ContributionSearchResponse } from '../../types/contribution';

interface ArticleCardProps {
  contribution: ContributionSearchResponse;
  isFollowing: boolean;
  onToggleFollow: (contributorId: number) => void;
  formatDate: (date: Date) => string;
  formatPrice: (price: number) => string;
  isLast: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  contribution, 
  isFollowing, 
  onToggleFollow, 
  formatDate, 
  formatPrice, 
  isLast 
}) => {
  return (
    <article className="group cursor-pointer">
      <div className="flex flex-col space-y-4">
        {/* Author Info */}
        <AuthorInfo
          contribution={contribution}
          isFollowing={isFollowing}
          onToggleFollow={onToggleFollow}
        />

        {/* Article Content */}
        <div className="flex justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 group-hover:underline leading-tight">
              {contribution.title}
            </h2>
            
            <p className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3">
              {contribution.firstText}
            </p>

            {/* Meta Info */}
            <ArticleMeta
              contribution={contribution}
              formatDate={formatDate}
              formatPrice={formatPrice}
            />

            {/* Tags */}
            <Tags tags={contribution.tags} />
          </div>

          {/* Featured Image */}
          {contribution.mediaUrl && (
            <div className="flex-shrink-0">
              <img
                src={contribution.mediaUrl}
                alt={contribution.title}
                className="w-32 h-32 lg:w-40 lg:h-28 object-cover rounded"
              />
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      {!isLast && <hr className="mt-8 border-gray-200" />}
    </article>
  );
};

export default ArticleCard;
