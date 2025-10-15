import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";

interface PlayerCardProps {
  name: string;
  avatar?: string;
  score: number;
  timeLeft: number;
  maxTime: number;
  isOpponent?: boolean;
  answered?: boolean;
}

const PlayerInfoCard: React.FC<PlayerCardProps> = ({
  name,
  avatar,
  score,
  timeLeft,
  maxTime,
  isOpponent = false,
  answered = false,
}) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, (timeLeft / maxTime) * 100);
  const dashOffset = circumference - (progress / 100) * circumference;

  const themeColor = isOpponent ? "#ef4444" : "#10b981"; // đỏ cho đối thủ, xanh cho mình

  return (
    <div
      className={`rounded-2xl p-4 text-center shadow-lg transition-all duration-300 ${
        isOpponent
          ? "bg-gradient-to-br from-red-50 to-pink-100 border border-pink-300"
          : "bg-gradient-to-br from-green-50 to-emerald-100 border border-emerald-300"
      }`}
    >
      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-3">
        <img
          src={
            avatar ||
            "https://api.dicebear.com/7.x/adventurer/svg?seed=player"
          }
          alt="avatar"
          className="w-16 h-16 rounded-full border-4 border-white shadow-md"
        />
        <h2
          className={`text-lg font-semibold mt-2 ${
            isOpponent ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {name}
        </h2>
      </div>

      {/* Circular timer */}
      <div className="relative flex justify-center items-center mt-2 mb-3">
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
            }}
          />
        </svg>

        {/* Score */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{score}</span>
          <span className="text-xs text-gray-500">điểm</span>
        </div>

        {/* Optional: overlay nếu đã trả lời */}
        {/* {answered && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-full">
            <p className="text-sm font-semibold text-gray-700">Đã trả lời</p>
          </div>
        )} */}
      </div>

      {/* Thời gian còn lại */}
       <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
        <Hourglass className="w-3 h-3 text-gray-500" />
        <span>{Math.ceil(timeLeft).toFixed(1)}s</span>
      </div>
    </div>
  );
};

export default PlayerInfoCard;
