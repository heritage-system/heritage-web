
const LearningStatsSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Thống kê học tập
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Con số ấn tượng từ cộng đồng học tập di sản VTFP
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">25,000+</div>
            <div className="text-gray-600">Lượt chơi quiz</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">15,000+</div>
            <div className="text-gray-600">Người chơi active</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">92%</div>
            <div className="text-gray-600">Tỷ lệ hoàn thành</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">50+</div>
            <div className="text-gray-600">Quiz đa dạng</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile App</h3>
            <p className="text-gray-600 mb-4">Học mọi lúc, mọi nơi với ứng dụng di động</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Tải xuống
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Leaderboard</h3>
            <p className="text-gray-600 mb-4">Cạnh tranh với bạn bè và cộng đồng</p>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Xem bảng xếp hạng
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Game Mode</h3>
            <p className="text-gray-600 mb-4">Nhiều chế độ chơi thú vị và thách thức</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Khám phá
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningStatsSection;