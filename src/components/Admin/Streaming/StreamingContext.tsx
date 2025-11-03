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
import { setClientRole as rtcSetClientRole, renewRtcToken } from "../../../services/agoraRtc";

type RosterItem = { uid: string | number; userId: number; role: RoomRole; isSelf: boolean };
type Ctx = {
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

  createRoom: (title: string) => Promise<void>;
  admit: (userId: number) => Promise<void>;
  reject: (userId: number) => Promise<void>;
  setRole: (userId: number, role: RoomRole) => Promise<void>;

  requestJoin: (rtcUid?: string) => Promise<void>;
  raiseHand: (raised: boolean) => Promise<void>;
  fetchTokens: () => Promise<StreamingJoinGrantResponse | null>;

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
  const [room, setRoom] = useState<StreamingRoomResponse | null>(null);
  const [roomName, setRoomName] = useState<string>("");

  const [grant, setGrant] = useState<StreamingJoinGrantResponse | null>(null);
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
   const [participants, setParticipants] = useState<StreamingParticipantResponse[]>([]); // << NEW
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [waiting, setWaiting] = useState<StreamingParticipantResponse[]>([]); // <- NEW

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

  
 

  const createRoom: Ctx["createRoom"] = async (title) => {
    if (!title.trim()) { toast.error("Nhập tiêu đề phòng"); return; }
    const res = await createStreamingRoom({ title });
    if (res.code === 201 && res.result) {
      setRoom(res.result);
      setRoomName(res.result.roomName);
      toast.success("Đã tạo phòng");
    } else toast.error(res.message || "Tạo phòng thất bại");
  };

  const requestJoin: Ctx["requestJoin"] = async (rtcUid) => {
    if (!effectiveRoomName) { toast.error("Nhập roomName"); return; }
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

  const fetchTokens = async () => {
    if (!effectiveRoomName) { toast.error("Nhập roomName"); return null; }
    const res = await issueJoinTokens(effectiveRoomName);
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
    const res = await admitParticipant(effectiveRoomName, { userId });
  if (res.code === 200) {
  toast.success("Đã admit");
  await scheduleRefreshWaiting();
  await scheduleRefreshRoster();
} else toast.error(res.message || "Lỗi admit");
  };

  const reject: Ctx["reject"] = async (userId) => {
    if (!effectiveRoomName) { toast.error("Nhập roomName"); return; }
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
      isSelf: grant ? p.rtcUid === grant.rtcUid : false,
    })));
  }
}, [effectiveRoomName, grant]);



const refreshWaiting = useCallback(async () => {
  if (!effectiveRoomName) return;
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
  if (waitingBusyRef.current) return;
  waitingBusyRef.current = true;
  try {
    await refreshWaiting();
    waitingErrRef.current = 0;               // reset error streak khi thành công
  } catch (e) {
    waitingErrRef.current += 1;
    // Sau 3 lỗi liên tiếp (ví dụ backend down), ném lỗi ra ngoài để Panel tắt auto
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
    uid: g.rtcUid,
    role: isHostRole ? "host" : "audience",
  });

  // Bắt kịp remote đang publish
  await catchUpExistingRemotes(uid => createRemoteSlot(remoteWrapEl, uid));
await scheduleRefreshRoster();
if (isHostRole) await scheduleRefreshWaiting();
setJoined(true);
  toast.success("Đã vào phòng (chưa bật Cam/Mic)");
};


   const leaveLive: Ctx["leaveLive"] = async () => {
    await leaveChannel();
    setJoined(false);
    setCamOn(false);
    setMicOn(false);
    setRoster([]);
    setWaiting([]);
  };
  const toggleCam = async () => {
    if (!joined) {
      toast.error("Bạn chưa join phòng");
      return;
    }
    const next = !camOn;
    if (next) {
      await enableCamera(document.getElementById("local-player") as HTMLDivElement);
    } else {
      await disableCamera();
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
  
   const value: Ctx = {
    room, roomName, setRoomName,
    grant, joined, micOn, camOn, participants,   
    roster, waiting, isHost,      
      refreshRoster, refreshWaiting,
  scheduleRefreshRoster, scheduleRefreshWaiting,             // <- export ra
    createRoom, admit, reject, setRole: setRoleFn,
    requestJoin, raiseHand, fetchTokens,          // <- export ra
    joinLive, leaveLive, toggleMic, toggleCam,
  };

  return <StreamingContext.Provider value={value}>{children}</StreamingContext.Provider>;
};