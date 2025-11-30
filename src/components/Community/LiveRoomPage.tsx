import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic, MicOff, Video, VideoOff, Phone, Users, MessageCircle, Wifi,
  Send, Smile, X, Heart, Laugh, Frown, ThumbsUp, ThumbsDown, Zap, PhoneCall
} from "lucide-react";
import { useStreaming } from "../../components/Admin/Streaming/StreamingContext";
import { ReactionFloat } from "./ReactionFloat";
import { RefreshCcw } from "lucide-react";
/** 
 * LiveRoomPage - All-in-one (đã gộp MediaToolbar + VideoCanvas + TokenDebug + RightSidebar)
 * - Đồng bộ roomName từ URL param (:room hoặc :roomId)
 * - Tự fetch token nếu chưa có
 * - Join/Leave, bật/tắt mic/cam qua StreamingContext
 * - Hiển thị local/remote canvas đúng id: #local-player / #remote-container
 * - Roster/Waiting (đếm & liệt kê cơ bản)
 * - Chat & Reactions (cục bộ demo)
 */

type ReactionItem = { id: number; icon: React.ReactNode; x: number };

const LiveRoomPage: React.FC = () => {
  const params = useParams<{ roomName?: string; room?: string; roomId?: string }>();
  const navigate = useNavigate();
  const { roomMessages, sendRoomText } = useStreaming();
  
  const {
  
  pinned, localPinned,
  pinForEveryone, clearPinForEveryone,
  pinForMe, clearPinForMe,  isResyncing, resyncParticipants, resyncParticipantsAll,
  // ...
} = useStreaming();
const { sharing, startShare, stopShare } = useStreaming();
const shownPinned = pinned || localPinned; // ưu tiên ghim toàn phòng
const autoRef = useRef(false);
  const {
    room, roomName, setRoomName,
    grant, fetchTokens,
    joined, micOn, camOn,
    roster, waiting, isHost,
    joinLive, leaveLive, toggleMic, toggleCam,setRole,kick
  } = useStreaming();
const { localVideoReady } = useStreaming();
  // Lấy room từ URL: hỗ trợ /live/:room và /live/:roomId


// ✅ hỗ trợ mọi kiểu param bạn đang dùng
const urlRoom =
  params.roomName || params.room || params.roomId || "";

// Đồng bộ vào Context
useEffect(() => {
  if (urlRoom && urlRoom !== roomName) setRoomName(urlRoom);
}, [urlRoom, roomName, setRoomName]);

// ✅ Chỉ fetch token khi đã có roomName (tránh toast "Nhập roomName")
useEffect(() => {
  if (!grant && (roomName || urlRoom)) {
    void fetchTokens();
  }
}, [grant, roomName, urlRoom, fetchTokens]);
useEffect(() => {
  if (autoRef.current) return;
  autoRef.current = true;

  (async () => {
    // Lấy token (sẽ auto-admit nếu bạn bật OpenAdmission ở backend)
    const g = grant ?? (await fetchTokens());
    if (!g) return;

    // đồng bộ roomName để các API khác (roster/heartbeat) dùng
    if (!roomName && g.channel) setRoomName(g.channel);

    // tự join (role sẽ lấy theo grant.role)
    await joinLive().catch(() => {});
  })();
  // chỉ chạy 1 lần khi mount
}, []); 
  // ============== UI STATE (chat & reaction demo) ==============
  const [activePanel, setActivePanel] = useState<"participants" | "chat" | null>(null);
  
  const [showUI, setShowUI] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ id: number; user: string; text: string; time: string; isHost: boolean; }[]>([
    { id: 1, user: 'Host', text: 'Chào mọi người! Bắt đầu nào!', time: '14:02', isHost: true }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
const chatListRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);
const showPlaceholder = !joined || !camOn || !localVideoReady;
const isCameraOff = !camOn;
  // Reactions
  const [reactions, setReactions] = useState<ReactionItem[]>([]);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const reactionIdRef = useRef(0);
  const reactionIcons = [
    { Icon: Heart, color: 'text-red-500' },
    { Icon: Laugh, color: 'text-yellow-500' },
    { Icon: Frown, color: 'text-blue-500' },
    { Icon: ThumbsUp, color: 'text-green-500' },
    { Icon: ThumbsDown, color: 'text-gray-600' },
    { Icon: Zap, color: 'text-purple-500' },
  ];

  // Ẩn UI sau 3s không tương tác
  const timeoutRef = useRef<number | null>(null);
  const resetTimer = () => {
    setShowUI(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setShowUI(false), 3000);
  };
  useEffect(() => {
    const onMove = () => resetTimer();
    resetTimer();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onMove);
    window.addEventListener('touchstart', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onMove);
      window.removeEventListener('touchstart', onMove);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  // Đếm giờ
  useEffect(() => {
    const t = window.setInterval(() => setElapsedTime(s => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);
useEffect(() => {
  if (activePanel === 'chat') {
    setTimeout(() => inputRef.current?.focus(), 0);
  }
}, [activePanel]);
  // Cuộn chat cuối
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [roomMessages]);

  // Phím tắt
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') toggleMic().catch(() => {});
      if (e.key.toLowerCase() === 'v') toggleCam().catch(() => {});
      if (e.key === 'Escape') { setActivePanel(null); setShowReactionMenu(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleMic, toggleCam]);

  // Gửi tin nhắn demo
  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        user: 'Bạn',
        text: message,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isHost: false
      }
    ]);
    setMessage('');
  };

  // Thả reaction
  const sendReaction = (Icon: React.ElementType, color: string) => {
    const id = reactionIdRef.current++;
    const x = Math.random() * 60 + 20; // vị trí ngẫu nhiên
    setReactions(prev => [...prev, { id, icon: <Icon className={`w-6 h-6 ${color}`} />, x }]);
    setShowReactionMenu(false);
    resetTimer();
  };
  const removeReaction = (id: number) => setReactions(prev => prev.filter(r => r.id !== id));

  const togglePanel = (panel: "participants" | "chat") => {
    setActivePanel(prev => prev === panel ? null : panel);
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const effectiveRoom = useMemo(() => roomName || room?.roomName || urlRoom || "—", [roomName, room, urlRoom]);
  const participantsCount = roster.length;

  // Rời phòng (về lại trang trước)
const handleLeaveAll = async () => {
  try { await leaveLive(); } finally { navigate(-1); }
};


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
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-blue-600 font-medium text-sm">
                Quay lại
              </button>
              <div className="w-px h-8 bg-gray-300" />
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  W
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-800">Phòng: {effectiveRoom}</h1>
                  <p className="text-xs text-gray-500">{isHost ? "Bạn là Host/CoHost" : "Bạn là Audience/Speaker"}</p>
                </div>
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
  <div
    className={`absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center ${activePanel ? 'pr-96' : ''}`}
  >
    {/* {sharing && (
  <div id="local-screen" className="absolute right-4 top-4 w-[420px] max-w-[42vw] aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border-4 border-yellow-300" style={{ zIndex: 22 }} />
)} */}
    {/* 1) Local video (Agora play vào đây) */}
  <div
  id="local-player"
  className={`absolute inset-0 m-4 rounded-xl overflow-hidden bg-black transition-opacity
    ${showPlaceholder ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
  style={{ zIndex: 20 }}
/>

    {/* 2) Remote streams container (luôn tồn tại) */}
    <div
      id="remote-container"
      className="absolute left-4 bottom-4 grid grid-cols-2 gap-2 w-[480px] max-w-[48vw]"
      style={{ zIndex: 6 }}
    />
    
    {/* 3) Placeholder khi chưa có local video */}
    {showPlaceholder && (
      <>
        {(!joined || isCameraOff) ? (
          <div className="text-center select-none" style={{ zIndex: 4 }}>
            <div className="w-32 h-32 bg-white shadow-2xl rounded-full mx-auto mb-4 flex items-center justify-center">
              <VideoOff className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium text-lg">
              {!joined ? "Bạn chưa vào phòng" : "Camera đã tắt"}
            </p>
          </div>
        ) : (
          <div className="text-center select-none" style={{ zIndex: 4 }}>
            <div className="w-40 h-40 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-2xl rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Video className="w-20 h-20 text-white" />
            </div>
            <p className="text-xl font-semibold text-gray-700">Đang kết nối video...</p>
          </div>
        )}
      </>
    )}

    {/* 4) PIP avatar (độc lập với placeholder) */}
    {showUI && (
      <div className="absolute bottom-6 right-6 w-56 h-40 bg-white rounded-2xl shadow-xl border-4 border-blue-200 overflow-hidden" style={{ zIndex: 7 }}>
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

  {/* Reactions float */}
  <ReactionFloat reactions={reactions} onRemove={removeReaction} />
</div>


    {/* SIDE PANEL (Roster/Waiting + Chat) */}
{activePanel && (
  <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50">
    {/* Header */}
 <div className="p-4 border-b border-gray-200 flex items-center justify-between">
  <h3 className="font-bold text-gray-800 flex items-center">
    Người trong phòng ({participantsCount})
  </h3>
  <div className="flex items-center gap-2">
    {/* Đồng bộ cục bộ */}
    <button
      onClick={() => resyncParticipants()}
      disabled={isResyncing}
      className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50 text-gray-700"
      title="Đồng bộ số người (chỉ máy bạn)"
    >
      <RefreshCcw className={`w-4 h-4 inline mr-1 ${isResyncing ? "animate-spin" : ""}`} />
      Đồng bộ
    </button>

    {/* Đồng bộ toàn phòng (chỉ host/cohost) */}
    {isHost && (
      <button
        onClick={() => resyncParticipantsAll()}
        disabled={isResyncing}
        className="px-2 py-1 text-xs rounded border bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
        title="Phát lệnh đồng bộ cho toàn phòng"
      >
        <RefreshCcw className={`w-4 h-4 inline mr-1 ${isResyncing ? "animate-spin" : ""}`} />
        Đồng bộ toàn phòng
      </button>
    )}

    <button onClick={() => setActivePanel(null)} className="p-1 hover:bg-gray-100 rounded-full">
      <X className="w-5 h-5 text-gray-500" />
    </button>
  </div>
</div>


    {/* Body */}
    {activePanel === 'participants' ? (
      <div className="flex-1 overflow-y-auto p-4">
        {/* ... your participants list as before ... */}
       {roster.length === 0 ? (
  <div className="text-sm text-gray-500">Chưa có ai trong phòng.</div>
) : roster.map((r) => {
  const isMe = r.isSelf;
  const canAct = isHost && !isMe; // không thao tác chính mình
  return (
    <div
      key={`${r.uid}-${r.userId}`}
      className="flex items-center justify-between rounded border p-2"
    >
      <div className="text-sm">
        <div><span className="font-medium">UserId:</span> {r.userId} {isMe ? "(Bạn)" : ""}</div>
        <div><span className="font-medium">RTC UID:</span> {String(r.uid)}</div>
        <div><span className="font-medium">Role:</span> {r.role}</div>
      </div>

      {canAct && (
        <div className="flex items-center gap-2">
          {/* Quick actions đổi role */}
          <button
            onClick={() => setRole(r.userId, "CoHost")}
            className="px-2 py-1 text-xs rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
            title="Set CoHost"
          >
            Set CoHost
          </button>
          <button
            onClick={() => setRole(r.userId, "Host")}
            className="px-2 py-1 text-xs rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
            title="Set Host"
          >
            Set Host
          </button>

          {/* Kick */}
          <button
            onClick={async () => {
              const ok = window.confirm(`Kick user ${r.userId}?`);
              if (ok) await kick(r.userId);
            }}
            className="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
            title="Kick khỏi phòng"
          >
            Kick
          </button>
        </div>
      )}
    </div>
  );
})}

        {isHost && waiting.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="text-sm font-semibold mb-2">Hàng chờ ({waiting.length})</div>
            {waiting.map(w => (
              <div key={w.id} className="text-sm text-gray-700">
                • userId {w.userId} (rtc {w.rtcUid}) – {w.status}
              </div>
            ))}
          </div>
        )}
      </div>
    ) : (
      // CHAT MODE: composer on top, history below
      <div className="flex-1 flex flex-col">
        {shownPinned && (
  <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex items-start gap-3">
    <div className="mt-1">📌</div>
    <div className="flex-1">
      <div className="text-xs text-gray-500">
        Tin nhắn được ghim{pinned ? " (toàn phòng)" : " (chỉ mình bạn)"}
      </div>
      <div className="text-sm font-medium text-gray-800 break-words">{shownPinned.text}</div>
      <div className="text-[11px] text-gray-400">
        {shownPinned.from} • {new Date(shownPinned.ts).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}
      </div>
    </div>

    {pinned ? (
      // chỉ host/cohost mới bỏ ghim toàn phòng
      isHost && (
        <button onClick={clearPinForEveryone} className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50">
          Bỏ ghim
        </button>
      )
    ) : (
      <button onClick={clearPinForMe} className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50">
        Bỏ ghim
      </button>
    )}
  </div>
)}

        {/* Composer (TOP) */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-purple-600">
              <Smile className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}  // <-- so your focus-on-open works
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  await sendRoomText(message);
                  setMessage('');
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={async () => { await sendRoomText(message); setMessage(''); }}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History (BOTTOM, scrollable) */}
        <div ref={chatListRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {roomMessages.map((m) => {
  const isMe = String(m.from) === String(grant?.rtcUid);
  return (
    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-start gap-2 max-w-xs">
        <div className={`px-4 py-2 rounded-2xl shadow-sm ${isMe ? 'bg-gradient-to-r from-purple-100 to-pink-100' : 'bg-gradient-to-r from-yellow-50 to-orange-50'} text-gray-800`}>
          <p className="text-xs font-semibold">{isMe ? 'Bạn' : m.from}</p>
          <p className="text-sm break-words">{m.text}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-gray-500">
              {new Date(m.ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </p>

            {/* Nút ghim */}
            <button
              onClick={() => (isHost ? pinForEveryone(m) : pinForMe(m))}
              className="text-[11px] text-gray-500 hover:text-gray-800 ml-2"
              title={isHost ? "Ghim cho cả phòng" : "Ghim cho riêng bạn"}
            >
              📌 Ghim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
})}

          <div ref={chatEndRef} />
        </div>
      </div>
    )}
  </div>
)}


      {/* CONTROL BAR (đã gộp MediaToolbar + extra controls) */}
      {showUI && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-4 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-bold">{formatTime(elapsedTime)}</span>
              <span>•</span>
              <span className="bg-purple-50 px-3 py-1 rounded-full text-purple-700">Room: {effectiveRoom}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Join nếu chưa vào, nếu đã vào thì phím rời toàn phòng */}
              {!joined ? (
                <button
                  onClick={() => joinLive().catch(()=>{})}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-xl"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>Join</span>
                </button>
              ) : (
                <button onClick={handleLeaveAll} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 rounded-full flex items-center gap-2 font-bold shadow-xl">
                  <Phone className="w-5 h-5" />
                  <span>Rời phòng</span>
                </button>
              )}

              <button
                onClick={() => toggleMic()}
                disabled={!joined}
                className={`p-4 rounded-full shadow-lg ${!micOn ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} text-white disabled:opacity-50`}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => toggleCam()}
                disabled={!joined}
                className={`p-4 rounded-full shadow-lg ${!camOn ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-teal-500'} text-white disabled:opacity-50`}
              >
                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Chat & Participants panel */}
              <button
                onClick={() => togglePanel('chat')}
                className={`p-4 rounded-full shadow-lg ${activePanel === 'chat' ? 'bg-gradient-to-br from-purple-600 to-pink-600 ring-4 ring-purple-200' : 'bg-gradient-to-br from-yellow-400 to-orange-500'} text-white`}
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              <button
                onClick={() => togglePanel('participants')}
                className={`p-4 rounded-full shadow-lg ${activePanel === 'participants' ? 'bg-gradient-to-br from-indigo-600 to-blue-600 ring-4 ring-indigo-200' : 'bg-gradient-to-br from-gray-400 to-gray-500'} text-white`}
              >
                <Users className="w-5 h-5" />
              </button>
              
     <button
  onClick={() => (sharing ? stopShare() : startShare(true))}
  disabled={!joined || !isHost}
  className={`p-4 rounded-full shadow-lg ${sharing
    ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
    : 'bg-gradient-to-br from-amber-400 to-yellow-500'} text-white disabled:opacity-50`}
  title={!isHost ? "Chỉ Host/CoHost được chia sẻ"
                 : sharing ? "Dừng chia sẻ màn hình"
                           : "Chia sẻ màn hình (kèm audio hệ thống)"} >
  <Zap className="w-5 h-5" />
</button>
            
            </div>

            <div className="text-sm text-gray-600 font-medium">
              Nhấn <kbd className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">M</kbd> mic •{" "}
              <kbd className="px-2 py-1 bg-green-100 text-green-700 rounded font-bold">V</kbd> cam •{" "}
              <kbd className="px-2 py-1 bg-gray-200 rounded font-bold">Esc</kbd> ẩn panel
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRoomPage;
