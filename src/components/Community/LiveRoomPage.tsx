// src/pages/LiveRoomPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, Phone, Users, MessageCircle, Wifi,
  Send, Smile, X, Heart, Laugh, Frown, ThumbsUp, ThumbsDown, Zap
} from 'lucide-react';
import { ReactionFloat } from './ReactionFloat';

interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
  isHost: boolean;
}

interface Reaction {
  id: number;
  icon: React.ReactNode;
  x: number;
}

const LiveRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reactionIdRef = useRef(0);

  const workshop = location.state as {
    workshopTitle: string;
    instructor: string;
  } || {
    workshopTitle: 'Workshop Gốm Sứ Truyền Thống',
    instructor: 'Nghệ nhân Nguyễn Văn A'
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participants, setParticipants] = useState(2);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activePanel, setActivePanel] = useState<'participants' | 'chat' | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: 'Nghệ nhân Nguyễn Văn A', text: 'Chào mọi người! Hôm nay chúng ta học làm gốm nhé!', time: '14:02', isHost: true },
    { id: 2, user: 'Bạn', text: 'Chào thầy ạ!', time: '14:03', isHost: false },
  ]);

  const [showUI, setShowUI] = useState(true);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showReactionMenu, setShowReactionMenu] = useState(false);

  // === REACTION ICONS (DÙNG COMPONENT CLASS) ===
  const reactionIcons = [
    { Icon: Heart, color: 'text-red-500' },
    { Icon: Laugh, color: 'text-yellow-500' },
    { Icon: Frown, color: 'text-blue-500' },
    { Icon: ThumbsUp, color: 'text-green-500' },
    { Icon: ThumbsDown, color: 'text-gray-600' },
    { Icon: Zap, color: 'text-purple-500' },
  ];

  // === ẨN UI SAU 3S ===
  const resetTimer = () => {
    setShowUI(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowUI(false), 3000);
  };

  useEffect(() => {
    const handleMouseMove = () => resetTimer();
    resetTimer();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // === ĐẾM GIỜ ===
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // === CUỘN CHAT ===
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // === PHÍM TẮT ===
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') setIsMuted(prev => !prev);
      if (e.key.toLowerCase() === 'v') setIsCameraOff(prev => !prev);
      if (e.key === 'Escape') {
        setActivePanel(null);
        setShowReactionMenu(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // === GỬI TIN NHẮN ===
  const sendMessage = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        user: 'Bạn',
        text: message,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isHost: false
      }]);
      setMessage('');
    }
  };

  // === GỬI REACTION (KHÔNG DÙNG CLONE → KHÔNG LỖI TS) ===
  const sendReaction = (Icon: React.ElementType, color: string) => {
    const id = reactionIdRef.current++;
    const x = Math.random() * 60 + 20;

    const coloredIcon = <Icon className={`w-6 h-6 ${color}`} />;

    setReactions(prev => [...prev, { id, icon: coloredIcon, x }]);
    setShowReactionMenu(false);
    resetTimer();
  };

  // === XÓA REACTION ===
  const removeReaction = (id: number) => {
    setReactions(prev => prev.filter(r => r.id !== id));
  };

  const togglePanel = (panel: 'participants' | 'chat') => {
    setActivePanel(prev => prev === panel ? null : panel);
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleLeave = () => navigate(-1);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden"
      onMouseMove={resetTimer}
      onMouseEnter={resetTimer}
    >
      {/* HEADER */}
      {showUI && (
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 z-40 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={handleLeave} className="text-gray-600 hover:text-blue-600 font-medium text-sm">
                Quay lại
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  W
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-800">{workshop.workshopTitle}</h1>
                  <p className="text-xs text-gray-500">{workshop.instructor}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-5 text-sm">
              <div className="flex items-center space-x-1.5 text-gray-700">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{participants} người</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-red-50 px-2.5 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-red-600 text-xs">LIVE</span>
              </div>
              <div className="flex items-center space-x-1 bg-green-50 px-2.5 py-0.5 rounded-full">
                <Wifi className="w-3.5 h-3.5 text-green-600" />
                <span className="font-medium text-green-700 text-xs">HD</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO AREA */}
      <div
        className={`relative transition-all duration-300 ${showUI ? 'h-[calc(100vh-10rem)]' : 'h-screen'}`}
        onMouseEnter={resetTimer}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center ${activePanel ? 'pr-96' : ''}`}>
          {isCameraOff ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-white shadow-2xl rounded-full mx-auto mb-4 flex items-center justify-center">
                <VideoOff className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg">Camera đã tắt</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-40 h-40 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-2xl rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                <Video className="w-20 h-20 text-white" />
              </div>
              <p className="text-xl font-semibold text-gray-700">Đang kết nối video...</p>
            </div>
          )}

          {showUI && (
            <div className="absolute bottom-6 right-6 w-56 h-40 bg-white rounded-2xl shadow-xl border-4 border-blue-200 overflow-hidden">
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">B</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Bạn</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* REACTIONS - Tách riêng */}
        <ReactionFloat reactions={reactions} onRemove={removeReaction} />
      </div>

      {/* PANEL */}
      {activePanel && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center">
              {activePanel === 'participants' ? (
                <>Người trong phòng ({participants})</>
              ) : (
                <>Bình luận <span className="ml-2 text-xs text-gray-500">({messages.length})</span></>
              )}
            </h3>
            <button onClick={() => setActivePanel(null)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === 'participants' ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">B</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">Bạn (Học viên)</p>
                    <p className="text-xs text-purple-600 font-medium">{isMuted ? 'Đã tắt mic' : 'Đang nói'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">N</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{workshop.instructor}</p>
                    <p className="text-xs text-green-600 font-medium">Đang nói</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isHost ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${msg.isHost ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-gray-800' : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800'}`}>
                      <p className="text-xs font-semibold">{msg.user}</p>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {activePanel === 'chat' && (
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-purple-600">
                  <Smile className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button onClick={sendMessage} className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTROL BAR */}
      {showUI && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-4 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
              <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-bold">{formatTime(elapsedTime)}</span>
              <span>•</span>
              <span className="bg-purple-50 px-3 py-1 rounded-full text-purple-700">Room: {roomId}</span>
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full shadow-lg ${isMuted ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} text-white`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button onClick={() => setIsCameraOff(!isCameraOff)} className={`p-4 rounded-full shadow-lg ${isCameraOff ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-teal-500'} text-white`}>
                {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button onClick={() => togglePanel('chat')} className={`p-4 rounded-full shadow-lg ${activePanel === 'chat' ? 'bg-gradient-to-br from-purple-600 to-pink-600 ring-4 ring-purple-200' : 'bg-gradient-to-br from-yellow-400 to-orange-500'} text-white`}>
                <MessageCircle className="w-5 h-5" />
              </button>

              <button onClick={() => togglePanel('participants')} className={`p-4 rounded-full shadow-lg ${activePanel === 'participants' ? 'bg-gradient-to-br from-indigo-600 to-blue-600 ring-4 ring-indigo-200' : 'bg-gradient-to-br from-gray-400 to-gray-500'} text-white`}>
                <Users className="w-5 h-5" />
              </button>

              {/* NÚT THẢ ICON */}
              <div className="relative">
                <button
                  onClick={() => setShowReactionMenu(prev => !prev)}
                  className="p-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white shadow-lg transition-all"
                  title="Thả cảm xúc"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {showReactionMenu && (
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-3 flex space-x-2 border border-gray-200 z-50">
                    {reactionIcons.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendReaction(item.Icon, item.color)}
                        className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 hover:scale-110 active:scale-95 transition-all"
                      >
                        <item.Icon className={`w-6 h-6 ${item.color}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleLeave} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 rounded-full flex items-center space-x-2 font-bold shadow-xl">
                <Phone className="w-5 h-5" />
                <span>Rời phòng</span>
              </button>
            </div>

            <div className="text-sm text-gray-600 font-medium">
              Nhấn <kbd className="px-2 py-1 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 rounded font-bold">M</kbd> mic • <kbd className="px-2 py-1 bg-gradient-to-br from-green-100 to-teal-100 text-green-700 rounded font-bold">V</kbd> cam • <kbd className="px-2 py-1 bg-gray-200 rounded font-bold">Esc</kbd> ẩn panel
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRoomPage;