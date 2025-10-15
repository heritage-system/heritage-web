import { Gamepad2 } from 'lucide-react';

// Main Components
const LearningHero = () => {
  return (
    <section className="bg-white pt-10 pb-2">
      <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 bg-clip-text text-transparent">
  Cộng đồng
</span> Di sản Văn hóa  
          </h1>
          <p className="text-gray-600 text-lg">Kết nối, học hỏi và chia sẻ cùng cộng đồng yêu văn hóa truyền thống</p>
        </div>

      
        <div className="mb-2">
          <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 py-10 mt-10">
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
        </div>
    </section>
  );
};

export default LearningHero;
