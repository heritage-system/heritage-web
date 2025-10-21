// BoardGame.tsx
import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../../hooks/useAuth";
import { GameSession, Player } from "../../types/game";

const totalCells = 21; // 0..20

// Sinh map zigzag nhưng ép hàng cuối thẳng hàng với FINISH ở góc trái trên
const generatePatternMap = (): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  const width = 900;
  const height = 600;
  const cols = 5;
  const spacingX = width / (cols + 1);
  const spacingY = 100;

  for (let i = 0; i < totalCells; i++) {
    const row = Math.floor(i / cols);
    let col = i % cols;

    if (row % 2 === 1) col = cols - 1 - col; // zigzag

    const baseX = (col + 1) * spacingX;
    const baseY = height - (row + 1) * spacingY;

    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 30;

    positions.push({ x: baseX + offsetX, y: baseY + offsetY });
  }

  // ép START (góc trái dưới) và FINISH (góc trái trên)
  positions[0] = { x: 120, y: height - 80 }; // START
  const finishRowY = 100;

  // các ô cuối thẳng hàng với FINISH bên trái
  positions[17] = { x: 500, y: finishRowY };
  positions[18] = { x: 380, y: finishRowY };
  positions[19] = { x: 250, y: finishRowY };
  positions[20] = { x: 120, y: finishRowY }; // FINISH góc trái trên

  return positions;
};

const BoardGame: React.FC = () => {
  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [game, setGame] = useState<GameSession | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [cellPositions, setCellPositions] = useState<{ x: number; y: number }[]>([]);

  // ===== SignalR =====
  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7166/gamehub")
      .withAutomaticReconnect()
      .build();

    conn.start().then(() => console.log("✅ Connected to hub"));
    conn.on("GameUpdated", (session: GameSession) => setGame(session));
    conn.on("DiceRolled", (_pid: string, dice: number, session: GameSession) => setGame(session));

    setConnection(conn);
    return () => {
      conn.stop();
    };
  }, []);

  const createRoom = async () => {
    if (!connection || !userName) return;
    const result = await connection.invoke<{ roomId: string; playerId: string }>(
      "CreateGame",
      userName,
      avatarUrl || ""
    );
    setRoomId(result.roomId);
    setPlayerId(result.playerId);

    setCellPositions(generatePatternMap());
  };

  const joinRoom = async () => {
    if (!connection || !roomId || !userName) return;
    const newId = await connection.invoke<string>("JoinGame", roomId, userName, avatarUrl || "");
    setPlayerId(newId);

    if (cellPositions.length === 0) {
      setCellPositions(generatePatternMap());
    }
  };

  const rollDice = () => {
    if (connection && game) {
      connection.invoke("RollDice", roomId, playerId);
    }
  };

  // Vẽ đường cong mềm mại nét đứt
  const makeCurve = (p1: { x: number; y: number }, p2: { x: number; y: number }, i: number) => {
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const offsetX = (i % 2 === 0 ? 1 : -1) * 40;
    const offsetY = (Math.random() - 0.5) * 30;
    return `M ${p1.x},${p1.y} Q ${midX + offsetX},${midY + offsetY} ${p2.x},${p2.y}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🗺️ Hành Trình Di Sản</h1>
      {!isLoggedIn ? (
        <p className="text-red-500">Bạn cần đăng nhập để chơi</p>
      ) : (
        <div>
          <div className="mb-4 flex gap-2">
            <button onClick={createRoom} className="px-4 py-2 bg-blue-600 text-white rounded">
              ➕ Tạo phòng
            </button>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room ID"
              className="border px-2 py-1"
            />
            <button onClick={joinRoom} className="px-4 py-2 bg-green-600 text-white rounded">
              🔗 Vào phòng
            </button>
          </div>

          <svg width="1000" height="600" className="bg-blue-100 rounded-xl border">
            {/* Nối các ô */}
            {cellPositions.map((pos, i) => {
              if (i === totalCells - 1) return null;
              const next = cellPositions[i + 1];
              return (
                <path
                  key={`path-${i}`}
                  d={makeCurve(pos, next, i)}
                  fill="none"
                  stroke="white"
                  strokeWidth={4}
                  strokeDasharray="12,8"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Ô game */}
            {cellPositions.map((pos, i) => {
              const playersHere = game?.players.filter((p) => p.position === i) || [];
              return (
                <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r={i === 0 || i === totalCells - 1 ? 45 : 28}
                    fill={i === 0 ? "#22c55e" : i === totalCells - 1 ? "#9333ea" : "#1e40af"}
                    stroke="white"
                    strokeWidth={3}
                  />
                  <text
                    textAnchor="middle"
                    dy="6"
                    fontSize={i === 0 || i === totalCells - 1 ? 16 : 12}
                    fontWeight="bold"
                    fill="white"
                  >
                    {i === 0 ? "START" : i === totalCells - 1 ? "FINISH" : i}
                  </text>
                  {playersHere.map((p: Player, idx) => (
                    <image
                      key={p.id}
                      href={p.avatarUrl || "/default-avatar.png"}
                      x={-16 + idx * 18}
                      y={-50}
                      height="32"
                      width="32"
                      clipPath="circle(50%)"
                    />
                  ))}
                </g>
              );
            })}
          </svg>

          <div className="mt-6">
            <button
              onClick={rollDice}
              disabled={!game}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
            >
              🎲 Đổ Xúc Xắc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardGame;
