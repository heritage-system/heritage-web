const DiscoveryHeritageCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border animate-pulse">
      {/* Image */}
      <div className="w-full h-48 bg-gray-300 rounded-t-xl"></div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date */}
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>

        {/* Title */}
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>

        {/* Category */}
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>

        {/* Tags */}
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>

        {/* Location */}
        <div className="flex items-start space-x-2 mt-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryHeritageCardSkeleton;
