import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

let client: IAgoraRTCClient | null = null;
let localVideoTrack: ICameraVideoTrack | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;

// NEW: screen share
let screenClient: IAgoraRTCClient | null = null;
let screenVideoTrack: ILocalVideoTrack | null = null;
let screenAudioTrack: ILocalAudioTrack | null = null;

export type ClientRole = "host" | "audience";

export const getClient = () => client;

export function initClient() {
  if (!client) client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
  return client!;
}

export async function joinChannel(opts: {
  appId: string;
  channel: string;
  token: string | null;
  uid: string | number;
  role?: ClientRole;
}) {
  const { appId, channel, token, uid, role = "audience" } = opts;
  const c = initClient();
  await c.setClientRole(role);
  await c.join(appId, channel, token || null, uid);
  return c;
}

export async function renewRtcToken(newToken: string) {
  if (!client) return;
  await client.renewToken(newToken);
}

export async function setClientRole(role: ClientRole) {
  if (!client) throw new Error("Chưa join kênh");
  await client.setClientRole(role);
}

export async function leaveChannel() {
  if (!client) return;
  try {
    if (localVideoTrack) {
      await client.unpublish([localVideoTrack]);
      localVideoTrack.stop(); localVideoTrack.close(); localVideoTrack = null;
    }
    if (localAudioTrack) {
      await client.unpublish([localAudioTrack]);
      localAudioTrack.stop(); localAudioTrack.close(); localAudioTrack = null;
    }
    await client.leave();
  } finally {
    client = null;
  }
}

export async function enableCamera(container?: HTMLElement | string) {
  if (!client) throw new Error("Chưa join kênh");
  try {
    // đảm bảo role trên client là host trước khi publish
    await setClientRole("host");
  } catch {
    // bỏ qua nếu đã là host
  }

  if (!localVideoTrack) {
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await client!.publish([localVideoTrack]);
  } else {
    await localVideoTrack.setEnabled(true);
    await client!.publish([localVideoTrack]); // idempotent
  }
  localVideoTrack.play((container as any) ?? "local-player");
}

export async function disableCamera() {
  // Dù client đã leave hay chưa, vẫn cố gắng stop/close track
  try {
    if (client && localVideoTrack) {
      await client.unpublish([localVideoTrack]);
    }
  } catch (e) {
    console.warn("[disableCamera] unpublish error", e);
  }

  if (localVideoTrack) {
    try {
      localVideoTrack.stop();   // dừng render & capture
    } catch (e) {
      console.warn("[disableCamera] stop error", e);
    }
    try {
      localVideoTrack.close();  // giải phóng device
    } catch (e) {
      console.warn("[disableCamera] close error", e);
    }
    localVideoTrack = null;
  }
}


export async function enableMic() {
  if (!client) throw new Error("Chưa join kênh");
  try { await setClientRole("host"); } catch {}

  try {
    if (!localAudioTrack) {
      console.log("[enableMic] creating microphone track...");
      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    } else {
      console.log("[enableMic] reusing mic track");
      await localAudioTrack.setEnabled(true);
    }
    await client!.publish([localAudioTrack]);
    console.log("[enableMic] mic published");
  } catch (err: any) {
    console.error("[enableMic] error", err);
    // (option) phân tích err.name / err.message giống toggleMic
    throw err;
  }
}

export async function catchUpExistingRemotes(containerFactory?: (uid: string|number) => HTMLElement) {
  if (!client) return;
  const users = client.remoteUsers;
  for (const u of users) {
    if (u.hasVideo) {
      const el = containerFactory ? containerFactory(u.uid!) : undefined;
      await client.subscribe(u, "video");
      if (el) u.videoTrack?.play(el);
      else u.videoTrack?.play("remote-container");
    }
    if (u.hasAudio) {
      await client.subscribe(u, "audio");
      u.audioTrack?.play();
    }
  }
}
export async function disableMic() {
  if (!client || !localAudioTrack) return;
  await client.unpublish([localAudioTrack]);
  localAudioTrack.stop();
  localAudioTrack.close();
  localAudioTrack = null;
}

// subscribe/play … (giữ nguyên)
export async function subscribeAndPlay(
  user: IAgoraRTCRemoteUser,
  mediaType: "audio" | "video",
  container?: HTMLElement
) {
  if (!client) return;
  await client.subscribe(user, mediaType);
  if (mediaType === "video") {
    if (container) user.videoTrack?.play(container);
    else user.videoTrack?.play("remote-container");
  } else {
    user.audioTrack?.play();
  }
}
export function getScreenClient() { return screenClient; }
export function isScreenSharing() { return !!screenClient && !!screenVideoTrack; }

export async function startScreenShare(opts: {
  appId: string;
  channel: string;
  token: string | null;          // screen token
  uid: string | number;          // screen uid
  container?: HTMLElement | string;
  withAudio?: boolean;           // true: share system audio, false: tắt
}) {
  if (screenClient) return; // đang bật rồi

  screenClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
  await screenClient.setClientRole("host");
  await screenClient.join(opts.appId, opts.channel, opts.token || null, opts.uid);

  // ✅ mapping đúng kiểu TS (không dùng false)
  const audioParam: "auto" | "enable" | "disable" | undefined =
    opts.withAudio ? "auto" : "disable";

  const trackRes = await AgoraRTC.createScreenVideoTrack(
    { encoderConfig: "1080p_2", optimizationMode: "detail" },
    audioParam
  );

  if (Array.isArray(trackRes)) {
    const [video, audio] = trackRes;
    screenVideoTrack = video;
    screenAudioTrack = audio ?? null;
  } else {
    screenVideoTrack = trackRes;
    screenAudioTrack = null;
  }

  await screenClient.publish([
    screenVideoTrack,
    ...(screenAudioTrack ? [screenAudioTrack] : []),
  ]);

  // play preview nếu có container
  if (opts.container) screenVideoTrack.play(opts.container as any);

  // nếu user bấm "Stop sharing" từ UI trình duyệt:
  (screenVideoTrack as any).on?.("track-ended", async () => {
    await stopScreenShare();
  });
}

export async function stopScreenShare() {
  if (!screenClient) return;
  try {
    if (screenVideoTrack) {
      await screenClient.unpublish([screenVideoTrack]);
      screenVideoTrack.stop();
      screenVideoTrack.close();
      screenVideoTrack = null;
    }
    if (screenAudioTrack) {
      await screenClient.unpublish([screenAudioTrack]);
      screenAudioTrack.stop();
      screenAudioTrack.close();
      screenAudioTrack = null;
    }
    await screenClient.leave();
  } finally {
    screenClient = null;
  }
}
export function onUserPublished(cb: (u: IAgoraRTCRemoteUser, t: "audio"|"video") => void) {
  client?.on("user-published", cb);
}
export function onUserUnpublished(cb: (u: IAgoraRTCRemoteUser, t: "audio"|"video") => void) {
  client?.on("user-unpublished", cb);
}
export function onUserJoined(cb: (u: IAgoraRTCRemoteUser) => void) { client?.on("user-joined", cb); }
export function onUserLeft(cb: (u: IAgoraRTCRemoteUser) => void) { client?.on("user-left", cb); }
