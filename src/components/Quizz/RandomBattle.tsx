import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { Users, KeyRound, Sparkles, Plus, LogIn, CheckCheck, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { API_URL } from "../../utils/baseUrl";
import BattlePlay from "./BattlePlay";
import BattleCard from "./BattleCard";
import QuizGrid from "./QuizGrid";
import toast from 'react-hot-toast';

const HUB_URL = `${API_URL}/gamehub`;

interface RandomBattleV2Props {
  name?: string;
  avatar?: string;
  onBack: () => void;
}



const RandomBattle: React.FC<RandomBattleV2Props> = ({ name, avatar, onBack }) => {
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
  const [copied, setCopied] = useState(false);
  
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
      
      const currentConnectionId = conn.connectionId; // hoặc lưu khi connect  
      const me = sessionData.find((p: any) => p.connectionId === currentConnectionId);
      const opp = sessionData.find((p: any) => p.connectionId !== currentConnectionId);

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

        const currentConnectionId = conn.connectionId; // hoặc lưu khi connect  
        const me = sessionData.find((p: any) => p.connectionId === currentConnectionId);
        const opp = sessionData.find((p: any) => p.connectionId !== currentConnectionId);

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
      toast.error("Đối thủ của bạn đã rời trận", {
        duration: 2000,
        position: "top-right",
        style: { background: "#DC2626", color: "#fff" },
        iconTheme: { primary: "#fff", secondary: "#DC2626" },
      });
      setIsBattleStarted(false);
      setRoomCode(null);
      setIsSearching(false); 
      setIsWaitingFriend(false)       
      setOpponent(null);
      setCreatedRoomCode(null);
      setFriendRoomCode("");
      setCountdown(null);
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
    await connection.invoke("FindMatch", name || "Bạn", avatar || "https://res.cloudinary.com/dea92gqx4/image/upload/v1761033759/Windows_10_Default_Profile_Picture.svg_x71ugm.png");
  };
  const handleCreateRoom = async () => {
    if (!connection) return;
    await connection.invoke("CreateRoom", name || "Bạn", avatar || "https://res.cloudinary.com/dea92gqx4/image/upload/v1761033759/Windows_10_Default_Profile_Picture.svg_x71ugm.png");
  };
   const handleJoinRoom = async () => {
    if (!connection || !friendRoomCode.trim()) return;
    try {
      await connection.invoke("JoinRoom", friendRoomCode.trim().toUpperCase(), name || "Bạn", avatar || "https://res.cloudinary.com/dea92gqx4/image/upload/v1761033759/Windows_10_Default_Profile_Picture.svg_x71ugm.png");
    } catch (err) {
      console.error("❌ Join room error:", err);
    }
  };

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      // sau 2 giây thì trở lại icon cũ
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("❌ Sao chép thất bại:", err);
    }
  };

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
          setIsSearching(false); 
          setIsWaitingFriend(false)       
          setOpponent(null);
          setCreatedRoomCode(null);
          setFriendRoomCode("");
        }}
      />
    );
  }

  // ===== UI =====
  return (
    // <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50/30 to-rose-50 text-white">
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-dragon text-white">



  {/* --- MODEBAR CỐ ĐỊNH TRÊN CÙNG --- */}
  {!roomCode && !isBattleStarted && countdown === null && (<div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 mb-16">
  <div className="flex space-x-10 text-[11px] uppercase tracking-[0.25em] text-gray-400">
    {[
      { key: "random", label: "Ngẫu nhiên", icon: <Users className="w-4 h-4" /> },
      { key: "friend", label: "Bạn bè", icon: <KeyRound className="w-4 h-4" /> },
      { key: "custom", label: "Tùy chọn", icon: <Sparkles className="w-4 h-4" /> },
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
</div>)}

     

     
      
{/* === MAIN UI WRAPPER === */}
<div
  className={`flex flex-col ${
    mode === "custom" ? "lg:flex-row gap-6" : "items-center"
  } w-full max-w-7xl mx-auto px-3`}
>
  {/* === BÊN TRÁI (QuizGrid khi tùy chỉnh) === */}
  {mode === "custom" && (
    <div
      className="w-full lg:w-[80%] max-h-[80vh] overflow-y-auto 
                transition-all duration-500 rounded-xl scrollbar-thin scrollbar-thumb-amber-400/60 scrollbar-hide mt-20"
    >
      <QuizGrid />
    </div>
  )}


  {/* === BÊN PHẢI (BattleCard + description, 30%) === */}
  <div
    className={`w-full ${
      mode === "custom" ? "lg:w-[20%]" : "lg:w-full"
    } transition-all duration-500 flex flex-col items-center justify-center`}
  >
      {/* === MAIN CARD / MATCH FOUND === */}
      <AnimatePresence mode="wait" >
        <motion.div
              
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="mt-5 text-center"
              ></motion.div>
        {/* Trạng thái chưa tìm được phòng */}
        {!roomCode && (
          <BattleCard
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
      className="flex flex-col sm:flex-row items-center justify-center gap-10 mt-6 w-full max-w-[1200px] mx-auto px-6"


    >
      {/* PLAYER CARD (trượt từ trái vào) */}
      <motion.div
        initial={{ x: -150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        
      >
        <BattleCard
          isSearching={false}
          isWaitingFriend={false}
          avatar={player?.avatar}
          name={player?.name}
        />
      </motion.div>

      {/* VS COUNTDOWN (giữa hai thẻ, có hình thoi cân phát sáng) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: countdown ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="relative flex items-center justify-center self-center w-[120px] h-[120px] sm:w-[160px] sm:h-[160px]"
      >
        {/* Hình thoi */}
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
        <div
          className="absolute inset-0 flex items-center justify-center text-5xl sm:text-7xl font-black text-amber-700 
                    drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse"
        >
          {countdown ?? "VS"}
        </div>
      </motion.div>


      {/* OPPONENT CARD (trượt từ phải vào) */}
      <motion.div
        initial={{ x: 150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <BattleCard
          isSearching={false}
          isWaitingFriend={false}
          avatar={opponent?.avatar}
          name={opponent?.name}
        />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


 {/* === MODE DESCRIPTION (1 dòng) === */}
<AnimatePresence mode="wait">
  <motion.div
    key={mode}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.25 }}
    className="mt-5 text-center"
  >
    {mode === "random" && (
      <p className="text-sm text-gray-700 font-medium">
        <span className="text-yellow-700 font-semibold">Ngẫu nhiên:</span> Hệ thống sẽ tự động ghép bạn với một đối thủ đang online.
      </p>
    )}

    {mode === "friend" && (
      <p className="text-sm text-gray-700 font-medium">
        <span className="text-blue-700 font-semibold">Bạn bè:</span> Tạo phòng riêng, gửi mã cho bạn và cùng nhau thi đấu.
      </p>
    )}

    {mode === "custom" && (
      <p className="text-sm text-gray-700 font-medium">
        <span className="text-green-700 font-semibold">Tùy chọn:</span> Chọn chủ đề theo sở thích.
      </p>
    )}
  </motion.div>
</AnimatePresence>

</div>
</div>
     {/* === ACTION BUTTONS (ổn định layout, có copy room code) === */}
<div className="h-[90px] flex items-center justify-center transition-all duration-300">

  {/* --- Khi chưa có phòng và chưa tìm --- */}
  {!isSearching && !roomCode && mode === "random" && (
    <button
      onClick={handleFindMatch}
      className="relative flex items-center justify-center px-6 py-3 rounded-xl
                 bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700 
                  border border-amber-300 shadow-[0_4px_20px_rgba(249,168,38,0.2)]
                  hover:shadow-[0_6px_24px_rgba(249,168,38,0.35)] transition-all duration-300
                  min-w-[180px] font-mono
                "
    >
      TÌM ĐỐI THỦ
    </button>
  )}

  {/* --- Khi đang tìm trận --- */}
{isSearching && (
  <div
        className="relative flex items-center justify-center px-6 py-2 rounded-xl
                  bg-gradient-to-br from-white via-amber-50 to-orange-50
                  border border-amber-300 shadow-[0_4px_20px_rgba(249,168,38,0.2)]
                  hover:shadow-[0_6px_24px_rgba(249,168,38,0.35)] transition-all duration-300
                  min-w-[180px]"
      >
       
        <span className="font-mono text-2xl tracking-[0.2em] text-amber-700 select-all">
           {formatTime(waitingTime)}
        </span>
     

        {/* Nút hủy phòng */}
        <button
          onClick={() => {
           if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
            setIsSearching(false);
            connection?.invoke("CancelMatch");
          }}
          title="Hủy tìm đối thủ"
          className="absolute -right-4 -top-4 w-8 h-8 flex items-center justify-center rounded-full
                    bg-white border border-amber-400 shadow-sm hover:scale-110 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4.5 h-4.5 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
)}



  {/* --- Khi friend/custom --- */}
  {!isSearching && !roomCode && mode === "friend" && (
    <div className="flex items-center gap-4">
      {!createdRoomCode ? (
        <>
          {/* Khung tạo/nhập/vào phòng – gộp chung */}    
<div className="flex items-center justify-center gap-2">
  {/* Nút tạo phòng (bo góc trái ngoài) */}
  <button
    onClick={handleCreateRoom}
    title="Tạo phòng mới"
    className="
      w-[50px] h-[50px] flex items-center justify-center
      bg-gradient-to-r from-amber-700 via-red-600 to-yellow-500
      text-white
      shadow-[0_0_10px_rgba(249,115,22,0.25)]
      hover:scale-105 hover:brightness-110
      transition-all duration-200
      rounded-l-xl
      rounded-r-none
    "
  >
    <Plus className="w-5 h-5 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
  </button>

  {/* Input giữa */}
  <input
    value={friendRoomCode}
    onChange={(e) => {
      const value = e.target.value.toUpperCase();

      // Nếu gõ quá 6 ký tự thì KHÔNG set state nữa (bỏ qua hoàn toàn)
      if (value.length > 6) return;

      setFriendRoomCode(value);
    }}
    placeholder="NHẬP MÃ PHÒNG"
    maxLength={6}
    className="
      w-[140px] h-[50px]
      text-center bg-gradient-to-br from-white via-amber-50 to-orange-50
      border border-amber-300
      
      shadow-[0_2px_10px_rgba(249,168,38,0.15)]
      hover:shadow-[0_3px_14px_rgba(249,168,38,0.3)]
      text-amber-700
      font-mono text-xl  tracking-[0.25em]  
      focus:outline-none focus:border-amber-500
      transition-all duration-300
      placeholder:text-gray-400 placeholder:font-normal placeholder:text-[12px] placeholder:tracking-wider
    "
  />


  {/* Nút “Vào” (bo góc phải ngoài) */}
  <button
    onClick={handleJoinRoom}
    title="Tham gia phòng"
    className="
      w-[50px] h-[50px] flex items-center justify-center
      bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700
      text-white
      shadow-[0_0_10px_rgba(249,115,22,0.25)]
      hover:brightness-110 hover:scale-[1.03]
      transition-all duration-200
      rounded-r-xl
      rounded-l-none
    "
  >
    <LogIn className="w-5 h-5 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
  </button>
</div>


        </>
      ) : (
      
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center gap-4 mt-12"
    >
      {/* Hộp hiển thị mã phòng */}
      <div
        className="relative flex items-center justify-center px-6 py-2 rounded-xl
                  bg-gradient-to-br from-white via-amber-50 to-orange-50
                  border border-amber-300 shadow-[0_4px_20px_rgba(249,168,38,0.2)]
                  hover:shadow-[0_6px_24px_rgba(249,168,38,0.35)] transition-all duration-300
                  min-w-[180px]"
      >
        {/* Mã phòng */}
        <span className="font-mono text-2xl tracking-[0.25em] text-amber-700 select-all">
          {createdRoomCode}
        </span>

        {/* Nút sao chép mã */}     
        <button
          onClick={() => handleCopy(createdRoomCode!)}  
          title={copied ? "Đã sao chép!" : "Sao chép mã phòng"}
          className={`p-2 rounded-full transition-all ${
            copied ? "hover:bg-amber-100" : "hover:bg-amber-100"
          }`}
        >
          {copied ? (
            <CheckCheck className="w-5 h-5 text-amber-600 transition-transform duration-300 scale-110" />
          ) : (
            <Copy className="w-5 h-5 text-amber-600 transition-transform duration-300 hover:scale-110" />
          )}
        </button>


        {/* Nút hủy phòng */}
        <button
          onClick={() => {
            setCreatedRoomCode(null);
            setIsWaitingFriend(false);
            connection?.invoke("CancelMatch");
          }}
          title="Hủy phòng chờ"
          className="absolute -right-4 -top-4 w-8 h-8 flex items-center justify-center rounded-full
                    bg-white border border-amber-400 shadow-sm hover:scale-110 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4.5 h-4.5 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Gợi ý nhỏ bên dưới */}
      <p className="text-sm text-gray-700">
        Gửi mã phòng này cho bạn bè để họ tham gia cùng bạn
      </p>
    </motion.div>
  )}
    </div>
  )}
</div>

    </div>
  );
};

export default RandomBattle;
