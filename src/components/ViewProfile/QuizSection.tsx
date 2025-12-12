import React, { useEffect, useState } from "react";
import { searchMatchHistory } from "../../services/gameMatchHistoryService";
import { UserMatchHistoryResponse } from "../../types/gameMatchHistory";
import { Winner } from "../../types/enum";
import { Swords, FileText, PackageX } from "lucide-react";
import { useAuth } from '../../hooks/useAuth';
const QuizSection: React.FC = () => {
  const [matchHistory, setMatchHistory] = useState<UserMatchHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, logout: authLogout, userType, avatarUrl, userName } = useAuth();
  useEffect(() => {
    loadMatchHistory();
  }, []);

  const loadMatchHistory = async () => {
    setLoading(true);
    const res = await searchMatchHistory();

    if (res.code === 200 && res.result) {
      setMatchHistory(res.result);
    }

    setLoading(false);
  };
  const getCardBg = (isDraw: boolean, p1Win: boolean, p2Win: boolean) => {
  if (isDraw) return "bg-orange-50 border-orange-200"; // hòa
  return p1Win || p2Win ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200";
};

const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageX className="w-20 h-20 text-yellow-300 mb-4" />
        <p className="text-gray-500 text-lg font-medium">Chưa có lịch sử đăng ký nào</p>
    </div>
  );

const renderMatch = (m: UserMatchHistoryResponse) => {
  const p1Win = m.winnerPlayer === Winner.PLAYER_1;
  const p2Win = m.winnerPlayer === Winner.PLAYER_2;
  const isDraw = m.winnerPlayer === Winner.DRAW;

  const isUserP1 = m.userNumber === 1;
  const isUserP2 = m.userNumber === 2;
  const userWon = (isUserP1 && p1Win) || (isUserP2 && p2Win);

  // 👉 Xác định avatar & tên hiển thị theo user
  const player1Avatar = isUserP1 ? avatarUrl : m.player1Avatar;
  const player1Name = isUserP1 ? userName : m.player1Name;

  const player2Avatar = isUserP2 ? avatarUrl : m.player2Avatar;
  const player2Name = isUserP2 ? userName : m.player2Name;

  return (
    <div
      key={m.matchId}
      className="max-w-4xl mx-auto rounded-2xl overflow-hidden border shadow-lg transition-all duration-300 relative"
    >
      <div className="flex items-stretch relative">
        
        {/* LEFT SIDE */}
        <div
          className={`w-1/2 flex items-center justify-between gap-3 p-4 relative ${
            p1Win ? 'bg-gradient-to-r from-rose-600 via-red-700 to-rose-900' : isDraw ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900'
          }`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)' }}
        >
          <div className="flex items-center gap-3">
            <img
              src={player1Avatar!}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex flex-col">
              <span className={`font-bold text-lg ${p1Win || isDraw ? 'text-gray-900' : 'text-white'}`}>
                {player1Name}
              </span>
              <span className={`text-sm ${p1Win || isDraw ? 'text-gray-800' : 'text-gray-200'}`}>
                Điểm: {m.player1Score}
              </span>
            </div>
          </div>

          {!isDraw && (
            <div className="flex flex-col items-end px-5">
              <span className={`font-extrabold text-xl ${p1Win ? 'text-white' : 'text-gray-300'}`}>
                {p1Win ? 'THẮNG' : 'THUA'}
              </span>

              {isUserP1 && userWon && (
                <span className="text-sm font-semibold text-yellow-300">
                  +{m.plusPoint} điểm
                </span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div
          className={`w-1/2 flex items-center justify-between gap-3 p-4 flex-row-reverse text-right relative ${
            p2Win ? 'bg-gradient-to-r from-rose-900 via-red-700 to-rose-600' : isDraw ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600'
          }`}
          style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          <div className="flex items-center gap-3 flex-row-reverse">
            <img
              src={player2Avatar!}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex flex-col">
              <span className={`font-bold text-lg ${p2Win || isDraw ? 'text-gray-900' : 'text-white'}`}>
                {player2Name}
              </span>
              <span className={`text-sm ${p2Win || isDraw ? 'text-gray-800' : 'text-gray-200'}`}>
                Điểm: {m.player2Score}
              </span>
            </div>
          </div>

          {!isDraw && (
            <div className="flex flex-col items-start px-5">
              <span className={`font-extrabold text-xl ${p2Win ? 'text-white' : 'text-gray-300'}`}>
                {p2Win ? 'THẮNG' : 'THUA'}
              </span>

              {isUserP2 && userWon && (
                <span className="text-sm font-semibold text-yellow-300">
                  +{m.plusPoint} điểm
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CENTER ICON */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="bg-white rounded-full p-3 shadow-xl border-2 border-gray-300">
          <Swords className="w-6 h-6 text-gray-700" />
        </div>
      </div>

      <div className="text-center py-2 bg-gray-50">
        <span className="text-xs text-gray-600 font-medium">
          {new Date(m.createdAt).toLocaleDateString('vi-VN')}
        </span>
      </div>
    </div>
  );
};


  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-black mb-3 flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Lịch sử đấu
          </h2>
          <p className="text-gray-700 text-lg">Xem lại kết quả những trận đấu</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-yellow-300/50 shadow-lg">
            <div className="text-3xl font-bold text-yellow-700">{matchHistory.length}</div>
            <div className="text-sm text-yellow-600 font-medium">Trận đấu</div>
          </div>
          {/* <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-amber-300/50 shadow-lg">
            <div className="text-3xl font-bold text-amber-700">7.5</div>
            <div className="text-sm text-amber-600 font-medium">Điểm TB</div>
          </div> */}
        </div>
      </div>

      {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải...</div>
        ) : matchHistory.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
            {matchHistory.map(renderMatch)}
          </div>
        )}

    </div>
  );
};

export default QuizSection;
