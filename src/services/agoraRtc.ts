// src/services/agoraRtc.ts
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

let client: IAgoraRTCClient | null = null;
let localVideoTrack: ICameraVideoTrack | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;

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
  if (!client || !localVideoTrack) return;
  await client.unpublish([localVideoTrack]);
  localVideoTrack.stop();
  localVideoTrack.close();
  localVideoTrack = null;
}

export async function enableMic() {
  if (!client) throw new Error("Chưa join kênh");
  try { await setClientRole("host"); } catch {}
  if (!localAudioTrack) {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await client!.publish([localAudioTrack]);
  } else {
    await localAudioTrack.setEnabled(true);
    await client!.publish([localAudioTrack]);
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

export function onUserPublished(cb: (u: IAgoraRTCRemoteUser, t: "audio"|"video") => void) {
  client?.on("user-published", cb);
}
export function onUserUnpublished(cb: (u: IAgoraRTCRemoteUser, t: "audio"|"video") => void) {
  client?.on("user-unpublished", cb);
}
export function onUserJoined(cb: (u: IAgoraRTCRemoteUser) => void) { client?.on("user-joined", cb); }
export function onUserLeft(cb: (u: IAgoraRTCRemoteUser) => void) { client?.on("user-left", cb); }
