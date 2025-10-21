import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PlayerInfoCardBattle from "./PlayerInfoCardBattle";
import { CheckCircle, Trophy } from "lucide-react";
import * as signalR from "@microsoft/signalr";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct?: number;
  type?: "multiple" | "essay";
  difficulty?: string;
}

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
      stopAllTimers(); // 💥 dừng mọi timer cũ

      setQuestion({ ...q, type: "multiple", points: 1 });
      setPlayerAnswer(null);
      setLocked(false);
      setShowResult(false);
      setOpponentAnswered(false);
      setOpponentAnswerTime(null);
      setTimeLeft(QUESTION_TIME);
      setOpponentTimeLeft(QUESTION_TIME);
      setShowOptions(false);
      //startTimeRef.current = Date.now();
      console.log(q.startTimeUtcMs)
      startTimeRef.current = q.startTimeUtcMs;

      delayTimerRef.current = setTimeout(() => {
        setShowOptions(true);
        startTimers();
      }, 3000);
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
    connection.on("OpponentDisconnected", handleOpponentLeft);

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
      connection.off("OpponentDisconnected", handleOpponentLeft);
      connection.off("RevealAnswer", handleRevealAnswer);
    };
  }, []);

  // ===== TIMER =====
  const startTimers = () => {
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

  
    

  const playerPercent = (timeLeft / QUESTION_TIME) * 100;
  const opponentPercent = (opponentTimeLeft / QUESTION_TIME) * 100;

  // ===== FINISHED =====
  if (isFinished)
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Kết thúc trận đấu</h2>
        <p className="text-gray-700 text-lg mb-6">
          <strong>{player.name}</strong>: {playerScore} điểm <br />
          <strong>{opponent.name}</strong>: {opponentScore} điểm
        </p>
        <button
          onClick={onFinish}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
        >
          Quay lại
        </button>
      </motion.div>
    );

  if (!question)
    return <div className="p-8 text-center text-gray-500">Đang tải câu hỏi...</div>;

  // ===== RENDER MAIN =====
  return (
  <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 relative max-w-5xl mx-auto w-full">
    {/* Grid desktop */}
    <div className="hidden md:grid grid-cols-9 gap-6 md:items-start">
      {/* 🧍‍♂️ Player bên trái */}
      <div className="md:col-span-2 space-y-3 text-left">
        <PlayerInfoCardBattle
          name={player.name + " (Bạn)"}
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
        className="md:col-span-5 bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg">
            Câu {question.id}
          </span>
          <span className="text-sm md:text-base font-semibold text-purple-700">
            {question.difficulty}
          </span>
        </div>
        
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          {question.question}
        </h3>

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
      else cls += "border-gray-200 hover:bg-gray-50";

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
          <span className="flex-1">{opt}</span>
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
          <span className="bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg">
            Câu {question.id}
          </span>
          <span className="text-sm font-semibold text-purple-700">
            {question.difficulty} 
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.question}
        </h3>
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
      else cls += "border-gray-200 hover:bg-gray-50";

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
          <span className="flex-1">{opt}</span>
          {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
        </motion.div>
      );
    })
  )}
</div>
      </motion.div>

      {/* ⚔️ Hai người chơi nằm ngang hàng */}
      <div className="flex items-start justify-around gap-3">
        <div className="flex-1">
          <PlayerInfoCardBattle
            name={player.name + " (Bạn)"}
            score={playerScore}
            avatar={player.avatar}
            timeLeft={timeLeft}
            maxTime={QUESTION_TIME}
            answered={locked}
            isOpponent={false}
          />
        </div>

        <div className="flex-1">
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
