import { useState } from "react";
import AchievementSection from "../../components/Quizz/AchievementSection";
import RandomBattle from "../../components/Quizz/RandomBattle";
import { useAuth } from "../../hooks/useAuth";
import { Sparkles, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizzPage = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 flex flex-col items-center">
      {/* === HERO / INTRO SECTION === */}
      <section className="w-full max-w-5xl text-center px-6 py-16 space-y-6">
        <div className="inline-flex items-center justify-center gap-2 text-amber-700 font-medium tracking-widest uppercase">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Chinh phục kiến thức lễ hội</span>
        </div>

        <h1 className="text-5xl md:text-4xl font-bold text-gray-800 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900">Thử tài</span>{" "}
          cùng trò chơi đố vui{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900">
            Lễ hội
          </span>
        </h1>

        <p className="text-gray-600 text-lg max-w-2xl mx-auto text-3xl">
          Bước vào hành trình tri thức lễ hội Việt Nam — nơi kiến thức, tốc độ và
          sự may mắn hòa quyện. Hãy sẵn sàng đối đầu với người chơi khác để khẳng định bản lĩnh!
        </p>

        <div className="flex justify-center pt-4">
          <button
            onClick={() =>
              isLoggedIn
                ? window.scrollTo({
                    top: window.innerHeight * 0.47,
                    behavior: "smooth",
                  })
                : navigate("/login")
            }
            className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-amber-200 shadow-md rounded-full px-8 py-3 transition hover:scale-105"
          >
            <Gamepad2 className="w-6 h-6 text-amber-600" />
            <span className="text-amber-700 font-medium tracking-wide">
              {isLoggedIn ? "Bắt đầu ngay" : "Đăng nhập ngay"}
            </span>
          </button>
        </div>
      </section>

      {/* === QUIZ GAME SECTION === */}
      {isLoggedIn && (
        <section className="w-full bg-gradient-to-b from-amber-50 via-orange-50/30 to-rose-50 pb-16">
          <RandomBattle
            name={userName || undefined}
            avatar={avatarUrl || undefined}
            onBack={() => setSelectedMode(null)}
          />
        </section>
      )}
    </div>
  );
};

export default QuizzPage;
