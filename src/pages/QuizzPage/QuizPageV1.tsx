import { useState } from "react";
import AchievementSection from "../../components/Quizz/AchievementSection";
import RandomBattleV3 from "../../components/Quizz/RandomBattleV3";
import LearningHero from "../../components/Quizz/LearningHero";
import { useAuth } from "../../hooks/useAuth";
import { Sparkles, Gamepad2 } from "lucide-react";

const QuizPageV1 = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const { userName, avatarUrl } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-rose-50">
     
        {/* === RIGHT SIDE: RANDOM BATTLE === */}
        <div className="flex justify-center">
          <RandomBattleV3
            name={userName || undefined}
            avatar={avatarUrl || undefined}
            onBack={() => setSelectedMode(null)}
          />
        </div>
      
    </div>
  );
};

export default QuizPageV1;
