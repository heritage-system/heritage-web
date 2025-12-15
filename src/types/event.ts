// src/types/event.ts

import { EventCategory, EventStatus, EventTag, StreamingRoomType } from "./enum";




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
export interface EventSearchRequest {
  keyword?: string;
  status?: EventStatus;
  category?: EventCategory;
  tag?: EventTag;
  fromDate?: string; // ISO date (yyyy-MM-dd) nếu cần
  toDate?: string;   // ISO date
  page?: number;
  pageSize?: number;
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
export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: "Nháp",
  [EventStatus.UPCOMING]: "Sắp diễn ra",
  [EventStatus.LIVE]: "Đang diễn ra",
  [EventStatus.CLOSED]: "Đã kết thúc",
  [EventStatus.ARCHIVED]: "Đã lưu trữ",
};

export const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  [EventCategory.GENERAL]: "Chung",
  [EventCategory.HERITAGE_TALK]: "Toạ đàm di sản",
  [EventCategory.FESTIVAL]: "Lễ hội",
  [EventCategory.WORKSHOP]: "Workshop",
  [EventCategory.ONLINE_TOUR]: "Tour trực tuyến",
};
