import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Users,
  MessageCircle,
  Send,
  Smile,
  X,
  Heart,
  Laugh,
  Frown,
  ThumbsUp,
  ThumbsDown,
  Zap,
  PhoneCall,
} from "lucide-react";
import { useStreaming } from "../../components/Admin/Streaming/StreamingContext";
import { ReactionFloat } from "./ReactionFloat";
import { RefreshCcw } from "lucide-react";
import { RoomRole } from "../../types/enum";

/**
 * LiveRoomPage - All-in-one
 * - Đồng bộ roomName từ URL param (:room / :roomName / :roomId)
 * - Join/Leave, bật/tắt mic/cam qua StreamingContext
 * - Hiển thị local/remote canvas đúng id: #local-player / #remote-container
 * - Roster/Waiting
 * - Chat & Reactions
 * - 🔹 NEW: Pin bất kỳ ô remote nào để đưa lên canvas chính (kiểu Google Meet)
 */

type ReactionItem = { id: number; icon: React.ReactNode; x: number };

const LiveRoomPage: React.FC = () => {
  const params = useParams<{
    roomName?: string;
    room?: string;
    roomId?: string;
  }>();
  const navigate = useNavigate();

  // --- Lấy dữ liệu & hàm từ StreamingContext (gọi hook ở top-level) ---
  const { roomMessages, sendRoomText } = useStreaming();

  const {
    pinned,
    localPinned,
    pinForEveryone,
    clearPinForEveryone,
    pinForMe,
    clearPinForMe,
    isResyncing,
    resyncParticipants,
    resyncParticipantsAll,
  } = useStreaming();

  const { sharing, startShare, stopShare } = useStreaming();

  const {
    room,
    roomName,
    setRoomName,
    grant,
    joined,
    micOn,
    camOn,
    roster,
    isHost,
    joinLive,
    leaveLive,
    toggleMic,
    toggleCam,
    setRole,
    kick,
  } = useStreaming();

  const { localVideoReady } = useStreaming();

  const shownPinned = pinned || localPinned; // ưu tiên ghim toàn phòng
  const autoRef = useRef(false);

  // Lấy room từ URL: hỗ trợ /live/:room, /live/:roomName, /live/:roomId
  const urlRoom = params.roomName || params.room || params.roomId || "";

  // Đồng bộ vào Context
  useEffect(() => {
    if (urlRoom && urlRoom !== roomName) setRoomName(urlRoom);
  }, [urlRoom, roomName, setRoomName]);

  // ============== UI STATE (chat, reactions, pin remote) ==============
  const [activePanel, setActivePanel] = useState<"participants" | "chat" | null>(
    null
  );

  const [showUI, setShowUI] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [message, setMessage] = useState("");

  // demo local messages (không dùng tới RTM – giữ lại nếu sau này muốn)
  const [messages, setMessages] = useState<
    { id: number; user: string; text: string; time: string; isHost: boolean }[]
  >([{ id: 1, user: "Host", text: "Chào mọi người! Bắt đầu nào!", time: "14:02", isHost: true }]);

  // 🔹 NEW: pin remote video
  const [pinnedUid, setPinnedUid] = useState<string | null>(null);
  const pinnedSlotRef = useRef<HTMLDivElement | null>(null);
  const pinnedVideoRef = useRef<HTMLElement | null>(null);
  const pinnedOriginalParentRef = useRef<HTMLElement | null>(null);
  const pinnedOriginalNextRef = useRef<ChildNode | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasLocalVideo = joined && camOn && localVideoReady;
  const showPlaceholder = !hasLocalVideo;
  const isCameraOff = !camOn;

  // Reactions
  const [reactions, setReactions] = useState<ReactionItem[]>([]);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const reactionIdRef = useRef(0);
  const reactionIcons = [
    { Icon: Heart, color: "text-red-500" },
    { Icon: Laugh, color: "text-yellow-500" },
    { Icon: Frown, color: "text-blue-500" },
    { Icon: ThumbsUp, color: "text-green-500" },
    { Icon: ThumbsDown, color: "text-gray-600" },
    { Icon: Zap, color: "text-purple-500" },
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
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onMove);
    window.addEventListener("touchstart", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onMove);
      window.removeEventListener("touchstart", onMove);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  // Đếm giờ
  useEffect(() => {
    const t = window.setInterval(() => setElapsedTime((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (activePanel === "chat") {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [activePanel]);

  // Cuộn chat xuống cuối mỗi khi roomMessages thay đổi
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

  // Auto join khi vào trang
  useEffect(() => {
    if (autoRef.current) return;
    autoRef.current = true;

    const name = urlRoom || roomName;
    if (!name) return;

    if (!roomName) setRoomName(name);

    joinLive({ roomName: name }).catch(() => {});
  }, [urlRoom, roomName, setRoomName, joinLive]);

  // Phím tắt M / V / Esc – dùng các hàm toggleMic/toggleCam đã destructure
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") toggleMic().catch(() => {});
      if (e.key.toLowerCase() === "v") toggleCam().catch(() => {});
      if (e.key === "Escape") {
        setActivePanel(null);
        setShowReactionMenu(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggleMic, toggleCam]);

  // 🔹 NEW: click vào ô remote-* để pin / unpin (chỉ move DOM, không động vào Agora)
  useEffect(() => {
    const container = document.getElementById("remote-container");
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tile = target.closest("div[id^='remote-']") as HTMLElement | null;
      if (!tile) return;

      const id = tile.id; // ví dụ: remote-10006
      const uid = id.replace("remote-", "");

      setPinnedUid((prev) => (prev === uid ? null : uid));
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, []);

  // 🔹 Move/restore remote tile khi pinnedUid thay đổi
  useEffect(() => {
    const slot = pinnedSlotRef.current;

    // Nếu bỏ ghim → trả video về chỗ cũ
    if (!pinnedUid) {
      if (pinnedVideoRef.current && pinnedOriginalParentRef.current) {
        pinnedOriginalParentRef.current.insertBefore(
          pinnedVideoRef.current,
          pinnedOriginalNextRef.current
        );
      }
      pinnedVideoRef.current = null;
      pinnedOriginalParentRef.current = null;
      pinnedOriginalNextRef.current = null;
      return;
    }

    if (!slot) return;

    const el = document.getElementById(`remote-${pinnedUid}`);
    if (!el) return;

    if (pinnedVideoRef.current === el) return;

    // trả element cũ về chỗ cũ trước khi ghim cái mới
    if (pinnedVideoRef.current && pinnedOriginalParentRef.current) {
      pinnedOriginalParentRef.current.insertBefore(
        pinnedVideoRef.current,
        pinnedOriginalNextRef.current
      );
    }

    pinnedOriginalParentRef.current = el.parentElement as HTMLElement;
    pinnedOriginalNextRef.current = el.nextSibling;
    pinnedVideoRef.current = el as HTMLElement;

    slot.appendChild(el);
  }, [pinnedUid]);

  // Cleanup pin khi unmount
  useEffect(() => {
    return () => {
      if (pinnedVideoRef.current && pinnedOriginalParentRef.current) {
        pinnedOriginalParentRef.current.insertBefore(
          pinnedVideoRef.current,
          pinnedOriginalNextRef.current
        );
      }
    };
  }, []);

  // --- Gửi tin nhắn demo local (hiện không dùng tới) ---
  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        user: "Bạn",
        text: message,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isHost: false,
      },
    ]);
    setMessage("");
  };

  // Thả reaction (demo)
  const sendReaction = (Icon: React.ElementType, color: string) => {
    const id = reactionIdRef.current++;
    const x = Math.random() * 60 + 20; // vị trí ngẫu nhiên
    setReactions((prev) => [
      ...prev,
      { id, icon: <Icon className={`w-6 h-6 ${color}`} />, x },
    ]);
    setShowReactionMenu(false);
    resetTimer();
  };
  const removeReaction = (id: number) =>
    setReactions((prev) => prev.filter((r) => r.id !== id));

  const togglePanel = (panel: "participants" | "chat") => {
    setActivePanel((prev) => (prev === panel ? null : panel));
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const effectiveRoom = useMemo(
    () => roomName || room?.roomName || urlRoom || "—",
    [roomName, room, urlRoom]
  );
  const participantsCount = roster.length;

  // Rời phòng (về lại trang trước)
  const handleLeaveAll = async () => {
    try {
      await leaveLive();
    } finally {
      navigate(-1);
    }
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
        <button
          onClick={handleLeaveAll}   // 👈 dùng chung hàm leaveAll
          className="text-gray-600 hover:text-blue-600 font-medium text-sm"
        >
          Quay lại
        </button>
        <div className="w-px h-8 bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
            W
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">
              Phòng: {effectiveRoom}
            </h1>
            <p className="text-xs text-gray-500">
              {isHost ? "Bạn là Người dẫn chương trình/Đồng dẫn chương trình" : "Bạn là khán giả/diễn giả"}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


      {/* VIDEO AREA */}
<div
  className={`relative transition-all duration-300 ${
    showUI ? "h-[calc(100vh-10rem)]" : "h-screen"
  }`}
  onMouseEnter={resetTimer}
>
  {/* Background gradient nhẹ, không che video */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 opacity-30 pointer-events-none" />

  {/* Nội dung video - relative để nằm trên background */}
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Pinned slot */}
    {pinnedUid && (
      <div
        id="pinned-slot"
        ref={pinnedSlotRef}
        className="absolute inset-0 m-4 rounded-xl overflow-hidden bg-black"
        style={{ zIndex: 20 }}
      />
    )}

    {/* Local video */}
    <div
      id="local-player"
      className={pinnedUid
        ? "absolute bottom-6 right-6 w-56 h-40 rounded-xl overflow-hidden bg-black shadow-2xl border-4 border-blue-300"
        : "absolute inset-0 m-4 rounded-xl overflow-hidden bg-black"
      }
      style={{ zIndex: pinnedUid ? 25 : 20 }}
    />

    {/* Remote container */}
    <div
      id="remote-container"
      className="absolute left-4 bottom-4 grid grid-cols-2 gap-2 w-[480px] max-w-[48vw]"
      style={{ zIndex: 25 }}
    />

    {/* Placeholder chỉ hiện khi cần */}
    {showPlaceholder && !pinnedUid && (
      <div className="text-center select-none z-10">
        {/* nội dung placeholder */}
      </div>
    )}

    {/* Avatar PIP khi tắt cam */}
    {showUI && !hasLocalVideo && (
      <div className="absolute bottom-6 right-6 ...">
        {/* avatar */}
      </div>
    )}
  </div>

  <ReactionFloat reactions={reactions} onRemove={removeReaction} />
</div>

      {/* SIDE PANEL (Roster / Chat) */}
      {activePanel && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center">
              {activePanel === "participants"
                ? `Người trong phòng (${participantsCount})`
                : "Trò chuyện trong phòng"}
            </h3>
            <div className="flex items-center gap-2">
              {/* Đồng bộ cục bộ*/}
              <button
                onClick={() => resyncParticipants()}
                disabled={isResyncing}
                className="px-2 py-1 text-xs rounded border bg-white text-gray-700 invisible pointer-events-none"
                title="Đồng bộ số người (chỉ trên máy bạn)"
              >
                <RefreshCcw
                  className={`w-4 h-4 inline mr-1 ${isResyncing ? "animate-spin" : ""}`}
                />
                Đồng bộ
              </button>

              {/* Đồng bộ toàn phòng (ẩn nhưng không xoá chức năng) */}
              {isHost && (
                <button
                  onClick={() => resyncParticipantsAll()}
                  disabled={isResyncing}
                  className="px-2 py-1 text-xs rounded border bg-indigo-50 text-indigo-700 border-indigo-200 invisible pointer-events-none"
                  title="Gửi lệnh đồng bộ cho toàn phòng"
                >
                  <RefreshCcw
                    className={`w-4 h-4 inline mr-1 ${isResyncing ? "animate-spin" : ""}`}
                  />
                  Đồng bộ toàn phòng
                </button>
              )}

              {/* Close panel vẫn hiện */}
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          {activePanel === "participants" ? (
            <div className="flex-1 overflow-y-auto p-4">
              {roster.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Chưa có ai trong phòng.
                </div>
              ) : (
                roster.map((r) => {
                  const isMe = r.isSelf;
                  const canAct = isHost && !isMe;
                  return (
                    <div
  key={`${r.uid}-${r.userId}`}
  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm"
>
  {/* LEFT INFO */}
  <div className="text-sm space-y-1">
    <div className="flex items-center gap-1">
      <span className="font-medium text-gray-800">Tên người dùng:</span>
      <span className="text-gray-700">{r.userName}</span>
      {isMe && <span className="text-xs text-gray-500">(Bạn)</span>}
    </div>

    <div className="flex items-center gap-1">
      <span className="font-medium text-gray-800">Vai trò:</span>
      <span className="text-gray-700">{RoomRole[r.role]}</span>
    </div>
  </div>

  {/* ACTION BUTTONS */}
  {canAct && (
    <div className="flex items-center gap-2">

      <button
        onClick={() => setRole(r.userId, RoomRole.COHOST)}
        className="px-3 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
        title="Đặt làm Co-host"
      >
        Đồng dẫn chương trình
      </button>

      <button
        onClick={() => setRole(r.userId, RoomRole.HOST)}
        className="px-3 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
        title="Đặt làm Host"
      >
        Người dẫn chương trình
      </button>

      <button
        onClick={async () => {
          const ok = window.confirm(
            `Bạn có chắc muốn kick người dùng ${r.userId} khỏi phòng?`
          );
          if (ok) await kick(r.userId);
        }}
        className="px-3 py-1 text-xs rounded-md border border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
        title="Đuổi khỏi phòng"
      >
        Đuổi
      </button>

    </div>
  )}
</div>
                  );
                })
              )}
            </div>
          ) : (
            // CHAT MODE
            <div className="flex-1 flex flex-col">
              {shownPinned && (
                <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex items-start gap-3">
                  <div className="mt-1">📌</div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">
                      Tin nhắn được ghim
                      {pinned ? " (toàn phòng)" : " (chỉ mình bạn)"}
                    </div>
                    <div className="text-sm font-medium text-gray-800 break-words">
                      {shownPinned.text}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {shownPinned.from} •{" "}
                      {new Date(shownPinned.ts).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {pinned ? (
                    isHost && (
                      <button
                        onClick={clearPinForEveryone}
                        className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50"
                      >
                        Bỏ ghim
                      </button>
                    )
                  ) : (
                    <button
                      onClick={clearPinForMe}
                      className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50"
                    >
                      Bỏ ghim
                    </button>
                  )}
                </div>
              )}

              {/* Composer */}
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-purple-600">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        await sendRoomText(message);
                        setMessage("");
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={async () => {
                      await sendRoomText(message);
                      setMessage("");
                    }}
                    className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* History */}
              <div
                ref={chatListRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {roomMessages.map((m) => {
                  const isMe = String(m.from) === String(grant?.rtcUid);
                  return (
                    <div
                      key={m.id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="flex items-start gap-2 max-w-xs">
                        <div
                          className={`px-4 py-2 rounded-2xl shadow-sm ${
                            isMe
                              ? "bg-gradient-to-r from-purple-100 to-pink-100"
                              : "bg-gradient-to-r from-yellow-50 to-orange-50"
                          } text-gray-800`}
                        >
                          <p className="text-xs font-semibold">
                            {isMe ? "Bạn" : m.from}
                          </p>
                          <p className="text-sm break-words">{m.text}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] text-gray-500">
                              {new Date(m.ts).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <button
                              onClick={() =>
                                isHost ? pinForEveryone(m) : pinForMe(m)
                              }
                              className="text-[11px] text-gray-500 hover:text-gray-800 ml-2"
                              title={
                                isHost
                                  ? "Ghim cho cả phòng"
                                  : "Ghim cho riêng bạn"
                              }
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

     {/* CONTROL BAR */}
{showUI && (
  <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-4 z-50">
    <div className="max-w-7xl mx-auto flex items-center">

      {/* LEFT: Time */}
      <div className="w-1/5 flex items-center gap-2 text-sm text-gray-600 font-medium">
        <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-bold">
          {formatTime(elapsedTime)}
        </span>
      </div>

      {/* CENTER BUTTON GROUP */}
      <div className="flex-1 flex items-center justify-center gap-4">

        {/* Leave / Connecting */}
        {joined ? (
          <button
            onClick={handleLeaveAll}
            className="w-48 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:bg-red-700 text-white 
                       px-6 py-3 rounded-full flex items-center justify-center 
                       gap-2 font-bold shadow"
          >
            <Phone className="w-5 h-5" />
            <span>Rời phòng</span>
          </button>
        ) : (
          <button
            disabled
            className="w-48 bg-gray-300 text-white 
                       px-6 py-3 rounded-full flex items-center 
                       justify-center gap-2 font-bold shadow"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Đang kết nối...</span>
          </button>
        )}

        {/* ICON BUTTON BASE STYLE */}
        {/* Mic */}
        <button
          onClick={toggleMic}
          disabled={!joined}
          className={`p-3 rounded-full shadow transition ${
            micOn ? "bg-gray-200 hover:bg-gray-300" : "bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:bg-red-600"
          } text-white disabled:opacity-50`}
        >
          {micOn ? <Mic className="w-5 h-5 text-gray-800" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Cam */}
        <button
          onClick={toggleCam}
          disabled={!joined}
          className={`p-3 rounded-full shadow transition ${
            camOn ? "bg-gray-200 hover:bg-gray-300" : "bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:bg-red-600"
          } text-white disabled:opacity-50`}
        >
          {camOn ? <Video className="w-5 h-5 text-gray-800" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Chat */}
        <button
          onClick={() => togglePanel("chat")}
          className={`p-3 rounded-full shadow transition ${
            activePanel === "chat"
              ? "bg-gray-300 ring-2 ring-gray-400"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <MessageCircle className="w-5 h-5 text-gray-800" />
        </button>

        {/* Participants */}
        <button
          onClick={() => togglePanel("participants")}
          className={`p-3 rounded-full shadow transition ${
            activePanel === "participants"
              ? "bg-gray-300 ring-2 ring-gray-400"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <Users className="w-5 h-5 text-gray-800" />
        </button>

        {/* Share */}
        <button
          onClick={() => (sharing ? stopShare() : startShare(true))}
          disabled={!joined || !isHost}
          className={`p-3 rounded-full shadow transition ${
            sharing ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-gray-200 hover:bg-gray-300"
          } disabled:opacity-50`}
        >
          <Zap className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* RIGHT: Hotkeys */}
      <div className="w-1/5 text-sm text-gray-600 font-medium text-right">
        Nhấn{" "}
        <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-bold">M</kbd> bật/tắt mic •{" "}
        <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-bold">V</kbd> bật/tắt cam •{" "}
        <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-bold">Esc</kbd> ẩn panel
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default LiveRoomPage;