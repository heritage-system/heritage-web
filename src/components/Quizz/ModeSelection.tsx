import { useState } from "react";
import { Sword, User, Users } from "lucide-react";

interface ModeSelectionProps {
  onModeSelect?: (mode: string) => void; // callback gửi mode ra ngoài
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect }) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setSelectedMode(key);
    if (onModeSelect) onModeSelect(key); // scroll xuống
  };

  const modes = [
    {
      key: "solo",
      title: "Solo",
      desc: "Khám phá từng lễ hội qua quiz thú vị",
      icon: <User className="w-8 h-8 text-yellow-700" />,
    },
    {
      key: "random",
      title: "1vs1 Ngẫu nhiên",
      desc: "Chọn 3 lễ hội hoặc Random để đấu trí",
      icon: <Sword className="w-8 h-8 text-red-700" />,
    },
    {
      key: "friends",
      title: "Chơi với bạn bè",
      desc: "Vào phòng hoặc tạo phòng riêng để cùng thử thách",
      icon: <Users className="w-8 h-8 text-orange-700" />,
    },
  ];

  return (
    <section className="bg-white py-8 rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
        Chọn chế độ chơi
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
        {modes.map((m) => (
          <div
            key={m.key}
            onClick={() => handleSelect(m.key)}
            className={`p-6 rounded-xl border cursor-pointer transition-all ${
              selectedMode === m.key
                ? "border-yellow-600 shadow-lg scale-105"
                : "border-gray-200 hover:border-yellow-400"
            }`}
          >
            <div className="flex justify-center mb-4">{m.icon}</div>
            <h3 className="text-xl font-bold text-center mb-2">{m.title}</h3>
            <p className="text-gray-600 text-center">{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ModeSelection;
