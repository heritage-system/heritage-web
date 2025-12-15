import { Gamepad2, Sparkles } from 'lucide-react';

// Main Components
const LearningHero = () => {
  return (
    <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-amber-700 font-medium tracking-widest uppercase">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Chinh phục kiến thức lễ hội</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900">Thử tài</span> cùng trò chơi Lễ Hội         
          </h1>

          <p className="text-gray-600 text-lg max-w-md mx-auto lg:mx-0">
            Cùng bước vào thế giới lễ hội Việt Nam — nơi kiến thức, tốc độ và
            sự may mắn hòa quyện. Hãy sẵn sàng thi đấu với người chơi khác để
            khẳng định bản lĩnh!
          </p>

          <div className="flex justify-center lg:justify-start pt-4">
            
              <button
            onClick={() => window.scrollTo({top: window.innerHeight * 0.5, behavior: "smooth" })}
            className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-amber-200 shadow-md rounded-full px-8 py-3 transition hover:scale-105"
          >
            <Gamepad2 className="w-6 h-6 text-amber-600" />
            <span className="text-amber-700 font-medium tracking-wide">
              Bắt đầu ngay
            </span>
          </button>
          </div>
        </div>
  );
};

export default LearningHero;
