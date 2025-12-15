const VRTourCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Thumbnail */}
      <div className="w-full h-48 bg-gray-300"></div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>

        {/* Description lines */}
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>

        {/* Location */}
        <div className="h-4 bg-gray-300 rounded w-1/2 mt-3"></div>

        {/* Button */}
        <div className="h-10 bg-gray-300 rounded-lg w-full mt-4"></div>
      </div>
    </div>
  );
};

export default VRTourCardSkeleton;
