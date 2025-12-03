import React from "react";

const shimmer = "animate-pulse bg-gray-200 rounded";

const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 border-b pb-8">
      {/* Left side */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Contributor row */}
        <div className="flex items-center mb-3 space-x-2">
          <div className={`w-6 h-6 rounded-full ${shimmer}`} />
          <div className={`w-24 h-4 ${shimmer}`} />
          <div className={`w-4 h-4 ${shimmer}`} />
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className={`h-5 w-3/4 ${shimmer}`} />
          <div className={`h-5 w-5/6 ${shimmer}`} />
        </div>

        {/* First content preview */}
        <div className="space-y-2 mb-4">
          <div className={`h-4 w-full ${shimmer}`} />
          <div className={`h-4 w-4/5 ${shimmer}`} />
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <div className={`h-5 w-14 ${shimmer}`} />
          <div className={`h-5 w-16 ${shimmer}`} />
          <div className={`h-5 w-12 ${shimmer}`} />
        </div>

        {/* Footer */}
        <div className="flex items-center text-xs text-gray-500 mt-auto">
          <div className={`h-3 w-20 ${shimmer}`} />

          <div className="flex items-center space-x-1 ml-4">
            <div className={`h-4 w-4 ${shimmer}`} />
            <div className={`h-3 w-6 ${shimmer}`} />
          </div>

          <div className="flex items-center space-x-1 ml-4">
            <div className={`h-4 w-4 ${shimmer}`} />
            <div className={`h-3 w-6 ${shimmer}`} />
          </div>

          <div className="ml-auto flex items-center space-x-3">
            <div className={`h-5 w-5 ${shimmer}`} />
            <div className={`h-5 w-5 ${shimmer}`} />
            <div className={`h-5 w-5 ${shimmer}`} />
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="self-center">
        <div className={`w-44 h-28 rounded-md ${shimmer}`} />
      </div>
    </div>
  );
};

export default ArticleCardSkeleton;
