import { 
  Trophy,
} from 'lucide-react';
import Achievements from './Achievements';



const AchievementSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Hệ thống thành tích
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Thu thập huy hiệu và thành tích khi hoàn thành các thử thách
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Achievements.map((achievement, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">{achievement.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
              <p className="text-blue-100 text-sm mb-4">{achievement.description}</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
              <p className="text-white text-sm mt-2">{achievement.progress}% hoàn thành</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center mx-auto">
            <Trophy className="w-5 h-5 mr-2" />
            Xem tất cả thành tích
          </button>
        </div>
      </div>
    </section>
  );
};

export default AchievementSection;