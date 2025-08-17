
// Community Stats Component
const CommunityStats = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">2.5K+</div>
          <div className="text-sm opacity-90">Thành viên</div>
        </div>
        <div>
          <div className="text-2xl font-bold">150+</div>
          <div className="text-sm opacity-90">Workshop</div>
        </div>
        <div>
          <div className="text-2xl font-bold">45</div>
          <div className="text-sm opacity-90">Đang diễn ra</div>
        </div>
        <div>
          <div className="text-2xl font-bold">98%</div>
          <div className="text-sm opacity-90">Hài lòng</div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;