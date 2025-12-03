// src/types/event.ts
import type { StreamingRoomType } from "./streaming";

export enum EventStatus {
  DRAFT = "DRAFT",
  UPCOMING = "UPCOMING",
  LIVE = "LIVE",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED",
}

export enum EventCategory {
  GENERAL = "GENERAL",
  HERITAGE_TALK = "HERITAGE_TALK",
  FESTIVAL = "FESTIVAL",
  WORKSHOP = "WORKSHOP",
  ONLINE_TOUR = "ONLINE_TOUR",
}

// bit flags — keep as number
export enum EventTag {
  NONE = 0,
  FEATURED = 1 << 0,
  FREE = 1 << 1,
  PREMIUM = 1 << 2,
  RECORDED = 1 << 3,
  QNA = 1 << 4,
}

export interface StreamingRoomSummaryResponse {
  id: number;
  roomName: string;
  title?: string | null;
  startAt?: string | null; // ISO
  type: StreamingRoomType;
  isActive: boolean;
}

// ==== DTOs from backend ====

export interface EventResponse {
  id: number;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  startAt: string;           // ISO string
  closeAt?: string | null;   // ISO string
  status: EventStatus;
  category: EventCategory;
  tags: EventTag;
  registeredCount: number;
  registeredByMe: boolean;
  createdByUserId: number;
  createdByUserName?: string | null;
  streamingRooms: StreamingRoomSummaryResponse[];
}

export interface EventCreateRequest {
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  startAt: string;           // ISO string
  closeAt?: string | null;
  category: EventCategory;
  tags: EventTag;
}

export interface EventUpdateRequest {
  id?: number;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  startAt?: string | null;
  closeAt?: string | null;
  status?: EventStatus | null;
  category?: EventCategory | null;
  tags?: EventTag | null;
}

export interface EventRegistrationResponse {
  eventId: number;
  registered: boolean;
}
export interface EventRegistrationUserResponse {
  eventId: number;
  userId: number;
  userName: string;
  email: string;
  registeredAt: string; // ISO string từ backend
}
// ---- Nested room types for upsert ----
export interface StreamingRoomForEventCreateRequest {
  title: string;
  startAt: string;            // ISO
  type: StreamingRoomType;    // UPCOMING/LIVE/CLOSED
}

export interface StreamingRoomForEventUpdateRequest
  extends StreamingRoomForEventCreateRequest {
  id?: number; // null/0 => new room
}

// Event + rooms on create
export interface EventWithRoomsCreateRequest extends EventCreateRequest {
  rooms: StreamingRoomForEventCreateRequest[];
}

// Event + rooms on update
export interface EventWithRoomsUpdateRequest extends EventUpdateRequest {
  rooms: StreamingRoomForEventUpdateRequest[];
}