// src/types/streaming.ts
export type RoomRole = "Host" | "CoHost" | "Speaker" | "Audience";

export interface StreamingRoomResponse {
  id: number;
  roomName: string;
  title?: string;
  isActive: boolean;
  createdByUserId: number;
  createdAt: string;
}

export interface StreamingJoinGrantResponse {
  channel: string;
  rtcUid: string;
  role: string; // "Host"/"CoHost"/"Speaker"/"Audience"
  rtcToken: string;
  rtmToken: string;
  rtmUid: string;
  // NEW
  screenRtcUid?: string;
  screenRtcToken?: string;
}

// NEW
export interface StreamingParticipantResponse {
  id: number;
  roomId: number;
  userId: number;
  role: RoomRole;
  status: "Waiting" | "Admitted" | "Kicked";
  isRaisedHand: boolean;
  rtcUid: string;
  createdAt: string;
}

export interface CreateRoomRequest { title: string; }
export interface RequestJoinRequest { rtcUid: string; }
export interface AdmitRejectRequest { userId: number; }
export interface SetRoleRequest { userId: number; role: RoomRole; }
export interface RaiseHandRequest { raised: boolean; }
export interface StreamingRoomWithCountResponse {
  id: number;
  roomName: string;
  title: string;
  isActive: boolean;
  createdAt: string;          // ISO
  participantCount: number;
}