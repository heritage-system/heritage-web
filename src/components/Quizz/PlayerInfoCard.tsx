// components/Quizz/PlayerInfoCard.tsx
import { Trophy, LogOut } from "lucide-react";

interface PlayerCardProps {
  name?: string;
  avatar?: string;
  score?: number;
  waiting?: boolean;
}
const PlayerInfoCardBattle: React.FC<PlayerCardProps> = ({
  name,
  avatar,
  score,
  waiting,
}) => {
 
  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
      {/* Avatar + Username */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
          alt="avatar"
          className="w-20 h-20 rounded-full border-4 border-white mb-3"
        />
        <h2 className="text-xl font-bold">{name}</h2>
        <button className="mt-2 bg-white/20 hover:bg-white/30 text-sm px-3 py-1 rounded-full flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Leaderboard
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">120</div>
          <div className="text-sm opacity-80">Games</div>
        </div>
        <div>
          <div className="text-2xl font-bold">89%</div>
          <div className="text-sm opacity-80">Winrate</div>
        </div>
        <div>
          <div className="text-2xl font-bold">540</div>
          <div className="text-sm opacity-80">Points</div>
        </div>
        <div>
          <div className="text-2xl font-bold">4.8★</div>
          <div className="text-sm opacity-80">Rating</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfoCardBattle;
