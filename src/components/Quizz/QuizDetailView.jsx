import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Award, 
  Star,
  Download,
  Printer,
  Share2,
  CheckCircle,
  FileText,
  Calendar,
  User,
  Target,
  Timer,
  BookOpen,
  Eye,
  Heart,
  ArrowLeft,
  ArrowRight,
  Send
} from 'lucide-react';

const TestView = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [essayAnswers, setEssayAnswers] = useState({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const test = {
    id: 1,
    title: "Bí Mật Hoàng Thành Huế",
    subtitle: "Bài kiểm tra kiến thức về Di sản văn hóa thế giới",
    subject: "Lịch sử - Văn hóa",
    level: "Trung bình",
    duration: "45 phút",
    totalQuestions: 20,
    totalMarks: 100,
    passMarks: 60,
    creator: "ThS. Nguyễn Văn Minh",
    school: "Trường THPT Chuyên Lê Quý Đôn",
    date: "Ngày 15 tháng 01 năm 2025",
    instructions: [
      "Thời gian làm bài: 45 phút",
      "Bài thi gồm 20 câu hỏi trắc nghiệm và tự luận",
      "Học sinh không được sử dụng tài liệu",
      "Làm bài trên giấy thi hoặc máy tính",
      "Nộp bài đúng thời gian quy định"
    ],
    stats: {
      views: "2.3K",
      downloads: "156",
      rating: 4.8,
      difficulty: "Trung bình"
    }
  };

  const questions = [
    {
      id: 1,
      type: "multiple",
      question: "Hoàng thành Huế được UNESCO công nhận là Di sản Văn hóa Thế giới vào năm nào?",
      options: ["1992", "1993", "1994", "1995"],
      correct: 1,
      points: 2,
      explanation: "UNESCO đã công nhận Quần thể di tích Cố đô Huế là Di sản Văn hóa Thế giới vào năm 1993."
    },
    {
      id: 2,
      type: "multiple",
      question: "Triều đại Nguyễn trị vì Việt Nam trong khoảng thời gian nào?",
      options: ["1802 - 1945", "1800 - 1940", "1804 - 1945", "1802 - 1954"],
      correct: 0,
      points: 2,
      explanation: "Triều đại Nguyễn cai trị từ năm 1802 (vua Gia Long lên ngôi) đến năm 1945 (vua Bảo Đại thoái vị)."
    },
    {
      id: 3,
      type: "multiple",
      question: "Cung điện nào là nơi ở chính của hoàng gia trong Đại Nội Huế?",
      options: ["Cung Kiến Trung", "Cung Cần Chánh", "Cung Thái Hòa", "Cung Diên Thọ"],
      correct: 1,
      points: 2,
      explanation: "Cung Cần Chánh là cung điện chính, nơi hoàng đế xử lý công việc triều chính hàng ngày."
    },
    {
      id: 4,
      type: "multiple",
      question: "Sông nào chảy qua thành phố Huế và được mệnh danh là 'Sông Hương'?",
      options: ["Sông Perfume", "Sông An Cựu", "Sông Hương Giang", "Cả A và C"],
      correct: 3,
      points: 2,
      explanation: "Sông Hương (tiếng Việt) hay Perfume River (tiếng Anh) đều chỉ cùng một dòng sông."
    },
    {
      id: 5,
      type: "multiple",
      question: "Lăng tẩm nào của các vua Nguyễn được coi là đẹp nhất?",
      options: ["Lăng Gia Long", "Lăng Minh Mạng", "Lăng Tự Đức", "Lăng Khải Định"],
      correct: 2,
      points: 2,
      explanation: "Lăng Tự Đức được đánh giá là đẹp nhất với kiến trúc hài hòa giữa tự nhiên và nhân tạo."
    },
    {
      id: 6,
      type: "essay",
      question: "Trình bày về ý nghĩa lịch sử và giá trị văn hóa của Quần thể di tích Cố đô Huế đối với dân tộc Việt Nam. (10 điểm)",
      points: 10,
      suggestion: "Gợi ý: Nêu vai trò của Huế như kinh đô phong kiến cuối cùng, giá trị kiến trúc cung đình, di sản phi vật thể như âm nhạc cung đình, ảnh hưởng đến văn hóa Việt Nam..."
    },
    {
      id: 7,
      type: "essay",
      question: "Phân tích các yếu tố kiến trúc độc đáo của Hoàng thành Huế. Tại sao kiến trúc này được đánh giá cao trên thế giới? (8 điểm)",
      points: 8,
      suggestion: "Gợi ý: Bố cục theo phong thủy, sự kết hợp kiến trúc Đông - Tây, nghệ thuật trang trí, vật liệu xây dựng địa phương..."
    },
    {
      id: 8,
      type: "multiple",
      question: "Cửa chính vào Hoàng thành Huế mang tên gì?",
      options: ["Cửa Ngọ Môn", "Cửa Hiển Nhơn", "Cửa Thể Nhân", "Cửa Hòa Bình"],
      correct: 0,
      points: 2,
      explanation: "Ngọ Môn (Cửa Ngọ Môn) là cổng chính và quan trọng nhất của Hoàng thành."
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleEssayChange = (questionId, value) => {
    setEssayAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowSubmitModal(false);
    setShowAnswers(true);
  };

  const getAnsweredCount = () => {
    const multipleChoiceAnswered = Object.keys(selectedAnswers).length;
    const essayAnswered = Object.keys(essayAnswers).filter(key => essayAnswers[key]?.trim()).length;
    return multipleChoiceAnswered + essayAnswered;
  };

  const calculateScore = () => {
    let score = 0;
    let total = 0;
    
    questions.forEach(q => {
      if (q.type === 'multiple') {
        total += q.points;
        if (selectedAnswers[q.id] === q.correct) {
          score += q.points;
        }
      }
    });
    
    return { score, total, percentage: Math.round((score / total) * 100) };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Quay lại danh sách
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Test Header - Compact Version */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
            <p className="text-gray-600">{test.subtitle}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ làm bài</span>
              <span>{getAnsweredCount()}/{questions.length} câu</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Câu trước
            </button>

            <div className="text-center">
              <span className="text-lg font-semibold text-gray-900">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentQuestionIndex === questions.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Câu sau
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <span className="bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded-lg">
                {currentQuestionIndex + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentQuestion.type === 'multiple' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {currentQuestion.type === 'multiple' ? 'Trắc nghiệm' : 'Tự luận'}
                  </span>
                  <span className="text-sm font-medium text-purple-600">
                    {currentQuestion.points} điểm
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>
            </div>
          </div>

          {currentQuestion.type === 'multiple' ? (
            <div className="space-y-3 ml-16">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[currentQuestion.id] === optionIndex;
                const isCorrect = optionIndex === currentQuestion.correct;
                const showResult = showAnswers && isSubmitted;
                
                let optionClass = "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ";
                
                if (showResult && isCorrect) {
                  optionClass += "border-green-500 bg-green-50 text-green-800";
                } else if (showResult && isSelected && !isCorrect) {
                  optionClass += "border-red-500 bg-red-50 text-red-800";
                } else if (isSelected) {
                  optionClass += "border-blue-500 bg-blue-50 text-blue-800";
                } else {
                  optionClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
                }

                return (
                  <div
                    key={optionIndex}
                    className={optionClass}
                    onClick={() => !isSubmitted && handleAnswerSelect(currentQuestion.id, optionIndex)}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 font-bold text-sm ${
                      showResult && isCorrect
                        ? 'border-green-500 bg-green-500 text-white'
                        : showResult && isSelected && !isCorrect
                        ? 'border-red-500 bg-red-500 text-white'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-400'
                    }`}>
                      {String.fromCharCode(65 + optionIndex)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                );
              })}
              
              {showAnswers && isSubmitted && currentQuestion.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Giải thích:</p>
                      <p className="text-blue-800">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-16 space-y-4">
              <textarea
                value={essayAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleEssayChange(currentQuestion.id, e.target.value)}
                disabled={isSubmitted}
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Nhập câu trả lời của bạn..."
              />
              {currentQuestion.suggestion && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">{currentQuestion.suggestion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Đã trả lời {getAnsweredCount()}/{questions.length} câu hỏi
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center mx-auto"
              >
                <Send className="w-5 h-5 mr-2" />
                Nộp bài
              </button>
            </div>
          </div>
        )}

        {/* Score Summary */}
        {isSubmitted && showAnswers && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Kết quả bài thi</h3>
            {(() => {
              const result = calculateScore();
              return (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-1">{result.score}/{result.total}</p>
                    <p className="text-gray-600">Điểm trắc nghiệm</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-3xl font-bold mb-1 ${
                      result.percentage >= 60 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.percentage}%
                    </p>
                    <p className="text-gray-600">Phần trăm đạt được</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xl font-bold mb-1 ${
                      result.percentage >= 60 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.percentage >= 60 ? 'Đạt' : 'Chưa đạt'}
                    </p>
                    <p className="text-gray-600">Kết quả</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận nộp bài</h3>
            <p className="text-gray-600 mb-6">
              Bạn đã trả lời {getAnsweredCount()}/{questions.length} câu hỏi. 
              Bạn có chắc chắn muốn nộp bài không?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestView;