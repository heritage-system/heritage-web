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
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useStreaming } from "../../components/Admin/Streaming/StreamingContext";
import { ReactionFloat } from "./ReactionFloat";
import { RefreshCcw } from "lucide-react";
import { RoomRole } from "../../types/enum";
import toast from "react-hot-toast";

type ReactionItem = { id: number; icon: React.ReactNode; x: number };

const LiveRoomPage: React.FC = () => {
  const params = useParams<{
    roomName?: string;
    room?: string;
    roomId?: string;
  }>();
  const navigate = useNavigate();
  const { roomMessages, sendRoomText } = useStreaming();
  const {
    pinned,
    localPinned,
    pinForEveryone,
    clearPinForEveryone,
    pinForMe,
    clearPinForMe,
    isResyncing,
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

  const shownPinned = pinned || localPinned;
  const autoRef = useRef(false);
  const urlRoom = params.roomName || params.room || params.roomId || "";

  useEffect(() => {
    if (urlRoom && urlRoom !== roomName) setRoomName(urlRoom);
  }, [urlRoom, roomName, setRoomName]);

  const [activePanel, setActivePanel] = useState<"participants" | "chat" | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [message, setMessage] = useState("");
  const [pinnedUid, setPinnedUid] = useState<string | null>(null);
  const [isRemoteContainerMinimized, setIsRemoteContainerMinimized] = useState(false);

  const pinnedSlotRef = useRef<HTMLDivElement | null>(null);
  const pinnedVideoRef = useRef<HTMLElement | null>(null);
  const pinnedOriginalParentRef = useRef<HTMLElement | null>(null);
  const pinnedOriginalNextRef = useRef<ChildNode | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const participantsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasLocalVideo = joined && camOn && localVideoReady;

  const [reactions, setReactions] = useState<ReactionItem[]>([]);
  const reactionIdRef = useRef(0);

  const [openMenus, setOpenMenus] = useState<{ [userId: number]: boolean }>({});

  const isUserNearBottom = useRef(true);
  const THRESHOLD = 150;

  const checkIfNearBottom = () => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < THRESHOLD;
  };

  const handleChatScroll = () => {
    isUserNearBottom.current = checkIfNearBottom();
  };

  useEffect(() => {
    const t = window.setInterval(() => setElapsedTime((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (activePanel === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activePanel]);

  useEffect(() => {
    if (activePanel === "chat" && isUserNearBottom.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [roomMessages, activePanel]);

  useEffect(() => {
    if (activePanel === "chat") {
      isUserNearBottom.current = true;
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [activePanel]);

  useEffect(() => {
    if (activePanel === "participants" && participantsContainerRef.current) {
      participantsContainerRef.current.scrollTop =
        participantsContainerRef.current.scrollHeight;
    }
  }, [roster, activePanel]);

  useEffect(() => {
    if (autoRef.current) return;
    autoRef.current = true;
    const name = urlRoom || roomName;
    if (!name) return;
    if (!roomName) setRoomName(name);
    joinLive({ roomName: name }).catch(() => {});
  }, [urlRoom, roomName, setRoomName, joinLive]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") toggleMic().catch(() => {});
      if (e.key.toLowerCase() === "v") toggleCam().catch(() => {});
      if (e.key === "Escape") {
        setActivePanel(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggleMic, toggleCam]);

  useEffect(() => {
    const container = document.getElementById("remote-container");
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tile = target.closest("div[id^='remote-']") as HTMLElement | null;
      if (!tile) return;
      const uid = tile.id.replace("remote-", "");
      setPinnedUid((prev) => (prev === uid ? null : uid));
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const slot = pinnedSlotRef.current;
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
    if (!el || pinnedVideoRef.current === el) return;

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

  const togglePanel = (panel: "participants" | "chat") => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const toggleMenu = (userId: number) => {
    setOpenMenus((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const closeAllMenus = () => setOpenMenus({});

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const effectiveRoom = useMemo(
    () => roomName || room?.roomName || urlRoom || "—",
    [roomName, room, urlRoom]
  );

  const participantsCount = roster.length;

  const resolveDisplayName = (from: string) => {
    const u = roster.find((r) => String(r.uid) === String(from));
    return u ? (u.isSelf ? "Bạn" : u.userName) : from;
  };

  const handleLeaveAll = async () => {
    try {
      await leaveLive();
    } finally {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeaveAll}
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition"
            >
              Quay lại
            </button>
            <div className="w-px h-8 bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                W
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-800">Phòng: {effectiveRoom}</h1>
                <p className="text-xs text-gray-500">
                  {isHost ? "Bạn là Người dẫn chương trình/Đồng dẫn chương trình" : "Bạn là khán giả/diễn giả"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-row">
        <div className={`relative min-h-0 min-w-0 ${activePanel ? 'flex-auto' : 'flex-1'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 opacity-30 pointer-events-none" />
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div
              id="pinned-slot"
              ref={pinnedSlotRef}
              className={`absolute inset-4 rounded-xl overflow-hidden bg-black z-20 transition-all duration-300 ${!pinnedUid ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            />

            <div
              id="local-player"
              className={
                pinnedUid
                  ? "absolute bottom-6 right-6 w-56 h-40 rounded-xl overflow-hidden bg-black shadow-2xl border-4 border-blue-300 z-30 transition-all duration-300"
                  : "absolute inset-4 rounded-xl overflow-hidden bg-black z-20"
              }
            />

            <div
              className={`absolute left-4 bottom-4 z-30 p-2 bg-black/50 rounded-xl shadow-2xl backdrop-blur-sm transition-all duration-300 ${isRemoteContainerMinimized ? 'w-20 h-10' : 'w-[200px] h-auto max-h-[50vh] overflow-y-auto'}`}
              onMouseEnter={() => isRemoteContainerMinimized && setIsRemoteContainerMinimized(false)}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setIsRemoteContainerMinimized(prev => !prev)}
                  className="p-1 text-white/80 hover:text-white transition"
                  title={isRemoteContainerMinimized ? "Phóng to" : "Thu nhỏ"}
                >
                  {isRemoteContainerMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
              </div>
              <div
                id="remote-container"
                className={`grid gap-2 transition-all duration-300 ${isRemoteContainerMinimized ? 'hidden' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 w-full p-1'}`}
              />
            </div>

            <ReactionFloat
              reactions={reactions}
              onRemove={(id) => setReactions((prev) => prev.filter((r) => r.id !== id))}
            />
          </div>
        </div>

        <div className={`transition-all duration-300 flex-shrink-0 ${activePanel ? 'w-96' : 'w-0 overflow-hidden'}`}>
          {activePanel && (
            <div className="w-full h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
                <h3 className="font-bold text-gray-800">
                  {activePanel === "participants"
                    ? `Người trong phòng (${participantsCount})`
                    : "Trò chuyện trong phòng"}
                </h3>
                <button onClick={() => setActivePanel(null)} className="p-1 hover:bg-gray-100 rounded-full transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {activePanel === "participants" ? (
                <div
                  ref={participantsContainerRef}
                  className="flex-1 overflow-y-auto p-4"
                >
                  {roster.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center mt-8">Chưa có ai trong phòng.</div>
                  ) : (
                    roster.map((r) => {
                      const isMe = r.isSelf;
                      const canAct = isHost && !isMe;
                      return (
                        <div
                          key={`${r.uid}-${r.userId}`}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm mb-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
                              {r.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">{r.userName}</span>
                                {r.role === RoomRole.HOST && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                    Người dẫn chương trình
                                  </span>
                                )}
                                {r.role === RoomRole.COHOST && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                    Đồng dẫn chương trình
                                  </span>
                                )}
                                {r.role === RoomRole.SPEAKER && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                    Diễn giả
                                  </span>
                                )}
                                {r.role === RoomRole.AUDIENCE && <span className="text-sm text-gray-500">(Khán giả)</span>}
                                {isMe && <span className="text-xs font-medium text-indigo-600">(Bạn)</span>}
                              </div>
                            </div>
                          </div>
                          {canAct && (
                            <div className="relative">
                              <button onClick={() => toggleMenu(r.userId)} className="p-2 rounded-full hover:bg-gray-100 transition">
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                              {openMenus[r.userId] && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
                                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                      Đặt vai trò
                                    </div>
                                    <button
                                      onClick={() => {
                                        setRole(r.userId, RoomRole.COHOST);
                                        closeAllMenus();
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition"
                                    >
                                      <div className="w-4 h-4 bg-purple-100 rounded-full"></div>
                                      Đồng dẫn chương trình
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRole(r.userId, RoomRole.HOST);
                                        closeAllMenus();
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2 transition"
                                    >
                                      <div className="w-4 h-4 bg-red-100 rounded-full"></div>
                                      Người dẫn chương trình
                                    </button>
                                    <div className="my-2 border-t border-gray-200 mx-4"></div>
                                    <div className="px-4 py-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                                      Hành động
                                    </div>
                                    <button
                                      onClick={() => {
                                        closeAllMenus();
                                        toast.custom((t) => (
                                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
                                            <p className="text-sm mb-3">
                                              Bạn có chắc muốn <b>đuổi</b> <b>{r.userName}</b> khỏi phòng?
                                            </p>
                                            <div className="flex justify-end gap-2">
                                              <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-xs rounded-md border hover:bg-gray-50 transition">
                                                Hủy
                                              </button>
                                              <button
                                                onClick={async () => {
                                                  toast.dismiss(t.id);
                                                  await kick(r.userId);
                                                  toast.success("Đã đuổi người dùng khỏi phòng");
                                                }}
                                                className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                                              >
                                                Đuổi
                                              </button>
                                            </div>
                                          </div>
                                        ));
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.89 3.05a1 1 0 00-1.42 0L10 5.52 7.53 3.05a1 1 0 00-1.42 1.42L8.58 7 6.11 9.47a1 1 0 001.42 1.42L10 8.42l2.47 2.47a1 1 0 001.42-1.42L11.42 7l2.47-2.47a1 1 0 000-1.42z"/>
                                      </svg>
                                      Đuổi khỏi phòng
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="flex-1  min-h-0 flex flex-col relative">
                  {shownPinned && (
                    <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200 flex items-start gap-3 shrink-0">
                      <div className="mt-1 text-yellow-600 text-lg">📌</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600">
                          Tin nhắn được ghim {pinned ? "(toàn phòng)" : "(chỉ bạn thấy)"}
                        </div>
                        <div className="text-sm font-medium text-gray-800 break-words mt-1">
                          {shownPinned.text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {resolveDisplayName(shownPinned.from)} • {new Date(shownPinned.ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        {pinned ? (
                          isHost && (
                            <button onClick={clearPinForEveryone} className="text-xs px-3 py-1.5 rounded bg-white border border-gray-300 hover:bg-gray-50 transition">
                              Bỏ ghim
                            </button>
                          )
                        ) : (
                          <button onClick={clearPinForMe} className="text-xs px-3 py-1.5 rounded bg-white border border-gray-300 hover:bg-gray-50 transition">
                            Bỏ ghim
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div
  ref={chatContainerRef}
  onScroll={handleChatScroll}
  className="flex-1 overflow-y-auto p-4 chat-scroll"
>

                    <div className="flex flex-col gap-4">
                      {roomMessages.map((m) => {
                        const sender = roster.find((r) => String(r.uid) === String(m.from));
                        const isMe = sender?.isSelf ?? String(m.from) === String(grant?.rtcUid);
                        const displayName = sender ? (sender.isSelf ? "Bạn" : sender.userName) : (isMe ? "Bạn" : m.from);

                        return (
                          <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`flex items-end gap-3 max-w-[75%] ${isMe ? "flex-row-reverse" : ""}`}>
                              {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className={`px-4 py-3 rounded-2xl shadow-sm ${isMe ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
                                {!isMe && <p className="text-xs font-semibold text-gray-600 mb-1">{displayName}</p>}
                                <p className="text-sm break-words">{m.text}</p>
                                <div className="flex items-center justify-between mt-2 text-xs">
                                  <span className={isMe ? "text-purple-100" : "text-gray-500"}>
                                    {new Date(m.ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  <button
                                    onClick={() => (isHost ? pinForEveryone(m) : pinForMe(m))}
                                    className={`ml-3 hover:scale-110 transition ${isMe ? "text-purple-100" : "text-gray-500"}`}
                                    title={isHost ? "Ghim cho cả phòng" : "Ghim cho riêng bạn"}
                                  >
                                    📌
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

                  <div className="border-t border-gray-200 bg-white shadow-lg flex-shrink-0">
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-500 hover:text-purple-600 transition">
                          <Smile className="w-5 h-5" />
                        </button>
                        <input
                          ref={inputRef}
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (message.trim()) {
                                await sendRoomText(message);
                                setMessage("");
                              }
                            }
                          }}
                          placeholder="Nhập tin nhắn..."
                          className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                        <button
                          onClick={async () => {
                            if (message.trim()) {
                              await sendRoomText(message);
                              setMessage("");
                            }
                          }}
                          disabled={!message.trim()}
                          className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-200 p-4 z-50 pointer-events-auto flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium w-1/5">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-bold">
              {formatTime(elapsedTime)}
            </span>
            {isResyncing && (
              <button className="p-1 rounded-full text-blue-600 animate-spin" title="Đang đồng bộ lại">
                <RefreshCcw className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center gap-4">
            {joined ? (
              <button
                onClick={handleLeaveAll}
                className="w-48 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:opacity-90 text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 font-bold shadow-lg transition"
              >
                <Phone className="w-5 h-5" />
                <span>Rời phòng</span>
              </button>
            ) : (
              <button disabled className="w-48 bg-gray-300 text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 font-bold shadow">
                <PhoneCall className="w-5 h-5" />
                <span>Đang kết nối...</span>
              </button>
            )}
            <button
              onClick={toggleMic}
              disabled={!joined}
              className={`p-3 rounded-full shadow transition ${micOn ? "bg-gray-200 hover:bg-gray-300" : "bg-red-500 hover:bg-red-600 text-white"} disabled:opacity-50`}
            >
              {micOn ? <Mic className="w-5 h-5 text-gray-800" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={toggleCam}
              disabled={!joined}
              className={`p-3 rounded-full shadow transition ${camOn ? "bg-gray-200 hover:bg-gray-300" : "bg-red-500 hover:bg-red-600 text-white"} disabled:opacity-50`}
            >
              {camOn ? <Video className="w-5 h-5 text-gray-800" /> : <VideoOff className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={() => togglePanel("chat")}
              className={`p-3 rounded-full shadow transition ${activePanel === "chat" ? "bg-purple-500 ring-2 ring-purple-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              <MessageCircle className={`w-5 h-5 ${activePanel === "chat" ? "text-white" : "text-gray-800"}`} />
            </button>
            <button
              onClick={() => togglePanel("participants")}
              className={`p-3 rounded-full shadow transition ${activePanel === "participants" ? "bg-purple-500 ring-2 ring-purple-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              <Users className={`w-5 h-5 ${activePanel === "participants" ? "text-white" : "text-gray-800"}`} />
            </button>
            <button
              onClick={() => (sharing ? stopShare() : startShare(true))}
              disabled={!joined || !isHost}
              className={`p-3 rounded-full shadow transition ${sharing ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"} disabled:opacity-50`}
            >
              <Zap className={`w-5 h-5 ${sharing ? "text-white" : "text-gray-800"}`} />
            </button>
          </div>
          <div className="w-1/5 text-sm text-gray-600 font-medium text-right flex-shrink-0">
            Nhấn <kbd className="px-2 py-1 bg-gray-100 rounded font-bold">M</kbd> mic •{" "}
            <kbd className="px-2 py-1 bg-gray-100 rounded font-bold">V</kbd> cam •{" "}
            <kbd className="px-2 py-1 bg-gray-100 rounded font-bold">Esc</kbd> ẩn panel
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRoomPage;