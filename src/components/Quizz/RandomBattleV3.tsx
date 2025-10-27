import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { Users, KeyRound, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { API_URL } from "../../utils/baseUrl";
import BattlePlay from "./BattlePlay";
import BattleCardV1 from "./BattleCard";
import ModeBar from "./ModeBar";
import AchievementSection from "./AchievementSection";
import LearningHero from "./LearningHero";
const HUB_URL = `${API_URL}/gamehub`;

interface RandomBattleV2Props {
  name?: string;
  avatar?: string;
  onBack: () => void;
}

const RandomBattleV2: React.FC<RandomBattleV2Props> = ({ name, avatar, onBack }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [mode, setMode] = useState<"random" | "friend" | "custom">("random");
  const [isSearching, setIsSearching] = useState(false);
  const [isWaitingFriend, setIsWaitingFriend] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [friendRoomCode, setFriendRoomCode] = useState("");
  const [player, setPlayer] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ===== SIGNALR =====
  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    conn.start().then(() => console.log("✅ Connected")).catch(console.error);

    conn.on("WaitingForOpponent", () => {
      setIsSearching(true);
      setWaitingTime(0);
      if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
      waitingTimerRef.current = setInterval(() => setWaitingTime((t) => t + 1), 1000);
    });

    conn.on("MatchFound", (roomId: string, sessionData: any) => {
      setRoomCode(roomId);
      setSession(sessionData);
      const me = sessionData.players.find((p: any) => p.username === name);
      const opp = sessionData.players.find((p: any) => p.username !== name);
      setPlayer({
        id: me?.id || "",
        name: me?.username || name || "Bạn",
        avatar: me?.avatarUrl || avatar,
      });
      setOpponent({
        id: opp?.id || "",
        name: opp?.username || "Đối thủ",
        avatar: opp?.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Opponent",
      });
      setCountdown(5);
      setIsSearching(false);
    });

    conn.on("RoomCreated", (code: string) => {
      setCreatedRoomCode(code);
      setIsWaitingFriend(true);
      
    });

    conn.on("RoomJoined", (code: string, sessionData: any) => {
      console.log("👫 Room joined:", code, sessionData);
        setRoomCode(code);
        setSession(sessionData);

        const me = sessionData.players.find((p: any) => p.username === name);
        const opp = sessionData.players.find((p: any) => p.username !== name);

        setPlayer({
          id: me?.id || "",
          name: me?.username || name || "Bạn",
          avatar: me?.avatarUrl || avatar,
        });

        setOpponent({
          id: opp?.id || "",
          name: opp?.username || "Đối thủ",
          avatar: opp?.avatarUrl,
        });

        setCountdown(5);
      });

    conn.on("OpponentDisconnected", () => {
      alert("❌ Đối thủ đã rời trận!");
      setIsSearching(false);
      setRoomCode(null);
      setOpponent(null);
    });

    setConnection(conn);
    return () => {
      if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
      conn.stop();
    };
  }, [name, avatar]);

  // ===== COUNTDOWN =====
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setIsBattleStarted(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ===== ACTIONS =====
  const handleFindMatch = async () => {
    if (!connection) return;
    await connection.invoke("FindMatch", name || "Bạn", avatar || "");
  };
  const handleCreateRoom = async () => {
    if (!connection) return;
    await connection.invoke("CreateRoom", name || "Bạn", avatar || "");
  };
   const handleJoinRoom = async () => {
    if (!connection || !friendRoomCode.trim()) return;
    try {
      await connection.invoke("JoinRoom", friendRoomCode.trim().toUpperCase(), name || "Bạn", avatar || "");
    } catch (err) {
      console.error("❌ Join room error:", err);
    }
  };

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

  // ===== ENTER BATTLE =====
  if (isBattleStarted && opponent && player) {
    return (
      <BattlePlay
        player={player}
        opponent={opponent}
        roomId={roomCode!}
        connection={connection!}
        onFinish={() => {
          setIsBattleStarted(false);
          setRoomCode(null);
          setOpponent(null);
          setIsSearching(false);
        }}
      />
    );
  }

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-rose-50">
      {/* === MAIN SECTION (2 cột) === */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* === LEFT SIDE: TEXT BANNER === */}
        <LearningHero/>

        {/* === RIGHT SIDE: RANDOM BATTLE === */}
        <div className="flex justify-center">
    <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50/30 to-rose-50 text-white">

  {/* --- MODEBAR CỐ ĐỊNH TRÊN CÙNG --- */}
  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
  <div className="flex space-x-10 text-[11px] uppercase tracking-[0.25em] text-gray-400">
    {[
      { key: "random", label: "Ngẫu nhiên", icon: <Users className="w-4 h-4" /> },
      { key: "friend", label: "Bạn bè", icon: <KeyRound className="w-4 h-4" /> },
      { key: "custom", label: "Tùy chỉnh", icon: <Sparkles className="w-4 h-4" /> },
    ].map((m) => {
      const isDisabled = isSearching || isWaitingFriend
      const isActive = mode === m.key

      return (
        <button
          key={m.key}
          onClick={() => {
            if (!isDisabled) setMode(m.key as any);
          }}
          disabled={isDisabled}
          className={`
            relative flex flex-col items-center justify-center
            h-[34px] w-[120px] leading-none font-semibold select-none
            transition-all duration-300 ease-out
            ${
              isActive
                ? "text-orange-500"
                : isDisabled
                ? "text-gray-500 cursor-not-allowed opacity-60"
                : "text-gray-500 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center justify-center gap-1 mb-[2px]">
            <span className="translate-y-[1px]">{m.icon}</span>
            <span>{m.label}</span>
          </div>

          {/* underline effect */}
          <span
            className={`
              absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-[60%]
              bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500
              rounded-full transition-transform duration-300 ease-out origin-center
              ${isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
            `}
          />
        </button>
      );
    })}
  </div>
</div>

      {/* === MODE DESCRIPTION === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.25 }}
          className="mt-24 text-center mb-5"
        >
        
          <div className="text-center transition-all duration-500 ease-in-out">
            {mode === "random" && (
              <div className="inline-block px-6 py-4 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-xl border border-yellow-300/50 shadow-md max-w-md">
                <p className="text-sm text-gray-700 font-medium">
                  <span className="text-yellow-700 font-semibold">Ngẫu nhiên</span> – hệ thống sẽ tự động ghép bạn với một đối thủ bất kỳ đang online.
                
                </p>
              </div>
            )}

            {mode === "friend" && (
              <div className="inline-block px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-300/50 shadow-md max-w-md">
                <p className="text-sm text-gray-700 font-medium">
                  <span className="text-blue-700 font-semibold">Bạn bè</span> – tạo phòng riêng để thách đấu với bạn bè! Gửi mã phòng cho bạn và cùng nhau kiểm tra kiến thức văn hoá Việt.
                  
                </p>
              </div>
            )}

            {mode === "custom" && (
              <div className="inline-block px-6 py-4 bg-gradient-to-r from-green-50 via-lime-50 to-emerald-50 rounded-xl border border-green-300/50 shadow-md max-w-md">
                <p className="text-sm text-gray-700 font-medium">
                  <span className="text-green-700 font-semibold">Tùy chỉnh</span> – chọn chủ đề, độ khó và thời lượng câu hỏi theo sở thích của bạn.
              
                </p>
              </div>
            )}
          </div>

        </motion.div>
      </AnimatePresence>

     
      
      {/* === MAIN CARD === */}
      {/* === MAIN CARD / MATCH FOUND === */}
<AnimatePresence mode="wait">
  {/* Trạng thái chưa tìm được phòng */}
  {!roomCode && (
    <BattleCardV1
      isSearching={isSearching}
      isWaitingFriend={isWaitingFriend}
      avatar={avatar}
      name={name}
    />
  )}

  {/* Khi đã tìm thấy trận mà chưa vào chơi */}
  {roomCode && !isBattleStarted && opponent && (
    <motion.div
      key="vs-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mt-4 relative"
    >
      {/* PLAYER CARD (trượt từ trái vào) */}
      <motion.div
        initial={{ x: -150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <BattleCardV1
          isSearching={false}
          isWaitingFriend={false}
          avatar={player?.avatar}
          name={player?.name}

        />
      </motion.div>

      {/* VS COUNTDOWN (giữa hai thẻ, có hình thoi cân phát sáng) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="relative flex items-center justify-center w-[140px] h-[140px] sm:w-[160px] sm:h-[160px]"
      >
        {/* Hình thoi cân phát sáng */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="diamondGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <filter id="diamondGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#fb923c" floodOpacity="0.6" />
              <feComposite in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <polygon
            points="50,0 100,50 50,100 0,50"
            fill="url(#diamondGrad)"
            opacity="0.25"
            filter="url(#diamondGlow)"
          />
          <polygon
            points="50,10 90,50 50,90 10,50"
            stroke="url(#diamondGrad)"
            strokeWidth="2.5"
            fill="none"
            filter="url(#diamondGlow)"
          />
        </svg>

        {/* Countdown số */}
        <div className=" relative z-10 text-6xl sm:text-7xl font-black text-amber-700 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse">
          {countdown ?? "VS"}
        </div>
      </motion.div>

      {/* OPPONENT CARD (trượt từ phải vào) */}
      <motion.div
        initial={{ x: 150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <BattleCardV1
          isSearching={false}
          isWaitingFriend={false}
          avatar={opponent?.avatar}
          name={opponent?.name}
        />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


     {/* === ACTION BUTTONS (ổn định layout, có copy room code) === */}
<div className="h-[100px] flex items-center justify-center transition-all duration-300">

  {/* --- Khi chưa có phòng và chưa tìm --- */}
  {!isSearching && !roomCode && mode === "random" && (
    <button
      onClick={handleFindMatch}
      className="px-12 py-3 rounded-3xl font-semibold text-white 
                 bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700  
                 hover:scale-105 shadow-[0_0_25px_rgba(249,115,22,0.45)] 
                 transition-all duration-200"
    >
      TÌM TRẬN
    </button>
  )}

  {/* --- Khi đang tìm trận --- */}
{isSearching && (
  <div className="flex items-center justify-center">
    <div
      className="flex items-center justify-between gap-6 px-8 py-3 
                 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 
                 border border-orange-300 rounded-full shadow-md 
                 transition-all duration-300 min-w-[180px]"
    >
      {/* Text chính */}
      <span className="font-bold tracking-widest text-gray-800 text-lg">
        {formatTime(waitingTime)}
      </span>

      {/* Nút Hủy hình thoi bọc hình tròn */}
      <button
        onClick={() => {
          if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
          setIsSearching(false);
          connection?.invoke("CancelMatch");
        }}
        title="Hủy tìm trận"
        className="relative w-8 h-8 flex items-center justify-center group"
      >
        {/* Hình thoi ngoài */}
        <div className="absolute inset-0 rotate-45 rounded-[3px] bg-gradient-to-br from-white via-yellow-100 to-orange-100 border border-orange-400 shadow-md group-hover:shadow-lg transition-all"></div>

        {/* Hình tròn bên trong */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white border border-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  </div>
)}


  {/* --- Khi friend/custom --- */}
  {!isSearching && !roomCode && mode === "friend" && (
    <div className="flex items-center gap-4">
      {!createdRoomCode ? (
        <>
          <button
            onClick={handleCreateRoom}
            className="px-8 py-3 rounded-2xl font-semibold text-white 
                       bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700  
                       hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all"
          >
            Tạo phòng
          </button>
          <input
            value={friendRoomCode}
            onChange={(e) => setFriendRoomCode(e.target.value)}
            placeholder="Nhập mã phòng"
            className="px-4 py-2 w-44 rounded-lg text-center bg-slate-700 
                       text-white border border-orange-500/40 
                       focus:ring focus:ring-orange-400/40"
          />
          <button
            onClick={handleJoinRoom}
            className="px-6 py-3 rounded-2xl font-semibold text-white 
                       bg-gradient-to-r from-orange-500 to-red-500 
                       hover:scale-105 shadow-[0_0_18px_rgba(249,115,22,0.3)] transition-all"
          >
            Vào phòng
          </button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-between px-4 py-2 rounded-lg
                          bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800
                          border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.25)]
                          hover:shadow-[0_0_20px_rgba(249,115,22,0.45)] transition-all duration-300
                          min-w-[140px] mr-2">
            <span className="font-mono text-lg tracking-[0.25em] text-orange-400 select-all animate-pulse">
              {createdRoomCode}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )}
</div>



</div>
    </div>
     </section>

      {/* === ACHIEVEMENTS === */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <AchievementSection />
      </section>
    </div>
    
  );
};

export default RandomBattleV2;
