// src/services/agoraRtm.ts
import AgoraRTM, { RtmClient, RtmChannel, RtmMessage } from "agora-rtm-sdk";

let rtmClient: RtmClient | null = null;
let rtmChannel: RtmChannel | null = null;

export function initRtm(appId: string) {
  if (rtmClient) return; // tránh tạo nhiều lần
  rtmClient = AgoraRTM.createInstance(appId /*, { logFilter: AgoraRTM.LOG_FILTER_ERROR }*/);
}

export async function loginRtm(opts: { uid: string; token?: string }) {
  if (!rtmClient) throw new Error("initRtm first");
  // UID phải 1–64 ký tự, chỉ [A-Za-z0-9_@.-]
  await rtmClient.login({ uid: opts.uid, token: opts.token });
}

export async function joinRtmChannel(name: string) {
  if (!rtmClient) throw new Error("initRtm first");
  // rời channel cũ nếu có
  if (rtmChannel) { try { await rtmChannel.leave(); } catch {} rtmChannel = null; }
  rtmChannel = rtmClient.createChannel(name);
  await rtmChannel.join();
}

export async function channelSendText(text: string) {
  if (!rtmChannel) throw new Error("join channel first");
  if (!text.trim()) return;
  await rtmChannel.sendMessage({ text });
}

export function onChannelMessage(
  cb: (m: { from: string; text: string; ts: number }) => void
) {
  if (!rtmChannel) throw new Error("join channel first");
  const handler = (msg: RtmMessage, memberId: string) => {
    cb({ from: memberId, text: (msg as any).text ?? "", ts: Date.now() });
  };
  rtmChannel.on("ChannelMessage", handler);
  // trả về hàm hủy lắng nghe
  return () => rtmChannel?.off("ChannelMessage", handler as any);
}

export async function leaveRtmChannel() {
  if (rtmChannel) { try { await rtmChannel.leave(); } finally { rtmChannel = null; } }
}

export async function destroyRtm() {
  try { await leaveRtmChannel(); } catch {}
  if (rtmClient) { try { await rtmClient.logout(); } finally { rtmClient = null; } }
}

export function onConnectionStateChanged(
  cb: (state: string, reason: string) => void
) {
  if (!rtmClient) throw new Error("initRtm first");
  const handler = (newState: string, reason: string) => {
    cb(newState, reason);
  };
  rtmClient.on("ConnectionStateChanged", handler);
  // trả về hàm để unsubscribe
  return () => {
    rtmClient?.off("ConnectionStateChanged", handler as any);
  };
}