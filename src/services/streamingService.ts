import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import {
  StreamingRoomResponse,
  StreamingJoinGrantResponse,
  StreamingRoomCreateRequest,
  SetRoleRequest,
  StreamingParticipantResponse,
  StreamingRoomWithCountResponse,
  KickRequest,
  
  StreamingRoomUpdateRequest,
  StreamingRoomDetailResponse,
  
} from "../types/streaming";

import { ApiResponse } from "../types/apiResponse";
import { ParticipantStatus, StreamingRoomType } from "../types/enum";

export const setParticipantRole = async (
  roomName: string,
  data: SetRoleRequest
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/set-role`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
};

export const issueJoinTokens = async (
  roomName: string
): Promise<ApiResponse<StreamingJoinGrantResponse>> => {
  return await fetchInterceptor<StreamingJoinGrantResponse>(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/join-token`,
    { method: "POST" }
  );
};

export const getParticipants = async (
  roomName: string,
  status?: ParticipantStatus
) => {
  const qs =
    typeof status === "number"
      ? `?status=${encodeURIComponent(String(status))}`
      : "";

  return await fetchInterceptor<StreamingParticipantResponse[]>(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(
      roomName
    )}/participants${qs}`,
    { method: "GET" }
  );
};


export async function getRoomsWithPeople(
  minCount = 2,
  status: ParticipantStatus = ParticipantStatus.ADMITTED
) {
  return await fetchInterceptor<StreamingRoomWithCountResponse[]>(
    `${API_URL}/api/v1/stream/rooms/with-people?minCount=${minCount}&status=${encodeURIComponent(
      String(status)
    )}`,
    { method: "GET" }
  );
}





export const heartbeat = async (
  roomName: string
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/heartbeat`,
    { method: "POST" }
  );
};

export const leaveRoom = async (
  roomName: string,
  opts?: { keepalive?: boolean }
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/leave`,
    { method: "POST", ...(opts?.keepalive ? { keepalive: true } : {}) }
  );
};

export const kickParticipant = async (
  roomName: string,
  data: KickRequest
) => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/kick`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
};


// 🔥 NEW: Admin – chi tiết 1 room (kèm participants)
export const getRoomDetailAdmin = async (
  roomName: string
): Promise<ApiResponse<StreamingRoomDetailResponse>> => {
  return await fetchInterceptor<StreamingRoomDetailResponse>(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}`,
    { method: "GET" }
  );
};

// 🔥 NEW: Admin – update room (title, startAt, type)
export const updateRoomAdmin = async (
  roomName: string,
  data: StreamingRoomUpdateRequest
): Promise<ApiResponse<StreamingRoomResponse>> => {
  return await fetchInterceptor<StreamingRoomResponse>(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: data as any,
    }
  );
};

// 🔥 NEW: Admin – delete room
export const deleteRoomAdmin = async (
  roomName: string
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor<unknown>(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}`,
    { method: "DELETE" }
  );
};

// 🔥 NEW: Admin – lấy token join-as-cohost (dùng nếu bạn muốn)
export const adminJoinToken = async (
  roomName: string
): Promise<ApiResponse<StreamingJoinGrantResponse>> => {
  return await fetchInterceptor<StreamingJoinGrantResponse>(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(
      roomName
    )}/admin-join-token`,
    { method: "POST" }
  );
};