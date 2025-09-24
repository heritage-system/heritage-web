import React from 'react';
import { TrendingContributor } from '../../types/contributor';
import SectionLoader from "../../components/Layouts/LoadingLayouts/SectionLoader";

interface RecommendedAuthorsProps {
  contributors: TrendingContributor[];
  loading?: boolean;
}

const RecommendedAuthors: React.FC<RecommendedAuthorsProps> = ({ 
  contributors, 
  loading = false
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Tác giả đề xuất</h3>

      {loading ? (
      
        <SectionLoader show text="Đang tải tác giả..." />
      ) : contributors.length === 0 ? (
        
        <p className="text-sm text-gray-500">Chưa có dữ liệu tác giả</p>
      ) : (
      
        <div className="space-y-4">
          {contributors.slice(0, 3).map((contributor) => (
            <div
              key={contributor.contributorId}
              className="flex items-center space-x-3"
            >
              <img
                src={contributor.avatarUrl}
                alt={contributor.contributorName}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {contributor.contributorName}
                </p>
                {/* <p className="text-xs text-gray-500">Chuyên gia {contributor.tags[0]}</p> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedAuthors;
