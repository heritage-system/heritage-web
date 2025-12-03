import React, { useEffect, createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

import {
  createStreamingRoom,
  issueJoinTokens,
  setParticipantRole,
  getParticipants,
  heartbeat,
  leaveRoom,
  kickParticipant,
} from "../../../services/streamingService";
import type {
  RoomRole,
  StreamingRoomResponse,
  StreamingJoinGrantResponse,
} from "../../../types/streaming";
import {
  joinChannel,
  leaveChannel,
  onUserPublished,
  onUserUnpublished,
  onUserJoined,
  onUserLeft,
  getClient,
  catchUpExistingRemotes,
  subscribeAndPlay,
  enableCamera,
  disableCamera,
  enableMic,
  disableMic,
  
} from "../../../services/agoraRtc";
import { initRtm, loginRtm, joinRtmChannel, leaveRtmChannel, destroyRtm, onChannelMessage, channelSendText } from "../../../services/agoraRtm";
import { setClientRole as rtcSetClientRole, renewRtcToken } from "../../../services/agoraRtc";
import { startScreenShare, stopScreenShare, isScreenSharing } from "../../../services/agoraRtc";


type RoomChatMsg = { id: string; from: string; text: string; ts: number };
type RosterItem = { uid: string | number; userId: number; role: RoomRole; isSelf: boolean };

type Ctx = {
  // room info
  room?: StreamingRoomResponse | null;
  roomName: string;
  setRoomName: (s: string) => void;

  // join / token
  grant?: StreamingJoinGrantResponse | null;
  joined: boolean;
  micOn: boolean;
  camOn: boolean;

  // who is in room
  roster: RosterItem[];
  isHost: boolean;
  localVideoReady: boolean;
  setLocalVideoReady: (b: boolean) => void;

  // admin actions
      createRoom: (title: string, startAtIso: string, eventId?: number) => Promise<void>;
  setRole: (userId: number, role: RoomRole) => Promise<void>;
  kick: (userId: number) => Promise<void>;

  // chat & pin (RTM only, không liên quan DB)
  roomMessages: RoomChatMsg[];
  sendRoomText: (text: string) => Promise<void>;
  pinned: RoomChatMsg | null;
  localPinned: RoomChatMsg | null;
  pinForEveryone: (msg: RoomChatMsg) => Promise<void>;
  clearPinForEveryone: () => Promise<void>;
  pinForMe: (msg: RoomChatMsg) => void;
  clearPinForMe: () => void;

  // roster sync
  isResyncing: boolean;
  refreshRoster: () => Promise<void>;
  scheduleRefreshRoster: () => Promise<void>;
  resyncParticipants: () => Promise<void>;
  resyncParticipantsAll: () => Promise<void>;

  // RTC/RTM join/leave
   fetchTokens: (nameOverride?: string) => Promise<StreamingJoinGrantResponse | null>;
  joinLive: (arg?: { roomName?: string; roleHint?: "host" | "audience" } | "host" | "audience") => Promise<void>;

  leaveLive: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleCam: () => Promise<void>;

  // screen share
  sharing: boolean;
  startShare: (withAudio?: boolean) => Promise<void>;
  stopShare: () => Promise<void>;
};
const StreamingContext = createContext<Ctx | null>(null);
export const useStreaming = () => {
  const ctx = useContext(StreamingContext);
  if (!ctx) throw new Error("useStreaming must be used inside <StreamingProvider>");
  return ctx;
};
export const StreamingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [pinned, setPinned] = useState<RoomChatMsg | null>(null);       // ghim toàn phòng
const [localPinned, setLocalPinned] = useState<RoomChatMsg | null>(null); // ghim riêng
  const [room, setRoom] = useState<StreamingRoomResponse | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [localVideoReady, setLocalVideoReady] = useState(false);
  const [grant, setGrant] = useState<StreamingJoinGrantResponse | null>(null);
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  const [sharing, setSharing] = useState(false);
   const [roster, setRoster] = useState<RosterItem[]>([]);
const rtmUnsubRef = useRef<null | (()=>void)>(null);
const [roomMessages, setRoomMessages] = useState<RoomChatMsg[]>([]);
  const remoteWrapRef = useRef<HTMLDivElement | null>(null);
  
// THAY selfUserId cũ
const selfUserId = useMemo(() => {
  if (grant?.rtmUid) return Number(grant.rtmUid); // stable userId từ backend
  const me = roster.find(r => r.isSelf);
  return me?.userId;
}, [grant, roster]);

  const effectiveRoomName = useMemo(
    () => roomName || room?.roomName || "",
    [roomName, room]
  );
  // isHost: ưu tiên role trong roster của chính mình, fallback grant.role
const selfRole = useMemo<RoomRole | undefined>(() => {
  const me = roster.find(r => r.isSelf);
  return me?.role ?? (["Host","CoHost","Speaker","Audience"].includes((grant?.role||"") as any) ? grant!.role as RoomRole : undefined);
}, [roster, grant]);
const isHost = useMemo(
  () => !!selfRole && (selfRole === "HOST" || selfRole === "COHOST"),
  [selfRole]
);
const leaveLive: Ctx["leaveLive"] = async () => {
  const rn = effectiveRoomName;
  try { await leaveChannel(); } catch {}
  try {
    rtmUnsubRef.current?.(); rtmUnsubRef.current = null;
    await leaveRtmChannel();
    await destroyRtm();
  } catch {}
  try {
    if (rn) await leaveRoom(rn);
  } catch {}

  setJoined(false);
  setCamOn(false);
  setMicOn(false);
  setLocalVideoReady(false);
  setRoster([]);
  setRoomMessages([]);
  setGrant(null); // 👈 QUAN TRỌNG
};
 // --- KICK WATCHER ---
useEffect(() => {
  if (!joined || !effectiveRoomName) return;
  if (!grant) return;
  if (isHost) return; // host/cohost không bị kick bằng cơ chế này

  const myUserId = selfUserId;
  const myRtcUid = grant.rtcUid;

  const timer = setInterval(async () => {
    try {
      // 1) Còn trong Admitted thì thôi
      const adm = await getParticipants(effectiveRoomName, "ADMITTED" as any);
      const stillAdmitted =
        adm.code === 200 &&
        adm.result?.some(
          (p) =>
            (myUserId && p.userId === myUserId) ||
            String(p.rtcUid) === String(myRtcUid)
        );

      if (stillAdmitted) return;

      // 2) Không còn trong Admitted → xem đã bị KICKED chưa
      const kicked = await getParticipants(effectiveRoomName, "KICKED" as any);
      const isKicked =
        kicked.code === 200 &&
        kicked.result?.some(
          (p) =>
            (myUserId && p.userId === myUserId) ||
            String(p.rtcUid) === String(myRtcUid)
        );

      if (isKicked) {
        toast.error("Bạn đã bị host kick khỏi phòng");
        try {
          await leaveLive(); // 👈 dùng hàm context
        } finally {
          window.location.assign("/stream/join");
        }
      }
    } catch {
      // ignore
    }
  }, 2000); // 2s cho responsive hơn

  return () => clearInterval(timer);
}, [joined, effectiveRoomName, grant, selfUserId, isHost, leaveLive]);

useEffect(() => {
  if (!joined) return;
  const rn = effectiveRoomName;
  if (!rn) return;

  const hb = setInterval(() => { heartbeat(rn).catch(()=>{}); }, 20000);

  // rời khi đóng/refresh trang
  const onUnload = () => { try { void leaveRoom(rn, { keepalive: true }); } catch {} };
  window.addEventListener("beforeunload", onUnload);

  // rời khi điều hướng rời site (SPA sẽ không trigger visibilitychange sai)
  const onPageHide = (e: PageTransitionEvent) => {
    if (e.persisted) return; // tránh BFCache
    try { void leaveRoom(rn, { keepalive: true }); } catch {}
  };
  window.addEventListener("pagehide", onPageHide);

  return () => {
    clearInterval(hb);
    window.removeEventListener("beforeunload", onUnload);
    window.removeEventListener("pagehide", onPageHide);
  };
}, [joined, effectiveRoomName]);

  
 

const createRoom: Ctx["createRoom"] = async (title, startAtIso, eventId) => {
  if (!title.trim()) {
    toast.error("Nhập tiêu đề phòng");
    return;
  }
  if (!startAtIso) {
    toast.error("Chọn thời gian bắt đầu");
    return;
  }

  const res = await createStreamingRoom({
    title,
    startAt: startAtIso,
    eventId: eventId ?? null,  // 👈 map sang EventId trên backend
  });

  if (res.code === 201 && res.result) {
    setRoom(res.result);
    setRoomName(res.result.roomName);
    toast.success("Đã tạo phòng");
  } else {
    toast.error(res.message || "Tạo phòng thất bại");
  }
};


const kick: Ctx["kick"] = async (userId) => {
  if (!effectiveRoomName) { toast.error("Nhập roomName"); return; }
  const res = await kickParticipant(effectiveRoomName, { userId });
  if (res.code === 200) {
    toast.success(`Đã kick user ${userId}`);
    await scheduleRefreshRoster();
  } else {
    toast.error(res.message || "Kick thất bại");
  }
};

 
const fetchTokens = async (nameOverride?: string) => {
  const name = nameOverride ?? effectiveRoomName;
  if (!name) {
    toast.error("Nhập roomName");
    return null;
  }
  const res = await issueJoinTokens(name);

  if (res.code === 200 && res.result) {
    setGrant(res.result);
    return res.result;
  }
  toast.error(res.message || "Token join lỗi");
  return null;
};


const setRoleFn: Ctx["setRole"] = async (userId, role) => {
  if (!effectiveRoomName) { toast.error("Nhập roomName"); return; }
  const res = await setParticipantRole(effectiveRoomName, { userId, role });
  if (res.code === 200) {
    toast.success("Đã đổi quyền");
    await refreshRoster(); // cập nhật role mới vào roster

    // Nếu người bị đổi quyền là chính mình → nâng cấp client ngay
    if (selfUserId && userId === selfUserId) {
      const newGrant = await fetchTokens(); // lấy token publisher nếu thành host-ish
      if (newGrant) {
        // map role → clientRole
        const clientRole = (role === "HOST" || role === "COHOST" || role === "SPEAKER") ? "host" : "audience";
        try {
          await rtcSetClientRole(clientRole);
          await renewRtcToken(newGrant.rtcToken);
          toast.success("Đã áp dụng quyền mới cho client");
        } catch (e: any) {
          // fallback: nếu renewToken không đủ, có thể leave & join lại
          toast.error("Cần rời & vào lại phòng để áp dụng quyền mới");
        }
      }
    } else {
      // nếu đổi quyền người khác → chỉ cần reload roster
      await refreshRoster();
    }
  } else {
    toast.error(res.message || "Đổi quyền thất bại");
  }
};
  // ----- Roster & Waiting helpers -----
const refreshRoster = useCallback(async () => {
  if (!effectiveRoomName) return;
  const res = await getParticipants(effectiveRoomName, "ADMITTED");
  if (res.code === 200 && res.result) {
    setRoster(
      res.result.map((p) => ({
        uid: p.rtcUid,
        userId: p.userId,
        role: p.role,
        isSelf: grant ? String(p.rtcUid) === String(grant.rtcUid) : false,
      }))
    );
  }
}, [effectiveRoomName, grant]);






const rosterBusyRef = useRef(false);
const waitingBusyRef = useRef(false);
let rosterCooldown = false;

const waitingErrRef = useRef(0);


const scheduleRefreshRoster = useCallback(async () => {
  if (rosterBusyRef.current || rosterCooldown) return;
  rosterBusyRef.current = true;
  try { await refreshRoster(); }
  finally {
    rosterBusyRef.current = false;
    rosterCooldown = true;
    setTimeout(() => { rosterCooldown = false; }, 800); // throttle
  }
}, [refreshRoster]);


const listenersRef = useRef<{
  bound: boolean;
  joined?: any; left?: any; pub?: any; unpub?: any;
}>({ bound: false });

const bindAgoraListenersOnce = () => {
  if (listenersRef.current.bound) return;

  const joined = () => scheduleRefreshRoster();
  const left = (user: any) => {
    if (remoteWrapRef.current) removeRemoteSlot(remoteWrapRef.current, user.uid!);
    scheduleRefreshRoster();
  };
  const pub = async (user: any, mediaType: "audio"|"video") => {
    if (!remoteWrapRef.current) return;
    const slot = createRemoteSlot(remoteWrapRef.current, user.uid!);
    await subscribeAndPlay(user, mediaType, slot);
  };
  const unpub = (user: any) => {
    if (remoteWrapRef.current) removeRemoteSlot(remoteWrapRef.current, user.uid!);
  };

  onUserJoined(joined);
  onUserLeft(left);
  onUserPublished(pub);
  onUserUnpublished(unpub);

  listenersRef.current = { bound: true, joined, left, pub, unpub };
};

const unbindAgoraListeners = () => {
  const c = getClient();
  const h = listenersRef.current;
  if (c && h.bound) {
    c.off?.("user-joined", h.joined);
    c.off?.("user-left", h.left);
    c.off?.("user-published", h.pub);
    c.off?.("user-unpublished", h.unpub);
  }
  listenersRef.current = { bound: false };
};

  const createRemoteSlot = (wrap: HTMLDivElement, uid: string | number) => {
    const id = `remote-${uid}`;
    let el = document.getElementById(id) as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.className = "aspect-video w-full rounded bg-black";
      wrap.appendChild(el);
    }
    return el;
  };
  const removeRemoteSlot = (wrap: HTMLDivElement, uid: string | number) => {
    const id = `remote-${uid}`;
    const el = document.getElementById(id);
    if (el && wrap.contains(el)) wrap.removeChild(el);
  };

const [isResyncing, setIsResyncing] = useState(false);

const resyncParticipants = useCallback(async () => {
  if (!effectiveRoomName) return;
  setIsResyncing(true);
  try {
    await refreshRoster();
    toast.success("Đã đồng bộ danh sách người tham gia");
  } finally {
    setIsResyncing(false);
  }
}, [effectiveRoomName, refreshRoster]);

const resyncParticipantsAll = useCallback(async () => {
  // 1) gửi tín hiệu RTM để mọi client tự refresh
  await channelSendText(JSON.stringify({ type: "resync" })).catch(() => {});
  // 2) tự refresh cho chính mình
  await resyncParticipants();
}, [resyncParticipants]);



   // ----- Join live (giữ logic cũ của bạn, chỉ rút gọn phần không liên quan) -----
const joinLive: Ctx["joinLive"] = async (arg) => {
  const appId =
    process.env.REACT_APP_AGORA_APP_ID ||
    "cd0ba26e95a647afa8324b3c04021477";
  if (!appId) {
    toast.error("Thiếu REACT_APP_AGORA_APP_ID");
    return;
  }

  // phân tích tham số: có thể là "host"/"audience" hoặc object
  let roomNameOverride: string | undefined;
  let roleHint: "host" | "audience" | undefined;

  if (typeof arg === "string") {
    roleHint = arg;
  } else if (typeof arg === "object" && arg) {
    roomNameOverride = arg.roomName;
    roleHint = arg.roleHint;
  }

  const name = roomNameOverride ?? effectiveRoomName;
  if (!name) {
    toast.error("Nhập roomName");
    return;
  }

  // Lấy grant: nếu chưa có thì fetch theo roomName
  const g = grant ?? (await fetchTokens(name));
  if (!g) return;

  const localEl = document.getElementById("local-player") as HTMLDivElement | null;
  const remoteWrapEl = document.getElementById("remote-container") as HTMLDivElement | null;
  if (!localEl || !remoteWrapEl) {
    toast.error("Thiếu phần tử video canvas");
    return;
  }
  remoteWrapRef.current = remoteWrapEl;

  const isHostRole =
    roleHint ? roleHint === "host" : ["Host", "CoHost"].includes(g.role);

  await joinChannel({
    appId,
    channel: g.channel,
    token: g.rtcToken,
    uid: Number(g.rtcUid),
    role: isHostRole ? "host" : "audience",
  });

  await catchUpExistingRemotes((uid) => createRemoteSlot(remoteWrapEl, uid));
  await scheduleRefreshRoster();
  setJoined(true);

  // === RTM ===
  console.groupCollapsed("[RTM] join start");
  console.log("[RTM] appId", appId);
  console.log("[RTM] grant", {
    uid: String(g.rtcUid),
    channel: g.channel,
    hasRtmToken: !!g.rtmToken,
  });
  console.groupEnd();

  try {
    initRtm(appId);
    await loginRtm({ uid: String(g.rtcUid), token: g.rtmToken });
    await joinRtmChannel(g.channel);

    rtmUnsubRef.current?.();
    rtmUnsubRef.current = onChannelMessage((m) => {
      try {
        const data = JSON.parse(m.text);
        if (data?.type === "chat" && data.payload) {
          setRoomMessages((prev) => [...prev, data.payload as RoomChatMsg]);
        } else if (data?.type === "pin" && data.payload) {
          setPinned(data.payload as RoomChatMsg);
        } else if (data?.type === "unpin") {
          setPinned(null);
        } else if (data?.type === "resync") {
          scheduleRefreshRoster();
        } else {
          setRoomMessages((prev) => [
            ...prev,
            {
              id: `${m.from}-${m.ts}`,
              from: m.from,
              text: m.text,
              ts: m.ts,
            },
          ]);
        }
      } catch {
        setRoomMessages((prev) => [
          ...prev,
          {
            id: `${m.from}-${m.ts}`,
            from: m.from,
            text: m.text,
            ts: m.ts,
          },
        ]);
      }
    });
  } catch (e: any) {
    console.error("[RTM] init/login/join error =", e, "stack=", e?.stack);
    toast.error("Không thể vào kênh chat");
  }

  setJoined(true);
  toast.success("Đã vào phòng");
};


const pinForEveryone = async (msg: RoomChatMsg) => {
  await channelSendText(JSON.stringify({ type: "pin", payload: msg }));
  setPinned(msg);
};
const clearPinForEveryone = async () => {
  await channelSendText(JSON.stringify({ type: "unpin" }));
  setPinned(null);
};

const pinForMe = (msg: RoomChatMsg) => setLocalPinned(msg);
const clearPinForMe = () => setLocalPinned(null);

// gửi message cho cả phòng
const sendRoomText = async (text: string) => {
  if (!text.trim()) return;
  const msg: RoomChatMsg = {
    id: `${grant?.rtcUid ?? "me"}-${Date.now()}`,
    from: String(grant?.rtcUid ?? "me"),
    text,
    ts: Date.now(),
  };
  // gửi dạng JSON để mọi client hiểu được
  await channelSendText(JSON.stringify({ type: "chat", payload: msg }));
  setRoomMessages(prev => [...prev, msg]);
};



 const toggleCam = async () => {
  if (!joined) {
    toast.error("Bạn chưa join phòng");
    return;
  }
  if (!isHost) {
    toast.error("Chỉ Host/CoHost được bật/tắt camera");
    return;
  }

  const next = !camOn;
  if (next) {
    await enableCamera(
      document.getElementById("local-player") as HTMLDivElement
    );
    setLocalVideoReady(true);
  } else {
    await disableCamera();
    setLocalVideoReady(false);
  }
  setCamOn(next);
};

useEffect(() => {
  if (!joined) return;
  bindAgoraListenersOnce();
  return () => { unbindAgoraListeners(); };
}, [joined]);

 const toggleMic = async () => {
  if (!joined) {
    toast.error("Bạn chưa join phòng");
    return;
  }
  if (!isHost) {
    toast.error("Chỉ Host/CoHost được bật/tắt mic");
    return;
  }

  const next = !micOn;
  if (next) await enableMic();
  else await disableMic();
  setMicOn(next);
};

 const startShare = async (withAudio = true) => {
  if (!joined) {
    toast.error("Bạn chưa join phòng");
    return;
  }
  if (!isHost) {
    toast.error("Chỉ Host/CoHost được chia sẻ màn hình");
    return;
  }

  const appId =
    process.env.REACT_APP_AGORA_APP_ID ||
    "cd0ba26e95a647afa8324b3c04021477";
  if (!appId) {
    toast.error("Thiếu REACT_APP_AGORA_APP_ID");
    return;
  }
  if (!grant) {
    toast.error("Chưa có grant");
    return;
  }

  const sUid = grant.screenRtcUid;
  const sTok = grant.screenRtcToken;
  if (!sUid || !sTok) {
    toast.error("Thiếu screen token/uid. Hãy cập nhật backend trả về ScreenRtcUid/ScreenRtcToken.");
    return;
  }

  const screenEl = document.getElementById(
    "local-screen"
  ) as HTMLDivElement | null;

  await startScreenShare({
    appId,
    channel: grant.channel,
    token: sTok,
    uid: sUid,
    container: screenEl ?? undefined,
    withAudio,
  });
  setSharing(true);
  toast.success("Đang chia sẻ màn hình");
};
const stopShare = async () => {
  await stopScreenShare();
  setSharing(false);
  // Bạn có thể xoá preview tile nếu muốn
};



  const value: Ctx = {
  room,
  roomName,
  setRoomName,
  grant,
  joined,
  micOn,
  camOn,
  roster,
  isHost,
  localVideoReady,
  setLocalVideoReady,

  createRoom,
  setRole: setRoleFn,
  kick,

  // chat & pin
  roomMessages,
  sendRoomText,
  pinned,
  localPinned,
  pinForEveryone,
  clearPinForEveryone,
  pinForMe,
  clearPinForMe,

  // sync
  isResyncing,
  refreshRoster,
  scheduleRefreshRoster,
  resyncParticipants,
  resyncParticipantsAll,

  // rtc
  fetchTokens,
  joinLive,
  leaveLive,
  toggleMic,
  toggleCam,

  // screen share
  sharing,
  startShare,
  stopShare,
};


  return <StreamingContext.Provider value={value}>{children}</StreamingContext.Provider>;
};