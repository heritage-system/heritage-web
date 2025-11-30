import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import type {
  StreamingRoomResponse,
  StreamingJoinGrantResponse,
  CreateRoomRequest,
  RequestJoinRequest,
  AdmitRejectRequest,
  SetRoleRequest,
  RaiseHandRequest,
  StreamingParticipantResponse,
  StreamingRoomWithCountResponse,
} from "../types/streaming";
import { ApiResponse } from "../types/apiResponse";

export const createStreamingRoom = async (
  data: CreateRoomRequest
): Promise<ApiResponse<StreamingRoomResponse>> => {
  return await fetchInterceptor<StreamingRoomResponse>(
    `${API_URL}/api/v1/stream/rooms`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: data as any }
  );
};

export const requestJoinRoom = async (
  roomName: string,
  data: RequestJoinRequest
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/request-join`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: data as any }
  );
};

export const toggleRaiseHand = async (
  roomName: string,
  data: RaiseHandRequest
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/raise-hand`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: data as any }
  );
};

export const admitParticipant = async (
  roomName: string,
  data: AdmitRejectRequest
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/admit`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: data as any }
  );
};

export const rejectParticipant = async (
  roomName: string,
  data: AdmitRejectRequest
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/reject`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: data as any }
  );
};

export const setParticipantRole = async (
  roomName: string,
  data: SetRoleRequest
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/set-role`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: data as any }
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

export const getWaitingList = async (roomName: string) =>
  fetchInterceptor<StreamingParticipantResponse[]>(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/waiting`,
    { method: "GET" }
  );

export const getParticipants = async (
  roomName: string,
  status?: "Waiting" | "Admitted" | "Kicked"
) => {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return await fetchInterceptor<StreamingParticipantResponse[]>(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/participants${qs}`,
    { method: "GET" }
  );
};

export async function getRoomsWithPeople(
  minCount = 2,
  status: "Admitted" | "Waiting" | "Kicked" = "Admitted"
){
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/with-people?minCount=${minCount}&status=${encodeURIComponent(status)}`,
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
  opts?: { keepalive?: boolean }   // để gọi trong beforeunload
): Promise<ApiResponse<unknown>> => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/leave`,
    { method: "POST", ...(opts?.keepalive ? { keepalive: true } : {}) }
  );
};
export const kickParticipant = async (
  roomName: string,
  data: AdmitRejectRequest
) => {
  return await fetchInterceptor(
    `${API_URL}/api/v1/stream/rooms/${encodeURIComponent(roomName)}/kick`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: data as any }
  );
};