import React from 'react';

interface QuizItem {
  title: string;
  score: number;
  total: number;
  date: string;
}

const mockQuiz: QuizItem[] = [
  { title: "Quiz Văn hóa miền Bắc", score: 8, total: 10, date: "01/06/2025" },
  { title: "Quiz Ẩm thực Việt", score: 7, total: 10, date: "15/05/2025" },
  { title: "Quiz Lịch sử Việt Nam", score: 9, total: 10, date: "28/04/2025" },
  { title: "Quiz Di sản thế giới", score: 6, total: 10, date: "12/04/2025" },
];

const QuizSection: React.FC = () => {
  const renderEmptyState = (icon: string, title: string, description: string) => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="text-8xl mb-6 animate-bounce">{icon}</div>
      <div className="text-xl font-semibold mb-3 text-gray-600">{title}</div>
      <div className="text-sm text-center max-w-md">{description}</div>
    </div>
  );

  const renderQuizItem = (item: QuizItem, idx: number) => {
    const scorePercent = (item.score / item.total) * 100;
    const getScoreColor = () => {
      if (scorePercent >= 80) return { 
        bg: "bg-yellow-100", 
        text: "text-yellow-700", 
        border: "border-yellow-300",
        darkBg: "bg-yellow-200"
      };
      if (scorePercent >= 60) return { 
        bg: "bg-amber-100", 
        text: "text-amber-700", 
        border: "border-amber-300",
        darkBg: "bg-amber-200"
      };
      return { 
        bg: "bg-orange-100", 
        text: "text-orange-700", 
        border: "border-orange-300",
        darkBg: "bg-orange-200"
      };
    };
    
    const colors = getScoreColor();

    return (
      <div
        key={idx}
        className={`bg-white p-6 rounded-3xl border border-gray-100 hover:${colors.border} hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-3xl">📝</span>
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-gray-800 group-hover:${colors.text} transition-colors duration-200 text-lg mb-2`}>
                {item.title}
              </h4>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 ${colors.darkBg} ${colors.text} rounded-full font-bold text-lg`}>
                  {item.score}/{item.total} điểm
                </div>
                <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  <span className="mr-1">📅</span>{item.date}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  scorePercent >= 80 ? "bg-yellow-100 text-yellow-700" :
                  scorePercent >= 60 ? "bg-amber-100 text-amber-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {scorePercent >= 80 ? "🏆 Xuất sắc" : scorePercent >= 60 ? "👍 Khá" : "📚 Cần cải thiện"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className={`px-4 py-2 ${colors.bg} hover:opacity-80 ${colors.text} rounded-xl transition-all duration-200 text-sm font-semibold group-hover:scale-105`}>
              <span className="mr-2">📊</span>Chi tiết kết quả
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 text-sm font-semibold">
              <span className="mr-2">🔄</span>Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-black mb-3 flex items-center gap-3">
            <span className="text-4xl">📝</span>
            Lịch sử quiz
          </h2>
          <p className="text-gray-700 text-lg">Kết quả các bài kiểm tra kiến thức</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-yellow-300/50 shadow-lg">
            <div className="text-3xl font-bold text-yellow-700">{mockQuiz.length}</div>
            <div className="text-sm text-yellow-600 font-medium">Bài quiz</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-amber-300/50 shadow-lg">
            <div className="text-3xl font-bold text-amber-700">7.5</div>
            <div className="text-sm text-amber-600 font-medium">Điểm TB</div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {mockQuiz.length === 0 ? 
          renderEmptyState("📝", "Chưa có bài quiz nào", "Hãy thử sức với các câu hỏi thú vị!") :
          mockQuiz.map(renderQuizItem)
        }
      </div>
    </div>
  );
};

export default QuizSection;