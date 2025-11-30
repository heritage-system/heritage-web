import React, { useEffect, createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

import {
  createStreamingRoom,
  requestJoinRoom,
  issueJoinTokens,
  admitParticipant,
  rejectParticipant,
  setParticipantRole,
  toggleRaiseHand,
  getParticipants,
  getWaitingList,
   heartbeat, leaveRoom, 
   kickParticipant
  
} from "../../../services/streamingService";
import type {
  RoomRole,
  StreamingRoomResponse,
  StreamingJoinGrantResponse,
    StreamingParticipantResponse,   // <- NEW
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
const OPEN_ADMISSION = "true";

type RoomChatMsg = { id: string; from: string; text: string; ts: number };
type RosterItem = { uid: string | number; userId: number; role: RoomRole; isSelf: boolean };

type Ctx = {
    screenOn: boolean;
  toggleScreenShare: () => Promise<void>;
  
    isResyncing: boolean;                     // ✅ spinner trạng thái
  resyncParticipants: () => Promise<void>;  // ✅ đồng bộ cho bản thân
  resyncParticipantsAll: () => Promise<void>; // ✅ host phát lệnh cho toàn phòng
    kick: (userId: number) => Promise<void>; 
  pinned: RoomChatMsg | null;
localPinned: RoomChatMsg | null;
pinForEveryone: (msg: RoomChatMsg) => Promise<void>;
clearPinForEveryone: () => Promise<void>;
pinForMe: (msg: RoomChatMsg) => void;
clearPinForMe: () => void;
  room?: StreamingRoomResponse | null;
  roomName: string;
  setRoomName: (s: string) => void;
  participants: StreamingParticipantResponse[]; 
  grant?: StreamingJoinGrantResponse | null;
  joined: boolean;
  micOn: boolean;
  camOn: boolean;

  roster: RosterItem[];
  waiting: StreamingParticipantResponse[];     // <- NEW
  isHost: boolean;                              // <- NEW
  localVideoReady: boolean; setLocalVideoReady: (b: boolean) => void; 
  createRoom: (title: string) => Promise<void>;
  admit: (userId: number) => Promise<void>;
  reject: (userId: number) => Promise<void>;
  setRole: (userId: number, role: RoomRole) => Promise<void>;
  sharing: boolean;
startShare: (withAudio?: boolean) => Promise<void>;
  stopShare: () => Promise<void>;
 
  requestJoin: (rtcUid?: string) => Promise<void>;
  raiseHand: (raised: boolean) => Promise<void>;
  fetchTokens: () => Promise<StreamingJoinGrantResponse | null>;
sendRoomText: (text: string) => Promise<void>;
roomMessages: RoomChatMsg[];
  refreshRoster: () => Promise<void>;           // <- (nếu cần)
  refreshWaiting: () => Promise<void>;          // <- NEW
 scheduleRefreshWaiting: () => Promise<void>;   // ✅ thêm
  scheduleRefreshRoster: () => Promise<void>;    // ✅ thêm
  joinLive: (roleHint?: "host" | "audience") => Promise<void>;
  leaveLive: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleCam: () => Promise<void>;
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
   const [participants, setParticipants] = useState<StreamingParticipantResponse[]>([]); // << NEW
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [waiting, setWaiting] = useState<StreamingParticipantResponse[]>([]); // <- NEW
const rtmUnsubRef = useRef<null | (()=>void)>(null);
const [roomMessages, setRoomMessages] = useState<RoomChatMsg[]>([]);
  const remoteWrapRef = useRef<HTMLDivElement | null>(null);
  
const selfUserId = useMemo(() => {
  const me = roster.find(r => r.isSelf);
  return me?.userId;
}, [roster]);
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
  () => !!selfRole && (selfRole === "Host" || selfRole === "CoHost"),
  [selfRole]
);

 // --- KICK WATCHER ---
  useEffect(() => {
  if (!joined || !effectiveRoomName || !selfUserId) return;
  if (isHost) return; // ❗ host/cohost không cần poll

  const timer = setInterval(async () => {
    try {
      const adm = await getParticipants(effectiveRoomName, "Admitted");
      const stillAdmitted = adm.code === 200 && adm.result?.some(p => p.userId === selfUserId);
      if (stillAdmitted) return;

      const kicked = await getParticipants(effectiveRoomName, "Kicked");
      const isKicked = kicked.code === 200 && kicked.result?.some(p => p.userId === selfUserId);
      if (isKicked) {
        toast.error("Bạn đã bị host kick khỏi phòng");
        try { await leaveChannel(); } catch {}
        setJoined(false); setCamOn(false); setMicOn(false);
        setRoster([]); setWaiting([]);
        window.location.assign("/stream/join");
      }
    } catch {}
  }, 10000); // 10s

  return () => clearInterval(timer);
}, [joined, effectiveRoomName, selfUserId, isHost]);
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

  
 

  const createRoom: Ctx["createRoom"] = async (title) => {
    if (!title.trim()) { toast.error("Nhập tiêu đề phòng"); return; }
    const res = await createStreamingRoom({ title });
    if (res.code === 201 && res.result) {
      setRoom(res.result);
      setRoomName(res.result.roomName);
      toast.success("Đã tạo phòng");
    } else toast.error(res.message || "Tạo phòng thất bại");
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
 const requestJoin: Ctx["requestJoin"] = async (rtcUid) => {
  if (!effectiveRoomName) { toast.error("Nhập roomName"); return; }
  if (OPEN_ADMISSION) {
    // Open admission: vào thẳng, không cần gửi yêu cầu
    toast.success("Open admission: vào thẳng, không cần gửi yêu cầu");
    return;
  }
  const res = await requestJoinRoom(effectiveRoomName, { rtcUid: rtcUid ?? "" });
  if (res.code === 200) toast.success("Đã gửi yêu cầu, chờ host admit");
  else toast.error(res.message || "Gửi yêu cầu thất bại");
};

  const raiseHand: Ctx["raiseHand"] = async (raised) => {
    if (!effectiveRoomName) { toast.error("Nhập roomName"); return; }
    const res = await toggleRaiseHand(effectiveRoomName, { raised });
    if (res.code === 200) toast.success(raised ? "Đã giơ tay" : "Đã hạ tay");
    else toast.error(res.message || "Không thể cập nhật");
  };

const fetchTokens = async (nameOverride?: string) => {
  const name = nameOverride ?? effectiveRoomName;
  if (!name) { toast.error("Nhập roomName"); return null; }
  const res = await issueJoinTokens(name);

    if (res.code === 200 && res.result) {
      setGrant(res.result);
      return res.result;
    }
    toast.error(res.message || "Chưa được admit hoặc token lỗi");
    return null;
  };
  // Admin ops
const admit: Ctx["admit"] = async (userId) => {
  if (!effectiveRoomName) { toast.error("Nhập roomName"); return; }
  if (OPEN_ADMISSION) { toast.success("Open admission: không cần admit"); return; } // ✅
  const res = await admitParticipant(effectiveRoomName, { userId });
  if (res.code === 200) {
    toast.success("Đã admit");
    await scheduleRefreshWaiting();
    await scheduleRefreshRoster();
  } else toast.error(res.message || "Lỗi admit");
};

const reject: Ctx["reject"] = async (userId) => {
  if (!effectiveRoomName) { toast.error("Nhập roomName"); return; }
  if (OPEN_ADMISSION) { toast.success("Open admission: không dùng reject"); return; } // ✅
  const res = await rejectParticipant(effectiveRoomName, { userId });
  if (res.code === 200) {
    toast.success("Đã reject");
    await refreshWaiting();
  } else toast.error(res.message || "Lỗi reject");
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
        const clientRole = (role === "Host" || role === "CoHost" || role === "Speaker") ? "host" : "audience";
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
  const res = await getParticipants(effectiveRoomName, "Admitted");
  if (res.code === 200 && res.result) {
    setRoster(res.result.map(p => ({
      uid: p.rtcUid,
      userId: p.userId,
      role: p.role,
    isSelf: grant ? String(p.rtcUid) === String(grant.rtcUid) : false,
    })));
  }
}, [effectiveRoomName, grant]);



const refreshWaiting = useCallback(async () => {
  if (!effectiveRoomName) return;
  if (OPEN_ADMISSION) { setWaiting([]); return; }   // ✅ chặn gọi API
  const res = await getWaitingList(effectiveRoomName);
  if (res.code === 200 && res.result) setWaiting(res.result);
}, [effectiveRoomName]);

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

const scheduleRefreshWaiting = useCallback(async () => {
  if (OPEN_ADMISSION) return; // ✅
  if (waitingBusyRef.current) return;
  waitingBusyRef.current = true;
  try {
    await refreshWaiting();
    waitingErrRef.current = 0;
  } catch (e) {
    waitingErrRef.current += 1;
    if (waitingErrRef.current >= 3) throw e;
  } finally {
    waitingBusyRef.current = false;
  }
}, [refreshWaiting]);

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
    await refreshRoster();                            // tải lại Admitted
    if (!OPEN_ADMISSION) await refreshWaiting();      // tải hàng chờ nếu có dùng
    toast.success("Đã đồng bộ danh sách người tham gia");
  } finally {
    setIsResyncing(false);
  }
}, [effectiveRoomName, refreshRoster, refreshWaiting]);
const resyncParticipantsAll = useCallback(async () => {
  // 1) gửi tín hiệu RTM để mọi client tự refresh
  await channelSendText(JSON.stringify({ type: "resync" })).catch(()=>{});
  // 2) tự refresh cho chính mình
  await resyncParticipants();
}, [resyncParticipants]);


   // ----- Join live (giữ logic cũ của bạn, chỉ rút gọn phần không liên quan) -----
  const joinLive: Ctx["joinLive"] = async (roleHint) => {
  const appId = process.env.REACT_APP_AGORA_APP_ID || "cd0ba26e95a647afa8324b3c04021477";
  if (!appId) { toast.error("Thiếu REACT_APP_AGORA_APP_ID"); return; }

  const g = grant ?? (await fetchTokens());
  if (!g) return;

  const localEl = document.getElementById("local-player") as HTMLDivElement | null;
  const remoteWrapEl = document.getElementById("remote-container") as HTMLDivElement | null;
  if (!localEl || !remoteWrapEl) { toast.error("Thiếu phần tử video canvas"); return; }
  remoteWrapRef.current = remoteWrapEl;

  const isHostRole =
    roleHint ? roleHint === "host" : ["Host","CoHost","Speaker"].includes(g.role);

 await joinChannel({
  appId,
  channel: g.channel,
  token: g.rtcToken,
  uid: Number(g.rtcUid),           // 👈 ép number
  role: isHostRole ? "host" : "audience",
});

  // Bắt kịp remote đang publish
  await catchUpExistingRemotes(uid => createRemoteSlot(remoteWrapEl, uid));
await scheduleRefreshRoster();
if (!OPEN_ADMISSION && isHostRole) await scheduleRefreshWaiting(); // ✅
setJoined(true);
 // === RTM (Signaling 2.x) ===
// ngay trước initRtm(appId)
console.groupCollapsed("[RTM] join start");
console.log("[RTM] appId", appId);
console.log("[RTM] grant", { uid: String(g.rtcUid), channel: g.channel, hasRtmToken: !!g.rtmToken });
console.groupEnd();

try {
  initRtm(appId);
  await loginRtm({ uid: String(g.rtcUid), token: g.rtmToken });
  await joinRtmChannel(g.channel);

// THAY phần onChannelMessage cũ bằng:
rtmUnsubRef.current?.();
rtmUnsubRef.current = onChannelMessage((m) => {
  // m = { from, text, ts } từ dịch vụ RTM wrapper
  try {
    const data = JSON.parse(m.text);
    if (data?.type === "chat" && data.payload) {
      setRoomMessages(prev => [...prev, data.payload as RoomChatMsg]);
    } else if (data?.type === "pin" && data.payload) {
      setPinned(data.payload as RoomChatMsg);
    } else if (data?.type === "unpin") {
      setPinned(null);
    }
    else if (data?.type === "resync") {
  // client khác bấm "Đồng bộ toàn phòng" → mình tự refresh
  scheduleRefreshRoster();
  if (!OPEN_ADMISSION) scheduleRefreshWaiting();
}
    else {
      // fallback: nếu là plain text
      setRoomMessages(prev => [...prev, {
        id: `${m.from}-${m.ts}`,
        from: m.from,
        text: m.text,
        ts: m.ts
      }]);
    }
  } catch {
    // không phải JSON → coi như chat thường
    setRoomMessages(prev => [...prev, {
      id: `${m.from}-${m.ts}`,
      from: m.from,
      text: m.text,
      ts: m.ts
    }]);
  }
});


} catch (e:any) {
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

const leaveLive: Ctx["leaveLive"] = async () => {
  const rn = effectiveRoomName;

  try {
    // 1) RTC
    await leaveChannel();
  } catch {}

  try {
    // 2) RTM
    rtmUnsubRef.current?.(); rtmUnsubRef.current = null;
    await leaveRtmChannel();
    await destroyRtm();
  } catch {}

  try {
    // 3) cập nhật backend -> Status = Left
    if (rn) await leaveRoom(rn);
  } catch {}

  setJoined(false);
  setCamOn(false);
  setMicOn(false);
  setLocalVideoReady(false);
  setRoster([]); setWaiting([]);
  setRoomMessages([]);
};

  const toggleCam = async () => {
    if (!joined) { toast.error("Bạn chưa join phòng"); return; }
    const next = !camOn;
    if (next) {
      await enableCamera(document.getElementById("local-player") as HTMLDivElement);
      setLocalVideoReady(true);    // 👈 đánh dấu đã sẵn sàng
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
    const next = !micOn;
    if (next) await enableMic();
    else await disableMic();
    setMicOn(next);
  };
  const startShare = async (withAudio = true) => {
  const appId = process.env.REACT_APP_AGORA_APP_ID || "cd0ba26e95a647afa8324b3c04021477";
  if (!appId) { toast.error("Thiếu REACT_APP_AGORA_APP_ID"); return; }
  if (!grant) { toast.error("Chưa có grant"); return; }

  // cần token + uid riêng cho screen
  const sUid = grant.screenRtcUid;
  const sTok = grant.screenRtcToken;
  if (!sUid || !sTok) {
    toast.error("Thiếu screen token/uid. Hãy cập nhật backend trả về ScreenRtcUid/ScreenRtcToken.");
    return;
  }

  // phần tử preview local screen (tuỳ chọn)
  const screenEl = document.getElementById("local-screen") as HTMLDivElement | null;

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

const toggleScreenShare = async () => {
  if (!joined) { toast.error("Bạn chưa join phòng"); return; }
  if (!isHost) { toast.error("Chỉ Host/CoHost được chia sẻ màn hình"); return; }

  const appId = process.env.REACT_APP_AGORA_APP_ID || "cd0ba26e95a647afa8324b3c04021477";
  const g = grant ?? (await fetchTokens());
  if (!g) return;

  // Use a different UID for sharing; you must have a token for THIS uid.
  const screenUid = `${g.rtcUid}-screen`;
  try {
    if (!isScreenSharing()) {
      await startScreenShare({
        appId, channel: g.channel, token: g.rtcToken, uid: screenUid, withAudio : true
      });
      setScreenOn(true);
    } else {
      await stopScreenShare();
      setScreenOn(false);
    }
  } catch (e:any) {
    toast.error("Không thể bật/tắt chia sẻ màn hình");
  }
};

   const value: Ctx = {
    room, roomName, setRoomName,
    grant, joined, micOn, camOn, participants,   
    roster, waiting, isHost,       kick,   isResyncing,
  resyncParticipants,
  resyncParticipantsAll,
      refreshRoster, refreshWaiting,localVideoReady, setLocalVideoReady,sendRoomText, roomMessages,
  pinned,
  localPinned,
  pinForEveryone,
  clearPinForEveryone,
  pinForMe,  sharing, startShare, stopShare,  screenOn,
  toggleScreenShare,
  clearPinForMe,
  scheduleRefreshRoster, scheduleRefreshWaiting,             // <- export ra
    createRoom, admit, reject, setRole: setRoleFn,
    requestJoin, raiseHand, fetchTokens,          // <- export ra
    joinLive, leaveLive, toggleMic, toggleCam,
  };

  return <StreamingContext.Provider value={value}>{children}</StreamingContext.Provider>;
};