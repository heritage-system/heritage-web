// src/types/streaming.ts
export type RoomRole = "HOST" | "COHOST" | "SPEAKER" | "AUDIENCE";

export type ParticipantStatus = "ADMITTED" |"LEFT" |"KICKED";

// 🔥 NEW
export type StreamingRoomType = "UPCOMING" | "LIVE" | "CLOSED";

export interface StreamingRoomResponse {
  id: number;
  roomName: string;
  title?: string;
  isActive: boolean;
  createdByUserId: number;
  createdAt: string;

  // 🔥 NEW (phù hợp backend)
  startAt: string;
  type?: StreamingRoomType;
  closedAt?: string | null;
  eventId ?: number| null;
}

export interface StreamingJoinGrantResponse {
  channel: string;
  rtcUid: string;
  role: string; // "Host"/"CoHost"/"Speaker"/"Audience"
  rtcToken: string;
  rtmToken: string;
  rtmUid: string;
  screenRtcUid?: string;
  screenRtcToken?: string;
}

export interface StreamingParticipantResponse {
  id: number;
  roomId: number;
  userId: number;
  role: RoomRole;
  status: ParticipantStatus;
  rtcUid: string;
  createdAt: string;
}

// 🔥 NEW – detail cho admin
export interface StreamingRoomDetailResponse extends StreamingRoomResponse {
  participants: StreamingParticipantResponse[];
}

export interface StreamingRoomCreateRequest {
  title: string;
  startAt: string;      // ISO string
  eventId?: number | null;
}

// chỉ dùng để set role + kick
export interface SetRoleRequest {
  userId: number;
  role: RoomRole;
}

export interface KickRequest {
  userId: number;
}

export interface StreamingRoomWithCountResponse {
  id: number;
  roomName: string;
  title: string;
  isActive: boolean;
  createdAt: string;          // ISO
  participantCount: number;
}

// 🔥 NEW – cho admin update
export interface StreamingRoomUpdateRequest {
  title?: string;
  startAt?: string; // ISO string
  type?: StreamingRoomType;
}
