
import LearningHero from "../../components/Quizz/LearningHero";
import QuizFilter from "../../components/Quizz/QuizFilter";
import QuizGrid from "../../components/Quizz/QuizGrid";
import AchievementSection from "../../components/Quizz/AchievementSection";

// Main Learning Page Component
const QuizzPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LearningHero />
      <QuizFilter />
      <QuizGrid />
      <AchievementSection />
    </div>
  );
};

export default QuizzPage;