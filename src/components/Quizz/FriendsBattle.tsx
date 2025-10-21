import { useState } from "react";
import { PartyPopper, Sparkles, Landmark } from "lucide-react";
import PlayerCard from "./PlayerInfoCard";

const categories = [
  {
    key: "le",
    title: "Phần Lễ",
    icon: <Landmark className="w-8 h-8 text-yellow-700" />,
    color: "from-yellow-500 to-amber-600",
  },
  {
    key: "hoi",
    title: "Phần Hội",
    icon: <PartyPopper className="w-8 h-8 text-red-600" />,
    color: "from-red-600 to-pink-700",
  },
  {
    key: "mix",
    title: "Hỗn hợp",
    icon: <Sparkles className="w-8 h-8 text-purple-600" />,
    color: "from-indigo-600 to-purple-700",
  },
];

interface FriendsBattleProps {
  onBack: () => void;
}

const FriendsBattle: React.FC<FriendsBattleProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const handleCreateRoom = () => {
    setRoomCode(`#${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-8">
      {!roomCode ? (
        <>
          <h3 className="text-2xl font-semibold text-center">
            Chọn chủ đề trước khi mời bạn bè
          </h3>
          <button
            onClick={onBack}
            className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            ← Quay lại
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((c) => (
              <div
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`cursor-pointer rounded-2xl p-6 text-center transition-all hover:scale-105 ${
                  selectedCategory === c.key
                    ? `bg-gradient-to-br ${c.color} text-white shadow-lg`
                    : `bg-gray-100 hover:bg-gray-200`
                }`}
              >
                <div className="flex justify-center mb-3">{c.icon}</div>
                <h4 className="text-xl font-bold">{c.title}</h4>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              placeholder="Nhập mã phòng..."
              className="flex-1 px-4 py-3 border rounded-lg"
            />
            <button
              disabled={!selectedCategory}
              className={`px-6 py-3 rounded-xl font-semibold text-white ${
                selectedCategory
                  ? "bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Vào phòng
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={handleCreateRoom}
              className="bg-white border px-6 py-3 rounded-xl font-semibold hover:shadow-md"
            >
              + Tạo phòng mới
            </button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Phòng của bạn: {roomCode}
          </h3>
          <p className="text-gray-500">Chia sẻ mã phòng này cho bạn bè</p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <PlayerCard name="Bạn" avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=You" />
            <span className="text-3xl font-bold text-amber-700">VS</span>
            <PlayerCard
              name="Đang chờ bạn bè..."
              avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=Waiting"
              waiting
            />
          </div>
          <button className="mt-4 px-8 py-3 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white rounded-xl font-semibold hover:shadow-lg transition">
            Bắt đầu trận đấu
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendsBattle;
