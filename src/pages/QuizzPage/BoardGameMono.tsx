// BoardGame.tsx
import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../../hooks/useAuth";
import { GameSession, Player } from "../../types/game";

const totalCells = 40; // Monopoly board: 10 mỗi cạnh x 4

// Sinh map Monopoly-style (40 ô bao quanh viền)
const generateMonopolyMap = (boardSize: number, cellSize: number, padding: number) => {
  const positions: { x: number; y: number }[] = [];
  const size = boardSize - 2 * padding;

  // 10 ô mỗi cạnh
  const steps = 9; // trừ góc (góc tính riêng)
  const step = size / steps;

  // Bottom row (right → left) START = ô 0
  for (let i = 0; i <= steps; i++) {
    positions.push({ x: boardSize - padding - i * step, y: boardSize - padding });
  }
  // Left column (bottom → top)
  for (let i = 1; i <= steps; i++) {
    positions.push({ x: padding, y: boardSize - padding - i * step });
  }
  // Top row (left → right)
  for (let i = 1; i <= steps; i++) {
    positions.push({ x: padding + i * step, y: padding });
  }
  // Right column (top → bottom)
  for (let i = 1; i < steps; i++) {
    positions.push({ x: boardSize - padding, y: padding + i * step });
  }

  return positions;
};

const BoardGameMono: React.FC = () => {
  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [game, setGame] = useState<GameSession | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [cellPositions, setCellPositions] = useState<{ x: number; y: number }[]>([]);

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

    setCellPositions(generateMonopolyMap(800, 80, 80));
  };

  const joinRoom = async () => {
    if (!connection || !roomId || !userName) return;
    const newId = await connection.invoke<string>("JoinGame", roomId, userName, avatarUrl || "");
    setPlayerId(newId);

    if (cellPositions.length === 0) {
      setCellPositions(generateMonopolyMap(800, 80, 80));
    }
  };

  const rollDice = () => {
    if (connection && game) {
      connection.invoke("RollDice", roomId, playerId);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎲 BoardGame - Monopoly Style</h1>

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

          <svg width="900" height="900" className="bg-green-100 rounded-xl border">
            {/* Vẽ các ô */}
            {cellPositions.map((pos, i) => {
              const playersHere = game?.players.filter((p) => p.position === i) || [];
              return (
                <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
                  <rect
                    x={-35}
                    y={-35}
                    width={70}
                    height={70}
                    fill={
                      i === 0 ? "#22c55e" : 
                      i === 10 ? "#f87171" : 
                      i === 20 ? "#facc15" : 
                      i === 30 ? "#3b82f6" :
                      "#f1f5f9"
                    }
                    stroke="black"
                    strokeWidth={2}
                  />
                  <text
                    textAnchor="middle"
                    dy="5"
                    fontSize="10"
                    fontWeight="bold"
                    fill="black"
                  >
                    {i === 0 ? "START" : 
                     i === 10 ? "JAIL" : 
                     i === 20 ? "FREE" : 
                     i === 30 ? "GO JAIL" : i}
                  </text>

                  {/* Player tokens */}
                  {playersHere.map((p: Player, idx) => (
                    <image
                      key={p.id}
                      href={p.avatarUrl || "/default-avatar.png"}
                      x={-20 + idx * 22}
                      y={20}
                      height="24"
                      width="24"
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

export default BoardGameMono;
