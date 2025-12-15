
import { motion } from "framer-motion";

interface BattleCardProps {
  isSearching: boolean;
  isWaitingFriend: boolean;
  avatar?: string;
  name?: string;
  isResult?: boolean;
  score?: number;
  isOpponent?: boolean;
  bonus?: number;
}

const BattleCard: React.FC<BattleCardProps> = ({
  isSearching,
  isWaitingFriend,
  avatar,
  name,
  isResult,
  score,
  isOpponent,
  bonus
}) => {
  let statusText = isSearching
    ? "Đang tìm trận"
    : isWaitingFriend
    ? "Đang chờ bạn"
    : "Sẵn sàng";

  if (isResult) {
    statusText = isOpponent ? "Đối thủ" : "Bạn";
  }

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
      <div className="relative w-full max-w-none sm:max-w-[720px] flex-grow mx-auto">

        {/* Decorative top element */}
        

        {/* Main Card */}
        <div className="bg-gradient-to-br from-primary to-secondary shadow-lg rounded-3xl p-8 shadow-2xl border-4 border-[#cfa86a]/30 relative overflow-hidden">
          {/* Corner borders */}
          <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[#cfa86a]/40"></div>
          <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-[#cfa86a]/40"></div>
          <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-[#cfa86a]/40"></div>
          <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[#cfa86a]/40"></div>

          {/* Header Label */}
          <div className="text-center mb-8">
            <div className="inline-block px-6 py-2 border-2 border-[#cfa86a]/60 rounded-sm">
              <span className="text-[#cfa86a] text-xs font-serif tracking-widest uppercase" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                {statusText}
              </span>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative w-40 h-40">
              {/* BONUS BADGE */}
{isResult && bonus! > 0 && !isOpponent && (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.25 }}
    className="
      absolute -top-3 -right-3 
      w-14 h-14 
      rounded-full 
      bg-gradient-to-br from-[#f3d9a6] to-[#d4ab6a]
      border-2 border-white/70
      shadow-xl 
      flex items-center justify-center
      z-40
    "
  >
    <span
      className="text-[#8b5e2e] font-bold text-[18px] drop-shadow-sm"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      +{bonus}
    </span>

    {/* Glow */}
    <div className="absolute inset-0 rounded-full bg-[#cfa86a]/40 blur-xl -z-10"></div>
  </motion.div>
)}

              {/* Outer gold ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d8b981] via-[#cfa86a] to-[#b68e5e] p-1 shadow-lg">
                {/* Inner blur ring */}
                <div className="absolute inset-1 rounded-full bg-white/10 backdrop-blur-sm"></div>

                {/* Avatar image */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#f7eddc] to-[#e5cfa4] overflow-hidden flex items-center justify-center">
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

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-[#cfa86a]/20 blur-xl -z-10"></div>
            </div>
          </div>
          {isResult && score != null && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex justify-center relative -mt-8 mb-8 z-30"
  >
    <div className="absolute -top-6 flex justify-center w-full">
      <div className="px-4 py-2.5 border-2 border-[#cfa86a]/60 rounded-2xl bg-white/70 backdrop-blur-md shadow-md">
        <span className="text-[#cfa86a] text-[13px] font-serif tracking-widest uppercase" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {score} điểm
        </span>
      </div>
    </div>

    {/* Hiệu ứng ánh sáng mờ sau điểm */}
    <div className="absolute -top-6 w-full flex justify-center">
      <div className="w-[140px] h-[50px] bg-[#cfa86a]/30 blur-2xl rounded-full -z-10"></div>
    </div>
  </motion.div>
)}


          {/* Player Name */}
          <h2
  className="
    text-center text-black 
    text-xl sm:text-2xl font-bold mb-3 tracking-wide 
    truncate 
    overflow-hidden 
    text-ellipsis 
    max-w-[160px] sm:max-w-[160px] 
    mx-auto
  "
  title={name}
>
  {name}
</h2>


          {/* Decorative Dots */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-1 h-1 bg-[#cfa86a]/60 rounded-full"></div>
            <div className="w-1 h-1 bg-[#cfa86a]/60 rounded-full"></div>
            <div className="w-1 h-1 bg-[#cfa86a]/60 rounded-full"></div>
          </div>

          {/* Bottom Triangle */}
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#cfa86a]/50"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BattleCard;
