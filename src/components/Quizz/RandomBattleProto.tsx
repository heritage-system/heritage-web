import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { Landmark, PartyPopper, Sparkles, Users, Share2, KeyRound } from "lucide-react"; // 🆕 thêm icon
import { motion, AnimatePresence } from "framer-motion";
import PlayerCard from "./PlayerInfoCard";
import BattlePlay from "./BattlePlay";
import Spinner from "../Layouts/LoadingLayouts/Spinner"
import { API_URL } from "../../utils/baseUrl";
const HUB_URL = `${API_URL}/gamehub`;

const categories = [
  {
    key: "le",
    title: "Phần Lễ",
    desc: "Khám phá tín ngưỡng, nghi lễ cổ truyền",
    icon: <Landmark className="w-7 h-7 text-yellow-700" />,
    gradient: "from-amber-400/20 to-yellow-100/10",
    active: "from-amber-400/80 to-yellow-600/70",
  },
  {
    key: "hoi",
    title: "Phần Hội",
    desc: "Thử sức với trò chơi dân gian sôi động",
    icon: <PartyPopper className="w-7 h-7 text-red-700" />,
    gradient: "from-red-400/20 to-pink-100/10",
    active: "from-pink-500/70 to-red-700/70",
  },
  {
    key: "mix",
    title: "Hỗn hợp",
    desc: "Kết hợp cả phần Lễ và Hội",
    icon: <Sparkles className="w-7 h-7 text-purple-700" />,
    gradient: "from-indigo-400/20 to-purple-100/10",
    active: "from-indigo-600/70 to-purple-700/70",
  },
];

interface RandomBattleProps {
  name?: string;
  avatar?: string;
  onBack: () => void;
}

const RandomBattleProto: React.FC<RandomBattleProps> = ({ name, avatar, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  const [waitingTime, setWaitingTime] = useState(0);
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🆕 FRIEND MODE
  const [mode, setMode] = useState<"random" | "friend">("random");
  const [friendRoomCode, setFriendRoomCode] = useState<string>("");
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [isWaitingFriend, setIsWaitingFriend] = useState(false);

  // 🔌 Kết nối SignalR khi mở trang
  useEffect(() => {
    let conn: signalR.HubConnection | null = null;

    const connect = async () => {
      conn = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, { withCredentials: true })
        .withAutomaticReconnect()
        .build();

      try {
        await conn.start();
        console.log("✅ Connected to GameHub");
        setConnection(conn);
      } catch (err) {
        console.error("❌ Failed to connect SignalR:", err);
      }

      // 🎧 Sự kiện
      conn.on("WaitingForOpponent", () => {
        console.log("⏳ Waiting for opponent...");
        setIsSearching(true);
        setWaitingTime(0);
        if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
        waitingTimerRef.current = setInterval(() => setWaitingTime((prev) => prev + 1), 1000);
      });

      conn.on("MatchFound", (roomId: string, sessionData: any) => {
        console.log("🎮 Match found:", sessionData);
        setRoomCode(roomId);
        setSession(sessionData);

        const me = sessionData.players.find((p: any) => p.username === name);
        const opp = sessionData.players.find((p: any) => p.username !== name);

        setPlayer({
          id: me?.id || "",
          name: me?.username || name || "Bạn",
          avatar: me?.avatarUrl || avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Player",
        });

        setOpponent({
          id: opp?.id || "",
          name: opp?.username || "Đối thủ",
          avatar: opp?.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Opponent",
        });

        setCountdown(5);
      });

      conn.on("OpponentDisconnected", () => {
        alert("❌ Đối thủ đã rời trận!");
        setIsBattleStarted(false);
        setRoomCode(null);
        setOpponent(null);
        setIsSearching(false);
      });

      // 🆕 Friend Mode - Event
      conn.on("RoomCreated", (code: string) => {
        console.log("🏠 Room created:", code);
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

      conn.on("RoomNotFound", () => alert("❌ Mã phòng không tồn tại!"));
      conn.on("RoomFull", () => alert("⚠️ Phòng đã đủ người!"));
    };

    connect();

    // ✅ Cleanup thật sự của React
    return () => {
      console.log("🚪 Leaving page → cancel matchmaking");
      if (conn && conn.state === signalR.HubConnectionState.Connected) {
        conn.invoke("CancelFindMatch").catch(() => {});
      }
      conn?.stop();
    };
  }, [name]);

  // 🔘 Nhấn nút tìm đối thủ
  const handleFindMatch = async () => {
    if (!connection) {
      console.warn("⚠️ Chưa có kết nối SignalR!");
      return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      try {
        console.log("🔄 Reconnecting to hub...");
        await connection.start();
      } catch (err) {
        console.error("❌ Reconnect failed:", err);
        return;
      }
    }

    setIsSearching(true);
    try {
      await connection.invoke("FindMatch", name || "Bạn", avatar || "");
    } catch (err) {
      console.error("❌ Match invoke error:", err);
    }
  };

  // 🆕 FRIEND MODE: Tạo phòng
  const handleCreateRoom = async () => {
    if (!connection) return;
    try {
      await connection.invoke("CreateRoom", name || "Bạn", avatar || "");
    } catch (err) {
      console.error("❌ Create room error:", err);
    }
  };

  // 🆕 FRIEND MODE: Tham gia phòng
  const handleJoinRoom = async () => {
    if (!connection || !friendRoomCode.trim()) return;
    try {
      await connection.invoke("JoinRoom", friendRoomCode.trim().toUpperCase(), name || "Bạn", avatar || "");
    } catch (err) {
      console.error("❌ Join room error:", err);
    }
  };

  // ⏱️ Đếm ngược 5s trước khi vào trận
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setIsBattleStarted(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ⚔️ Khi trận bắt đầu
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
          setSelectedCategory(null);
          setOpponent(null);
          setIsWaitingFriend(false);
          setCreatedRoomCode(null);
        }}
      />
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 💡 UI chọn chủ đề & tìm đối thủ
  return (
    <div className="p-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg space-y-8 border border-gray-100">
      <AnimatePresence mode="wait">
        {/* STEP 1: chọn chế độ */}
        {!isSearching && !roomCode && !isWaitingFriend && (
          <div className="text-center space-y-6">
            <h3 className="text-3xl font-semibold text-gray-900">Chọn chế độ thi đấu</h3>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setMode("random")}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 ${mode === "random" ? "bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-lg" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <Users className="w-5 h-5" /> Ngẫu nhiên
              </button>
              <button
                onClick={() => setMode("friend")}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 ${mode === "friend" ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <KeyRound className="w-5 h-5" /> Bạn bè
              </button>
            </div>
          </div>
        )}

        {/* STEP 1B: Chọn chủ đề */}
        {!isSearching && !roomCode && !isWaitingFriend && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-3xl font-semibold text-gray-900 text-center">
              Chọn chủ đề bạn muốn thi đấu
            </h3>

            <div className="text-center">
              <button
                onClick={onBack}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ← Quay lại
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {categories.map((c) => (
                <div
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`rounded-2xl p-6 text-center cursor-pointer border transition-all backdrop-blur-sm hover:scale-105 ${
                    selectedCategory === c.key
                      ? `bg-gradient-to-br ${c.active} text-white border-transparent shadow-xl`
                      : `bg-gradient-to-br ${c.gradient} border-gray-200 hover:border-gray-300`
                  }`}
                >
                  <div className="flex justify-center mb-3">{c.icon}</div>
                  <h4
                    className={`text-lg font-semibold ${
                      selectedCategory === c.key ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {c.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      selectedCategory === c.key ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              {mode === "random" ? (
                <button
                  disabled={!selectedCategory}
                  onClick={handleFindMatch}
                  className={`px-10 py-3 rounded-xl font-semibold text-white text-lg transition-all ${
                    selectedCategory
                      ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 hover:shadow-lg"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Tìm đối thủ ngẫu nhiên
                </button>
              ) : (
                <div className="space-x-3">
                  <button
                    onClick={handleCreateRoom}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold hover:shadow-lg"
                  >
                    Tạo phòng
                  </button>
                  <input
                    value={friendRoomCode}
                    onChange={(e) => setFriendRoomCode(e.target.value)}
                    placeholder="Nhập mã phòng..."
                    className="border rounded-lg px-4 py-2 w-40 text-center focus:ring focus:ring-indigo-300"
                  />
                  <button
                    onClick={handleJoinRoom}
                    className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:shadow-md"
                  >
                    Vào phòng
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 🆕 STEP 2B: Đang chờ bạn bè */}
        {isWaitingFriend && !roomCode && (
          <motion.div
            key="wait-friend"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 space-y-4"
          >
            <Spinner size={40} thickness={6} />
            <h3 className="text-xl font-semibold text-gray-800">Chờ bạn bè tham gia phòng...</h3>
            <p className="text-lg text-gray-600">Mã phòng của bạn:</p>
            <div className="flex justify-center items-center gap-3">
              <span className="text-3xl font-bold tracking-widest bg-gray-100 px-4 py-2 rounded-lg shadow">{createdRoomCode}</span>
              <button
                onClick={() => navigator.clipboard.writeText(createdRoomCode || "")}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" /> Copy
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Đang tìm đối thủ */}
        {isSearching && !roomCode && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-4 py-8"
          >
            <span className="mx-auto"><Spinner size={40} thickness={6}/></span>
            <h3 className="text-xl font-semibold text-gray-800">
              Đang tìm đối thủ phù hợp...
            </h3>
            <p className="text-xl font-bold text-gray-800"> {formatTime(waitingTime)}</p>
          </motion.div>
        )}

        {/* STEP 3: Ghép thành công + đếm ngược */}
        {roomCode && !isBattleStarted && opponent && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            <h3 className="text-2xl font-bold text-gray-900">
              Đã tìm thấy phòng #{roomCode.substring(0, 4)}
            </h3>

            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-20">
              <PlayerCard name={player?.name || "Bạn"} score={0} avatar={player?.avatar} />

              <div className="relative flex items-center justify-center">
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-600 text-white font-extrabold text-3xl shadow-lg">
                  <div className="absolute inset-0 rounded-full bg-yellow-400/40 blur-2xl animate-pulse" />
                  <span className="relative z-10 tracking-wider drop-shadow-md">
                    {countdown !== null ? countdown : "VS"}
                  </span>
                </div>
              </div>

              <PlayerCard
                name={opponent?.name || "Đối thủ"}
                score={0}
                avatar={opponent?.avatar}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RandomBattleProto;
