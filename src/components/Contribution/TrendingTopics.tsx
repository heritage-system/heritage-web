// components/Contribution/TrendingTopics.tsx
import React from "react";
import { ContributionHeritageTag } from "../../types/heritage";
import SectionLoader from "../../components/Layouts/LoadingLayouts/SectionLoader";

interface Props {
  contributionTags: ContributionHeritageTag[];
  loading?: boolean;
}

const TrendingTopics: React.FC<Props> = ({ contributionTags, loading = false }) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Chủ đề nổi bật</h3>

      {loading ? (
        <SectionLoader show={loading} text="Đang tải chủ đề..." />
      ) : contributionTags.length === 0 ? (
        <p className="text-sm text-gray-500">Không có chủ đề nào.</p>
      ) : (
        <div className="space-y-3">
          {contributionTags.map((topic) => (
            <div
              key={topic.heritageId}
              className="flex items-center justify-between py-2 px-2 rounded cursor-pointer hover:bg-gray-50"
            >
              {/* Heritage tag style */}
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                {topic.heritageName}
              </span>

              {/* Count in circle */}
              <span className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full">
                +{topic.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingTopics;
