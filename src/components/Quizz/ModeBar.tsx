import { Users, KeyRound, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ModeBarProps {
  mode: "random" | "friend" | "custom";
  setMode: (m: "random" | "friend" | "custom") => void;
}

const MODES = [
  { key: "random", label: "Ngẫu nhiên", icon: <Users className="w-4 h-4" /> },
  { key: "friend", label: "Bạn bè", icon: <KeyRound className="w-4 h-4" /> },
  { key: "custom", label: "Tùy chỉnh", icon: <Sparkles className="w-4 h-4" /> },
];

const ModeBar: React.FC<ModeBarProps> = ({ mode, setMode }) => {
  return (
    <div className="relative flex justify-center mt-2 mb-3 select-none">
      {/* Track container */}
      <div className="relative flex bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-700/60 p-1 shadow-inner">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key as any)}
            className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300
              ${
                mode === m.key
                  ? "text-white"
                  : "text-gray-400 hover:text-orange-300"
              }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}

        {/* Sliding background highlight */}
        <motion.div
          layoutId="activeMode"
          className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-yellow-500 via-red-600 to-amber-700 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
          initial={false}
          transition={{ type: "spring", stiffness: 250, damping: 22 }}
          style={{
            left: `${MODES.findIndex((m) => m.key === mode) * 105 + 6}px`,
            width: "95px",
          }}
        />
      </div>
    </div>
  );
};

export default ModeBar;
