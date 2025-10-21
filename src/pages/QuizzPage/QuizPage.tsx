import { useState } from "react";
import AchievementSection from "../../components/Quizz/AchievementSection";
import PlayerInfoCard from "../../components/Quizz/PlayerInfoCard";
import LearningHero from "../../components/Quizz/LearningHero";
import QuizGrid from "../../components/Quizz/QuizGrid";
import ModeSelection from "../../components/Quizz/ModeSelection";
import { Dice5, PartyPopper, Sparkles, Landmark } from "lucide-react";
import RandomBattle from "../../components/Quizz/RandomBattle";
import FriendsBattle from "../../components/Quizz/FriendsBattle";
import { useAuth } from '../../hooks/useAuth';
const QuizzPage = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      key: "le",
      title: "Phần Lễ",
      desc: "Khám phá tín ngưỡng, nghi lễ, phong tục cổ truyền",
      icon: <Landmark className="w-8 h-8 text-yellow-700" />,
      color: "from-yellow-100 to-yellow-200 border-yellow-400",
      activeColor: "from-yellow-500 to-amber-600 text-white",
    },
    {
      key: "hoi",
      title: "Phần Hội",
      desc: "Thử sức với trò chơi dân gian và lễ hội sôi động",
      icon: <PartyPopper className="w-8 h-8 text-red-600" />,
      color: "from-red-100 to-red-200 border-red-400",
      activeColor: "from-red-600 to-pink-700 text-white",
    },
    {
      key: "mix",
      title: "Hỗn hợp",
      desc: "Kết hợp cả phần Lễ và Hội — đa dạng và thú vị",
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      color: "from-purple-100 to-indigo-200 border-purple-400",
      activeColor: "from-indigo-600 to-purple-700 text-white",
    },
  ];
  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <LearningHero />

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mt-5 grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-7">
          {!selectedMode && (
            <ModeSelection onModeSelect={(mode) => setSelectedMode(mode)} />
          )}

          {/* === SOLO MODE === */}
          {selectedMode === "solo" && (
            <div className="p-6 bg-white rounded-xl shadow space-y-6">
              <h3 className="text-2xl font-semibold">Chọn lễ hội để chơi</h3>
              <button
                onClick={() => setSelectedMode(null)}
                className="mt-2 px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                ← Quay lại
              </button>
              <QuizGrid />
            </div>
          )}

          {/* === 1VS1 RANDOM === */}
          {selectedMode === "random" && (
            <RandomBattle name={userName || undefined} avatar={avatarUrl || undefined} onBack={() => setSelectedMode(null)} />
          )}

          {/* === FRIENDS MODE === */}
          {selectedMode === "friends" && (
            <FriendsBattle onBack={() => setSelectedMode(null)} />
          )}
        </div>

        {/* RIGHT */}
        {/* <div className="lg:col-span-2">
          <PlayerInfoCard name={userName || undefined} avatar={avatarUrl || undefined}/>
        </div> */}
      </section>

      {/* ACHIEVEMENTS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <AchievementSection />
      </section>
    </div>
  );
};

export default QuizzPage;
