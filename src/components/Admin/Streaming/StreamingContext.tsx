import React, { useEffect, createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

import {
  issueJoinTokens,
  setParticipantRole,
  getParticipants,
  heartbeat,
  leaveRoom,
  kickParticipant,
} from "../../../services/streamingService";
import {
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
import { initRtm, loginRtm, joinRtmChannel, leaveRtmChannel, destroyRtm, onChannelMessage, channelSendText, onConnectionStateChanged } from "../../../services/agoraRtm";
import { setClientRole as rtcSetClientRole, renewRtcToken } from "../../../services/agoraRtc";
import { startScreenShare, stopScreenShare, isScreenSharing } from "../../../services/agoraRtc";
import { ParticipantStatus, RoomRole } from "../../../types/enum";


type RoomChatMsg = { id: string; from: string; text: string; ts: number };
type RosterItem = {
  userName: string ; uid: string | number; userId: number; role: RoomRole; isSelf: boolean 
};

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
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);

  const [sharing, setSharing] = useState(false);
   const [roster, setRoster] = useState<RosterItem[]>([]);

const rtmUnsubRef = useRef<null | (() => void)>(null);
const rtmConnUnsubRef = useRef<null | (() => void)>(null); // 👈 THÊM

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
// Ưu tiên role từ roster, fallback role trong grant
const selfRole = useMemo<RoomRole | undefined>(() => {
  const me = roster.find((r) => r.isSelf);
  if (typeof me?.role === "number") return me.role;
  if (typeof grant?.role === "number") return grant.role as RoomRole;
  return undefined;
}, [roster, grant]);

const isHost = useMemo(
  () =>
    selfRole === RoomRole.HOST ||
    selfRole === RoomRole.COHOST,
  [selfRole]
);

const leaveLive: Ctx["leaveLive"] = async () => {
  const rn = effectiveRoomName;

  // 1️⃣ Backend trước
  try {
    if (rn) {
      await leaveRoom(rn);
    }
  } catch (e) {
    console.warn("[leaveLive] leaveRoom error", e);
  }

  // 2️⃣ RTM resync (nếu đang join RTM)
  try {
    await channelSendText(JSON.stringify({ type: "resync" }));
  } catch (e) {
    console.warn("[leaveLive] send resync failed", e);
    // nếu RTM chưa join (join channel first) thì thôi, chỉ rely vào "user-left" của Agora
  }

  // 3️⃣ Rời kênh RTC
  try {
    await leaveChannel();
  } catch (e) {
    console.warn("[leaveLive] leaveChannel error", e);
  }

  // 4️⃣ Rời RTM + destroy client
// 4️⃣ Rời RTM + destroy client
try {
  rtmUnsubRef.current?.();
  rtmUnsubRef.current = null;

  rtmConnUnsubRef.current?.();        // 👈 HUỶ luôn ConnectionStateChanged listener
  rtmConnUnsubRef.current = null;

  await leaveRtmChannel();
  await destroyRtm();
} catch (e) {
  console.warn("[leaveLive] RTM leave/destroy error", e);
}


  // 5️⃣ Reset state
  setJoined(false);
  setCamOn(false);
  setMicOn(false);
  setLocalVideoReady(false);
  setRoster([]);
  setRoomMessages([]);
  setGrant(null);
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
    const adm = await getParticipants(effectiveRoomName, ParticipantStatus.ADMITTED);
// ...


      const stillAdmitted =
        adm.code === 200 &&
        adm.result?.some(
          (p) =>
            (myUserId && p.userId === myUserId) ||
            String(p.rtcUid) === String(myRtcUid)
        );

      if (stillAdmitted) return;

      // 2) Không còn trong Admitted → xem đã bị KICKED chưa
     const kicked = await getParticipants(effectiveRoomName, ParticipantStatus.KICKED);
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
          if (window.history.length > 1) {
            window.history.back();         // quay lại trang trước
          } else {
            window.location.assign("/");   // fallback nếu không có history
          }
        }
      }

    } catch {
      // ignore
    }
  }, 10000); // 10s cho responsive hơn

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
const effectiveRoomNameRef = useRef(effectiveRoomName);
useEffect(() => {
  effectiveRoomNameRef.current = effectiveRoomName;
}, [effectiveRoomName]);

const grantRef = useRef<StreamingJoinGrantResponse | null>(grant);
useEffect(() => {
  grantRef.current = grant;
}, [grant]);
const refreshRoster = useCallback(async () => {
  const rn = effectiveRoomNameRef.current;
  if (!rn) return;

  const g = grantRef.current;

  const res = await getParticipants(rn, ParticipantStatus.ADMITTED);

  if (res.code === 200 && res.result) {
    setRoster(
      res.result.map((p) => ({
        uid: p.rtcUid,
        userId: p.userId,
        userName: p.userName,
        role: p.role,
        isSelf: g ? String(p.rtcUid) === String(g.rtcUid) : false,
      }))
    );
  }
}, []); // 👈 không còn deps nữa, dùng ref


 
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

 useEffect(() => {
  if (!joined) return;
  // khi vừa join xong, cố sync roster một lần nữa theo logic chuẩn
  void resyncParticipants();
}, [joined, resyncParticipants]);




const kick: Ctx["kick"] = async (userId) => {
  if (!effectiveRoomName) { toast.error("chưa Nhập roomName"); return; }
  const res = await kickParticipant(effectiveRoomName, { userId });
  if (res.code === 200) {
    toast.success(`Đã kick user ${userId}`);

    // 🔥 Thay vì chỉ refresh local → đồng bộ TOÀN PHÒNG giống nút "Đồng bộ toàn phòng"
    await resyncParticipantsAll();
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
  if (!effectiveRoomName) {
    toast.error("Nhập roomName");
    return;
  }

  const res = await setParticipantRole(effectiveRoomName, { userId, role });

  if (res.code !== 200) {
    toast.error(res.message || "Đổi quyền thất bại");
    return;
  }

  toast.success("Đã đổi quyền");

  // 🔥 1) Gửi lệnh RESYNC cho TOÀN PHÒNG + tự refresh cho host
  await resyncParticipantsAll();

  // 🔥 2) Nếu chính mình được đổi quyền → apply xuống RTC client
  if (selfUserId && userId === selfUserId) {
    const newGrant = await fetchTokens(); // lấy token mới nếu role cho phép publish
    if (!newGrant) return;

    const clientRole =
      role === RoomRole.HOST ||
      role === RoomRole.COHOST ||
      role === RoomRole.SPEAKER
        ? "host"
        : "audience";

    try {
      await rtcSetClientRole(clientRole);
      await renewRtcToken(newGrant.rtcToken);
      toast.success("Đã áp dụng quyền mới cho client");
    } catch (e: any) {
      // Nếu renewToken fail (VD: role change phức tạp), để user tự re-join
      toast.error("Cần rời & vào lại phòng để áp dụng quyền mới");
    }
  }
};

  // ----- Roster & Waiting helpers -----






const rosterBusyRef = useRef(false);

const scheduleRefreshRoster = useCallback(async () => {
  // chỉ tránh chồng lấp, KHÔNG cooldown
  if (rosterBusyRef.current) return;
  rosterBusyRef.current = true;
  try {
    await refreshRoster();
  } finally {
    rosterBusyRef.current = false;
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
const pub = async (user: any, mediaType: "audio" | "video") => {
  if (mediaType === "video") {
    if (!remoteWrapRef.current) return;
    const slot = createRemoteSlot(remoteWrapRef.current, user.uid!);
    await subscribeAndPlay(user, mediaType, slot);
  } else {
    // audio không cần container
    await subscribeAndPlay(user, mediaType);
  }
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
  roleHint
    ? roleHint === "host"
    : g.role === RoomRole.HOST || g.role === RoomRole.COHOST;


    await joinChannel({
    appId,
    channel: g.channel,
    token: g.rtcToken,
    uid: Number(g.rtcUid),
    role: isHostRole ? "host" : "audience",
  });

  await catchUpExistingRemotes((uid) => createRemoteSlot(remoteWrapEl, uid));

  // 🔥 AUTO LOAD ROSTER NGAY SAU KHI JOIN (không cần bấm "Đồng bộ")
  try {
    const res = await getParticipants(name, "ADMITTED" as any);
    if (res.code === 200 && res.result) {
      setRoster(
        res.result.map((p) => ({
          uid: p.rtcUid,
          userName : p.userName,
          userId: p.userId,
          role: p.role,
          // dùng grant hiện tại (g) để đánh dấu "mình"
          isSelf: String(p.rtcUid) === String(g.rtcUid),
        }))
      );
    }
  } catch (e) {
    console.warn("[joinLive] initial getParticipants failed", e);
  }

  // vẫn có thể giữ scheduleRefreshRoster để sync tiếp nếu cần
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

    // --- Lắng nghe khi RTM bị logout vì login từ thiết bị khác ---
    rtmConnUnsubRef.current?.();
    try {
      rtmConnUnsubRef.current = onConnectionStateChanged(
        (state, reason) => {
          console.log("[RTM] ConnectionStateChanged =", state, reason);
          // khi cùng UID login ở thiết bị khác → phiên hiện tại bị ABORTED với reason REMOTE_LOGIN
          if (state === "ABORTED" && reason === "REMOTE_LOGIN") {
            toast.error(
              "Phiên live trên thiết bị này đã bị thay thế bởi đăng nhập từ thiết bị khác. Sẽ tự thoát khỏi phòng."
            );

            (async () => {
              try {
                await leaveLive(); // rời phòng, clean RTC/RTM/local state
              } finally {
                if (window.history.length > 1) {
                  window.history.back();   // giống navigate(-1)
                } else {
                  window.location.assign("/"); // fallback
                }
              }
            })();
          }
        }
      );
    } catch (err) {
      console.warn("[RTM] cannot bind ConnectionStateChanged listener", err);
    }

    // --- listener ChannelMessage cũ giữ nguyên ---
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
      // 🔥 nhận lệnh resync → luôn refresh roster ngay, KHÔNG đi qua schedule/throttle
      refreshRoster().catch((err) => {
        console.warn("[RTM] auto refreshRoster failed", err);
      });

    } else {
      // các message text cũ / fallback
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
    // nếu parse JSON fail → lưu lại dạng text thường
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


    // 🔥 SAU KHI ĐÃ JOIN RTM CHANNEL:
    // Gửi tín hiệu "resync" để TẤT CẢ client trong phòng
    // gọi scheduleRefreshRoster() giống như bấm "Đồng bộ toàn phòng"
    try {
      await channelSendText(JSON.stringify({ type: "resync" }));
      // đồng bộ chính mình luôn cho chắc (tương đương resyncParticipantsAll)
      await resyncParticipants();
    } catch (err) {
      console.warn("[joinLive] auto resync after join failed", err);
    }
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


const toggleCam: Ctx["toggleCam"] = async () => {
  if (!joined) {
    toast.error("Bạn chưa join phòng");
    return;
  }

  // ❗ Audience gọi tới thì bỏ qua, KHÔNG toast
  if (!isHost) return;

  const wantOn = !camOn;

  if (wantOn) {
    try {
      const container = document.getElementById("local-player") as HTMLDivElement | null;
      await enableCamera(container ?? undefined);
      setLocalVideoReady(true);
      setCamOn(true);
    } catch (err: any) {
      console.error("[toggleCam] enableCamera error", err);

      const name = err?.name || "";
      const msg = (err?.message || "").toLowerCase();

      if (
        name === "NotAllowedError" ||
        name === "SecurityError" ||
        msg.includes("denied") ||
        msg.includes("permission") ||
        msg.includes("not allowed")
      ) {
        toast.error("Bạn đã từ chối cho phép sử dụng camera cho tab này.");
      } else {
        toast.error("Không thể bật camera. Vui lòng kiểm tra thiết bị & quyền truy cập.");
      }

      setLocalVideoReady(false);
      setCamOn(false);
    }
  } else {
    try {
      await disableCamera();
    } catch (err) {
      console.warn("[toggleCam] disableCamera error", err);
    } finally {
      setLocalVideoReady(false);
      setCamOn(false);
    }
  }
};


useEffect(() => {
  if (!joined) return;

  // 1) Bind listener cho user-joined / user-published / ...
  bindAgoraListenersOnce();

  // 2) Sau khi listener đã bind, cố gắng "bắt kịp" tất cả remote đang có
  const wrap = remoteWrapRef.current;
  if (wrap) {
    // có container → tạo slot cho từng uid
    void catchUpExistingRemotes((uid) => createRemoteSlot(wrap, uid));
  } else {
    // không có container (ít khi xảy ra) → ít nhất vẫn subscribe audio
    void catchUpExistingRemotes();
  }

  return () => {
    unbindAgoraListeners();
  };
}, [joined]);


const toggleMic: Ctx["toggleMic"] = async () => {
  if (!joined) {
    toast.error("Bạn chưa join phòng");
    return;
  }

  // ❗ Audience gọi tới thì bỏ qua, KHÔNG toast
  if (!isHost) return;

  const wantOn = !micOn;

  if (wantOn) {
    try {
      await enableMic();
      setMicOn(true);
    } catch (err: any) {
      console.error("[toggleMic] enableMic error", err);
      const name = err?.name || "";
      const msg = (err?.message || "").toLowerCase();

      if (
        name === "NotAllowedError" ||
        name === "SecurityError" ||
        msg.includes("denied") ||
        msg.includes("permission") ||
        msg.includes("not allowed")
      ) {
        // ❗ Đây là lỗi permission của TRÌNH DUYỆT – chỉ user hiện tại thấy
        toast.error("Bạn đã từ chối cho phép sử dụng micro cho tab này.");
      } else {
        toast.error("Không thể bật micro. Vui lòng kiểm tra thiết bị & quyền truy cập.");
      }

      setMicOn(false);
    }
  } else {
    try {
      await disableMic();
    } catch (err) {
      console.warn("[toggleMic] disableMic error", err);
    } finally {
      setMicOn(false);
    }
  }
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