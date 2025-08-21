// Community Stats Component
const CommunityStats = () => {
  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 py-10 mt-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
         <div className="text-3xl font-bold text-yellow-600">50+</div>
          <div className="text-sm opacity-90">Thành viên</div>
        </div>
        <div>
           <div className="text-3xl font-bold text-red-700">150+</div>
          <div className="text-sm opacity-90">Workshop</div>
        </div>
        <div>
         <div className="text-3xl font-bold text-amber-900">45</div>
          <div className="text-sm opacity-90">Đang diễn ra</div>
        </div>
        <div>
         <div className="text-3xl font-bold text-orange-900">98%</div>
          <div className="text-sm opacity-90">Hài lòng</div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;
