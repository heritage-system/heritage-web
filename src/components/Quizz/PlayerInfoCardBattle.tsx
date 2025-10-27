import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";

interface BattleCardProps {
  avatar?: string;
  name?: string;
  score?: number;
  timeLeft?: number;
  maxTime?: number;
  isOpponent?: boolean;
  answered?: boolean;
}

const PlayerInfoCardBattle: React.FC<BattleCardProps> = ({
  avatar,
  name = "Người chơi",
  score = 0,
  timeLeft = 0,
  maxTime = 10,
  isOpponent = false,
}) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, (timeLeft / maxTime) * 100);
  const dashOffset = circumference - (progress / 100) * circumference;

  const themeColor = isOpponent ? "#ef4444" : "#10b981"; // đỏ / xanh lá
  const statusText = isOpponent ? "Đối thủ" : "Bạn";

  return (
    <motion.div
      key="battle-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center gap-8"
    >
      {/* === CARD CONTAINER === */}
      <div className="relative w-full max-w-none sm:max-w-[420px] mx-auto">
        <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 shadow-lg rounded-3xl p-8 border-2 border-[#cfa86a]/40 relative overflow-hidden">
          {/* === Corner borders === */}
          <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[#cfa86a]/40"></div>
          <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-[#cfa86a]/40"></div>
          <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-[#cfa86a]/40"></div>
          <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[#cfa86a]/40"></div>

          {/* === Header Label === */}
          <div className="text-center mb-6">
            <div className="inline-block px-6 py-2 border border-[#cfa86a]/60 rounded-sm bg-white/50 backdrop-blur-sm">
              <span className="text-[#cfa86a] text-xs tracking-widest font-serif uppercase" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                {statusText}
              </span>
            </div>
          </div>

          {/* === Avatar === */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-28 h-28 sm:w-40 sm:h-40">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d8b981] via-[#cfa86a] to-[#b68e5e] p-[3px] sm:p-1 shadow-lg">
                <div className="absolute inset-[6px] sm:inset-2 rounded-full bg-gradient-to-br from-[#f7eddc] to-[#e5cfa4] overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      avatar ||
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Player"
                    }
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>


          {/* === Player Name === */}
          <h2
            className="
              text-center text-black 
              text-xl sm:text-2xl font-bold mb-3 tracking-wide 
              truncate max-w-[160px] sm:max-w-none mx-auto
            "
            title={name} // để hover hiện tooltip đầy đủ trên desktop
          >
            {name}
          </h2>


          {/* === TIMER + SCORE (giống cấu trúc PlayerInfoCard) === */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative flex justify-center items-center mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                {/* background circle */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                {/* animated progress */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke={themeColor}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 0.2, ease: "linear" }}
                  style={{
                    strokeDasharray: circumference,
                    filter: `drop-shadow(0 0 8px ${themeColor}80)`,
                  }}
                />
              </svg>

              {/* Score */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{score}</span>
                <span className="text-xs text-gray-500">điểm</span>
              </div>
            </div>

            {/* Thời gian còn lại */}
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Hourglass className="w-3 h-3 text-gray-500" />
              <span>{Math.ceil(timeLeft)}s</span>
            </div>
          </div>

          {/* === Decorative Dots === */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-1 h-1 bg-[#cfa86a]/60 rounded-full"></div>
            <div className="w-1 h-1 bg-[#cfa86a]/60 rounded-full"></div>
            <div className="w-1 h-1 bg-[#cfa86a]/60 rounded-full"></div>
          </div>

          {/* === Bottom Triangle === */}
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#cfa86a]/50"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerInfoCardBattle;
