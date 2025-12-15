import { motion } from "framer-motion";

interface BattleCardProps {
  isSearching: boolean;
  isWaitingFriend: boolean;
  avatar?: string;
  name?: string;
}

const BattleCard: React.FC<BattleCardProps> = ({
  isSearching,
  isWaitingFriend,
  avatar,
  name,
}) => {
  return (
    <motion.div
      key="battle-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative"
    >
      {/* MAIN TRAPEZOID CARD */}
      <div className="relative w-[280px] h-[420px]">
        <svg viewBox="0 0 380 620" className="absolute inset-0" preserveAspectRatio="none">
          <defs>
            {/* Gradient for card background */}
            <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
            </linearGradient>

            {/* Glow effect */}
            <filter id="cardGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feFlood floodColor="#f59e0b" floodOpacity="0.3" />
              <feComposite in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Border gradient */}
            <linearGradient id="borderGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Outer glow shape */}
          <path
            d="M50,0 L330,0 L380,80 L380,540 L330,620 L50,620 L0,540 L0,80 Z"
            fill="url(#cardBg)"
            stroke="url(#borderGrad)"
            strokeWidth="2"
            filter="url(#cardGlow)"
          />
        </svg>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          {/* Top status bar */}
          <div className="absolute top-8 left-0 right-0 flex justify-center">
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 px-8 py-2 backdrop-blur-sm border border-amber-400/30">
              <div className="text-xs font-black tracking-[0.4em] text-amber-300 uppercase">
                {isSearching
                  ? "ĐANG TÌM TRẬN"
                  : isWaitingFriend
                  ? "ĐANG CHỜ BẠN BÈ"
                  : "SẴN SÀNG"}
              </div>
            </div>
          </div>

          {/* Avatar section */}
          <div className="relative mt-16">
            {/* Hexagonal frame effect */}
            <div className="absolute inset-0 -m-4">
              <svg viewBox="0 0 160 160" className="w-40 h-40">
                <defs>
                  <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <polygon
                  points="80,10 130,40 130,100 80,130 30,100 30,40"
                  fill="none"
                  stroke="url(#hexGrad)"
                  strokeWidth="3"
                  opacity="0.6"
                />
              </svg>
            </div>

            <img
              src={avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Player"}
              alt="avatar"
              className="relative w-32 h-32 rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)]"
            />
          </div>

          {/* Player name */}
          <div className="mt-6 text-2xl font-bold text-white tracking-wide">
            {name || "Bạn"}
          </div>

          {/* Decorative corner elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-400/40"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-400/40"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-400/40"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-400/40"></div>
        </div>

        {/* Bottom spike/arrow decoration */}
        <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 w-24 h-16">
          <svg viewBox="0 0 100 80" className="w-full h-full">
            <defs>
              <linearGradient id="spikeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
              </linearGradient>
              <filter id="spikeGlow">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            {/* Outer glow */}
            <path d="M20,0 L80,0 L50,60 Z" fill="url(#spikeGrad)" opacity="0.3" filter="url(#spikeGlow)" />
            {/* Main spike */}
            <path d="M25,0 L75,0 L50,55 Z" fill="url(#spikeGrad)" />
            {/* Inner highlight */}
            <path d="M40,0 L60,0 L50,40 Z" fill="#fff" opacity="0.3" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default BattleCard;
