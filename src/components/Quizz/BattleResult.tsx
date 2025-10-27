import { motion } from "framer-motion";
import { Trophy, Crown, Medal, ArrowLeft, Flame, Frown } from "lucide-react";
import BattleCardV1 from "./BattleCard";

interface BattleResultProps {
  player: { id: string; name: string; avatar: string };
  opponent: { id: string; name: string; avatar: string };
  playerScore: number;
  opponentScore: number;
  onFinish: () => void;
}

const BattleResult: React.FC<BattleResultProps> = ({
  player,
  opponent,
  playerScore,
  opponentScore,
  onFinish,
}) => {
  const playerWon = playerScore > opponentScore;
  const isDraw = playerScore === opponentScore;

  const winner = playerWon ? player : isDraw ? null : opponent;
  const loser = playerWon ? opponent : isDraw ? null : player;

  const isPlayerViewWinner = playerWon;
  const isPlayerViewLoser = !isDraw && !playerWon;

  const message = isDraw
    ? "Trận đấu thật ngang tài ngang sức!"
    : isPlayerViewWinner
    ? "Chúc mừng! Bạn đã giành chiến thắng ngoạn mục!"
    : "Tiếc quá! Bạn đã thua, nhưng sẽ trở lại mạnh mẽ hơn!";

  const subMessage = isDraw
    ? "Không ai thua cả, chỉ có hai người cùng tiến bộ"
    : isPlayerViewWinner
    ? "Tinh thần chiến đấu tuyệt vời, hãy tiếp tục giữ phong độ nhé!"
    : "Hãy luyện tập thêm một chút, lần sau phục thù vinh quang nhé!";

  return (
    <motion.div
      className="bg-dragon min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
    
     
      {/* 🏆 Biểu tượng trung tâm */}
      {/* <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        {isDraw ? (
          <Medal className="w-20 h-20 text-yellow-400 drop-shadow-xl mx-auto" />
        ) : playerWon ? (
          <Trophy className="w-20 h-20 text-yellow-500 drop-shadow-xl mx-auto" />
        ) : (
          <Flame className="w-20 h-20 text-red-500 drop-shadow-xl mx-auto" />
        )}
      </motion.div> */}

      {/* 🎖️ Tiêu đề */}
      {/* <motion.h2
        className="text-5xl leading-[1.3] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-600 drop-shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {isDraw
          ? "Trận đấu hòa!"
          : isPlayerViewWinner
          ? "Bạn là người chiến thắng!"
          : "Thua một trận, học được một điều!"}
      </motion.h2> */}

      

      {/* 👑 Thẻ người thắng hoặc cả hai nếu hòa */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
        {isDraw ? (
          <>
            {[player, opponent].map((p) => (
              <div key={p.id} className="relative flex flex-col items-center max-w-[240px]">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-8 bg-yellow-400 p-2 rounded-full shadow-lg z-10"
                >
                  <Crown className="w-8 h-8 text-white drop-shadow-md" />
                </motion.div>
                <BattleCardV1
                  name={p.name}
                  isSearching = {false}
                  isWaitingFriend = {false}
                  isResult = {true}
                  avatar={p.avatar}
                  score={p.id === player.id ? playerScore : opponentScore}                 
                  isOpponent={p.id === opponent.id}
                />
              </div>
            ))}
          </>
        ) : (
          winner && (
            <div className="relative flex flex-col items-center max-w-[240px]">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-8 bg-yellow-400 p-2 rounded-full shadow-lg z-10"
              >
                <Crown className="w-8 h-8 text-white drop-shadow-md" />
              </motion.div>

              <BattleCardV1
                name={winner.name}
                avatar={winner.avatar}
                score={winner.id === player.id ? playerScore : opponentScore}
                 isSearching = {false}
                  isWaitingFriend = {false}
                  isResult = {true}
                isOpponent={winner.id === opponent.id}
              />
            </div>
          )
        )}
      </div>

      {/* 💬 Thông điệp */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-800 text-lg max-w-xl mx-auto leading-relaxed mt-3"
      >
        {message}
      </motion.p>
      <p className="text-gray-600 text-sm mt-2 italic">{subMessage}</p>

      {/* 🔙 Nút quay lại */}
      <motion.button
        onClick={onFinish}
        className={`mt-5 px-8 py-3 rounded-xl font-semibold text-white hover:shadow-lg hover:scale-105 transition flex items-center gap-2 ${
          isPlayerViewWinner
            ? "bg-gradient-to-r from-amber-500 to-red-600"
            : "bg-gradient-to-r from-gray-500 to-gray-700"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại sảnh đấu
      </motion.button>  
    </motion.div>
  );
};

export default BattleResult;
