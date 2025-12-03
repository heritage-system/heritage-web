const QuizCardSkeleton = () => {
  return (
    <div className="bg-gray-200 rounded-2xl shadow animate-pulse overflow-hidden">
      <div className="w-full h-48 bg-gray-300"></div>

      <div className="p-6 space-y-4">

        {/* Title */}
        <div className="h-5 w-3/4 bg-gray-300 rounded"></div>

        {/* Progress bar */}
        <div className="bg-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Button */}
        <div className="h-10 w-full bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  );
};

export default QuizCardSkeleton;
