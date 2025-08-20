
import LearningHero from "../../components/Quizz/LearningHero";
import QuizFilter from "../../components/Quizz/QuizFilter";
import QuizGrid from "../../components/Quizz/QuizGrid";
import InteractiveFeaturesSection from "../../components/Quizz/InteractiveFeaturesSection";
import AchievementSection from "../../components/Quizz/AchievementSection";
import LearningStatsSection from "../../components/Quizz/LearningStatsSection";

// Main Learning Page Component
const QuizzPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LearningHero />
      <QuizFilter />
      <QuizGrid />
      <InteractiveFeaturesSection />
      <AchievementSection />
      <LearningStatsSection />
    </div>
  );
};

export default QuizzPage;