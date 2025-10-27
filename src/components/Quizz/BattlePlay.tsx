import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PlayerInfoCardBattle from "./PlayerInfoCardBattle";
import BattleResult from "./BattleResult";
import { CheckCircle, Trophy, Feather, Flame, Gem } from "lucide-react";
import * as signalR from "@microsoft/signalr";
import {Question} from "../../types/quiz"


interface BattlePlayProps {
  player: { id: string; name: string; avatar: string };
  opponent: { id: string; name: string; avatar: string };
  roomId: string;
  connection: signalR.HubConnection;
  onFinish?: () => void;
}

const QUESTION_TIME = 10; // giây

const BattlePlay: React.FC<BattlePlayProps> = ({
  player,
  opponent,
  roomId,
  connection,
  onFinish,
}) => {
  // ===== STATE =====
  const [question, setQuestion] = useState<Question | null>(null);
  const [playerAnswer, setPlayerAnswer] = useState<number | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [opponentTimeLeft, setOpponentTimeLeft] = useState(QUESTION_TIME);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [opponentAnswerTime, setOpponentAnswerTime] = useState<number | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  // ===== REF =====
  const playerTimerRef = useRef<number  | null>(null);
  const opponentTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasRequested = useRef(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState(0);
  const readingTimerRef = useRef<number | null>(null);
  // ===== INIT =====
  useEffect(() => {
    if (!connection || !roomId || hasRequested.current) return;
    if (connection && roomId) {
      connection.invoke("RequestCurrentQuestion", roomId).catch(console.error);
      hasRequested.current = true;
    }
  }, [connection, roomId]);

  const handleStartQuestion = (q: any) => {
    console.log("📜 StartQuestion:", q);
    stopAllTimers();

    const readingTime = q.readingDuration || 3;
    const answerTime = q.answerDuration || QUESTION_TIME;

    setQuestion({ ...q, type: "multiple" });
    setPlayerAnswer(null);
    setLocked(false);
    setShowResult(false);
    setOpponentAnswered(false);
    setOpponentAnswerTime(null);
    setTimeLeft(answerTime);
    setOpponentTimeLeft(answerTime);
    setShowOptions(false);
    startTimeRef.current = q.startTimeUtcMs;

    // ✅ Bắt đầu “thời gian đọc”
    setReadingTimeLeft(readingTime);
    startReadingTimer(readingTime, () => {
      setShowOptions(true);
      startTimers(answerTime);
    });
  };


    const startReadingTimer = (duration: number, onComplete: () => void) => {
      const end = Date.now() + duration * 1000;

      const tick = () => {
        const remain = Math.max(0, (end - Date.now()) / 1000);
        setReadingTimeLeft(remain);
        if (remain <= 0) {
          readingTimerRef.current = null;
          onComplete();
        } else {
          readingTimerRef.current = requestAnimationFrame(tick);
        }
      };
      tick();
    };


    const handleRevealAnswer = (data: any) => {
      console.log("✅ RevealAnswer:", data);
      stopAllTimers(); // dừng đồng hồ khi reveal

      setShowResult(true);
      setQuestion((prev) =>
        prev ? { ...prev, correct: data.correctIndex } : prev
      );

      data.scores.forEach((s: any) => {
        if (s.id === player.id) setPlayerScore(s.score);
        else setOpponentScore(s.score);
      });

      // Ẩn highlight sau 1.8s
      setTimeout(() => setShowResult(false), 1800);
    };

    const handleAnswerSubmitted = (data: any) => {
      console.log("📨 AnswerSubmitted:", data);
      data.scores.forEach((s: any) => {
        if (s.id === player.id) setPlayerScore(s.score);
        else setOpponentScore(s.score);
      });

      if (data.playerId === player.id) {
        stopPlayerTimer();
        setLocked(true);
      } else {
        stopOpponentTimer();
        setOpponentAnswered(true);
        setOpponentAnswerTime(data.elapsedTime);
      }
      

      setShowResult(true);
      setTimeout(() => setShowResult(false), 1200);
    };

    const handleGameFinished = (players: any) => {
      console.log("🏁 GameFinished:", players);
      stopAllTimers();
      setIsFinished(true);
    };

    const handleOpponentLeft = () => {
      alert("❌ Đối thủ rời trận");
      onFinish?.();
    };

  // ===== SIGNALR =====
  useEffect(() => {
    if (!connection) return;
    
    connection.on("StartQuestion", handleStartQuestion);
    connection.on("AnswerSubmitted", handleAnswerSubmitted);
    connection.on("GameFinished", handleGameFinished);
    // connection.on("OpponentDisconnected", handleOpponentLeft);

    connection.on("PlayerAnswered", (data) => {
      if (data.playerId === player.id) {
        stopPlayerTimer();
        setLocked(true);
      } else {
        stopOpponentTimer();
        setOpponentAnswered(true);
        setOpponentAnswerTime(data.elapsedTime);
      }
    });


    connection.on("RevealAnswer", handleRevealAnswer);


    return () => {
      stopAllTimers();
      connection.off("StartQuestion", handleStartQuestion);
      connection.off("AnswerSubmitted", handleAnswerSubmitted);
      connection.off("GameFinished", handleGameFinished);
      // connection.off("OpponentDisconnected", handleOpponentLeft);
      connection.off("RevealAnswer", handleRevealAnswer);
    };
  }, []);

  // ===== TIMER =====
  const startTimers = (duration: number) => {
  stopAllTimers();

  const updatePlayerTimer = () => {
    if (locked) return; // bạn đã trả lời thì dừng update
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000 - 3;
    const remain = Math.max(0, QUESTION_TIME - elapsed);
    setTimeLeft(remain);

    if (remain <= 0) {
      stopPlayerTimer();
      handleTimeout();
    } else {
      playerTimerRef.current = requestAnimationFrame(updatePlayerTimer);
    }
  };

  const updateOpponentTimer = () => {
    if (opponentAnswered) return; // đối thủ đã trả lời thì dừng update
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000 - 3;
    const remain = Math.max(0, QUESTION_TIME - elapsed);
    setOpponentTimeLeft(remain);

    if (remain <= 0) {
      stopOpponentTimer();
    } else {
      opponentTimerRef.current = requestAnimationFrame(updateOpponentTimer);
    }
  };

  playerTimerRef.current = requestAnimationFrame(updatePlayerTimer);
  opponentTimerRef.current = requestAnimationFrame(updateOpponentTimer);
};



  const stopPlayerTimer = () => {
  if (playerTimerRef.current) {
    cancelAnimationFrame(playerTimerRef.current);
    playerTimerRef.current = null;
  }
};

const stopOpponentTimer = () => {
  if (opponentTimerRef.current) {
    cancelAnimationFrame(opponentTimerRef.current);
    opponentTimerRef.current = null;
  }
};



  const stopAllTimers = () => {
    stopPlayerTimer();
    stopOpponentTimer();
  };


  // ===== SUBMIT =====
  const handleTimeout = async () => {
    if (locked || !question) return;
    setLocked(true);
    setShowResult(true);
    const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
    try {
      await connection.invoke("SubmitAnswer", roomId, player.id, question.id, -1, elapsedTime);
    } catch (err) {
      console.error("❌ SubmitAnswer timeout error:", err);
    }
  };

  const handleSelect = async (i: number) => {
    if (locked || !question) return;
    setPlayerAnswer(i);
    setLocked(true);
    stopPlayerTimer();
    const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
    try {
      await connection.invoke("SubmitAnswer", roomId, player.id, question.id, i, elapsedTime);
    } catch (err) {
      console.error("❌ SubmitAnswer error:", err);
    }
  };

  
    

  

  // ===== FINISHED =====
  if (isFinished)
    return (
    <BattleResult
      player={player}
      opponent={opponent}
      playerScore={playerScore}
      opponentScore={opponentScore}
      onFinish={() => {
    setTimeout(() => onFinish?.(), 100); // ⏳ đợi React cleanup
  }}
    />
    );

  if (!question)
    return <div className="p-8 text-center text-gray-500">Đang tải câu hỏi...</div>;

  // ===== RENDER MAIN =====
  return (
  <div className="bg-dragon rounded-none md:rounded-2xl shadow-lg p-4 md:p-8 relative w-full min-h-screen md:min-h-0 ">
    {/* Grid desktop */}
    <div className="hidden md:block">
      <div className="grid grid-cols-9 gap-6 md:items-start px-20 lg:px-12">
      {/* 🧍‍♂️ Player bên trái */}
      <div className="md:col-span-2 space-y-3 text-left">
        <PlayerInfoCardBattle
          name={player.name }
          score={playerScore}
          avatar={player.avatar}
          timeLeft={timeLeft}
          maxTime={QUESTION_TIME}
          answered={locked}
          isOpponent={false}
        />
      </div>

      {/* 🧠 Câu hỏi */}
      <motion.div
        key={question.id}
        className="md:col-span-5  rounded-xl shadow-sm p-5 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="gap-3 bg-white/70 backdrop-blur-sm text-amber-700 border border-amber-200 shadow-md transition hover:scale-105 font-bold px-4 py-2 rounded-lg">
            Câu {question.id}
          </span>
          <span
            className={`flex items-center gap-1 font-bold ${
              question.difficulty === "EASY"
                ? "text-green-600"
                : question.difficulty === "MEDIUM"
                ? "text-yellow-600"
                : "text-red-600"
            } text-base text-sm`}
          >
            {question.difficulty === "EASY" && (
              <>
                <Feather className="w-5 h-5" /> KHỞI ĐỘNG
              </>
            )}
            {question.difficulty === "MEDIUM" && (
              <>
                <Flame className="w-5 h-5" /> THỬ THÁCH
              </>
            )}
            {question.difficulty === "HARD" && (
              <>
                <Gem className="w-5 h-5" /> ĐỈNH CAO
              </>
            )}
          </span>
        </div>
        
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          {question.question}
        </h3>

        {!showOptions && (
  <div className="flex flex-col items-center justify-center mt-20">
    <div className="relative w-24 h-24">
      <svg className="absolute inset-0" viewBox="0 0 36 36">
        <defs>
          <linearGradient id="readingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ca8a04" /> {/* yellow-600 */}
            <stop offset="50%" stopColor="#b91c1c" /> {/* red-700 */}
            <stop offset="100%" stopColor="#92400e" /> {/* amber-900 */}
          </linearGradient>
        </defs>
        <path
          className="text-gray-900"
          strokeWidth="3"
          stroke="#e5e7eb"
          fill="none"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-amber-700"
          strokeWidth="3"
          strokeDasharray={`${(readingTimeLeft / 3) * 100}, 100`}
          strokeLinecap="round"
          stroke="url(#readingGradient)"
          fill="none"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 
             bg-clip-text text-transparent drop-shadow-sm">
        {Math.ceil(readingTimeLeft)}
      </span>
    </div>
    <p className="mt-2 text-sm text-gray-500 italic">Thời gian đọc câu hỏi...</p>
  </div>
)}


        <div className="space-y-3 relative overflow-hidden min-h-[200px] flex flex-col justify-center">
  {/* Ẩn đáp án trong 3s đầu */}
  {!showOptions ? (
    <motion.div
      key={"waiting"}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center text-gray-500 text-lg italic"
    >     
    </motion.div>
  ) : (
    question.options.map((opt, i) => {
      const isSelected = playerAnswer === i;
      const isCorrect = showResult && question.correct === i;

      let cls =
        "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ";
      if (showResult && isCorrect)
        cls += "border-green-500 bg-green-50 text-green-800";
      else if (showResult && isSelected && !isCorrect)
        cls += "border-red-500 bg-red-50 text-red-800";
      else if (isSelected)
        cls += "border-blue-500 bg-blue-50 text-blue-800";
      else cls += "border-gray-300 hover:bg-gradient-to-br from-white via-amber-50 to-orange-50";

      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.4 }}
          className={cls}
          onClick={() => handleSelect(i)}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 font-bold text-sm ${
              isCorrect
                ? "border-green-500 bg-green-500 text-white"
                : isSelected
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-400"
            }`}
          >
            {String.fromCharCode(65 + i)}
          </div>
          <span className="flex-1 font-semibold">{opt}</span>
          {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
        </motion.div>
      );
    })
  )}
</div>

      </motion.div>

      {/* 🧍‍♀️ Opponent */}
      <div className="md:col-span-2 space-y-3 text-right">
        <PlayerInfoCardBattle
          name={opponent.name}
          score={opponentScore}
          avatar={opponent.avatar}
          timeLeft={opponentTimeLeft}
          maxTime={QUESTION_TIME}
          answered={opponentAnswered}
          isOpponent={true}
        />
      </div>
    </div>
     </div>

    {/* Layout mobile: Câu hỏi trên, 2 người chơi dưới cùng hàng */}
    <div className="md:hidden flex flex-col gap-6">
      {/* 🧠 Câu hỏi */}
      <motion.div
        key={question.id}
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="gap-3 bg-white/70 backdrop-blur-sm text-amber-700 border border-amber-200 shadow-md transition hover:scale-105 font-bold px-4 py-2 rounded-lg">
            Câu {question.id}
          </span>
         <span
            className={`flex items-center gap-1 font-bold ${
              question.difficulty === "EASY"
                ? "text-green-600"
                : question.difficulty === "MEDIUM"
                ? "text-yellow-600"
                : "text-red-600"
            } text-base text-sm`}
          >
            {question.difficulty === "EASY" && (
              <>
                <Feather className="w-5 h-5" /> KHỞI ĐỘNG
              </>
            )}
            {question.difficulty === "MEDIUM" && (
              <>
                <Flame className="w-5 h-5" /> THỬ THÁCH
              </>
            )}
            {question.difficulty === "HARD" && (
              <>
                <Gem className="w-5 h-5" /> ĐỈNH CAO
              </>
            )}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.question}
        </h3>
        {!showOptions && (
  <div className="flex flex-col items-center justify-center mt-20">
    <div className="relative w-24 h-24">
      <svg className="absolute inset-0" viewBox="0 0 36 36">
        <defs>
          <linearGradient id="readingGradientMb" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ca8a04" /> {/* yellow-600 */}
            <stop offset="50%" stopColor="#b91c1c" /> {/* red-700 */}
            <stop offset="100%" stopColor="#92400e" /> {/* amber-900 */}
          </linearGradient>
        </defs>
        <path
          className="text-gray-900"
          strokeWidth="3"
          stroke="#e5e7eb"
          fill="none"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-amber-700"
          strokeWidth="3"
          strokeDasharray={`${(readingTimeLeft / 3) * 100}, 100`}
          strokeLinecap="round"
          stroke="url(#readingGradientMb)"
          fill="none"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 
             bg-clip-text text-transparent drop-shadow-sm">
        {Math.ceil(readingTimeLeft)}
      </span>
    </div>
    <p className="mt-2 text-sm text-gray-500 italic">Thời gian đọc câu hỏi...</p>
  </div>
)}

        <div className="space-y-3 relative overflow-hidden min-h-[200px] flex flex-col justify-center">
  {/* Ẩn đáp án trong 3s đầu */}
  {!showOptions ? (
    <motion.div
      key={"waiting"}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center text-gray-500 text-lg italic"
    >     
    </motion.div>
  ) : (
    question.options.map((opt, i) => {
      const isSelected = playerAnswer === i;
      const isCorrect = showResult && question.correct === i;

      let cls =
        "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ";
      if (showResult && isCorrect)
        cls += "border-green-500 bg-green-50 text-green-800";
      else if (showResult && isSelected && !isCorrect)
        cls += "border-red-500 bg-red-50 text-red-800";
      else if (isSelected)
        cls += "border-blue-500 bg-blue-50 text-blue-800";
      else cls += "border-gray-300 hover:bg-gradient-to-br from-white via-amber-50 to-orange-50";

      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.4 }}
          className={cls}
          onClick={() => handleSelect(i)}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 font-bold text-sm ${
              isCorrect
                ? "border-green-500 bg-green-500 text-white"
                : isSelected
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-400"
            }`}
          >
            {String.fromCharCode(65 + i)}
          </div>
          <span className="flex-1 font-semibold">{opt}</span>
          {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
        </motion.div>
      );
    })
  )}
</div>
      </motion.div>

      {/* ⚔️ Hai người chơi nằm ngang hàng */}
<div className="flex items-start justify-evenly gap-3 mt-4 mb-2">

  <div className="flex-1 max-w-[180px] sm:max-w-[220px]">
    <PlayerInfoCardBattle
      name={player.name}
      score={playerScore}
      avatar={player.avatar}
      timeLeft={timeLeft}
      maxTime={QUESTION_TIME}
      answered={locked}
      isOpponent={false}
    />
  </div>

  <div className="flex-1 max-w-[180px] sm:max-w-[220px]">
    <PlayerInfoCardBattle
      name={opponent.name}
      score={opponentScore}
      avatar={opponent.avatar}
      timeLeft={opponentTimeLeft}
      maxTime={QUESTION_TIME}
      answered={opponentAnswered}
      isOpponent={true}
    />
  </div>
</div>

    </div>
  </div>
);

};

export default BattlePlay;
