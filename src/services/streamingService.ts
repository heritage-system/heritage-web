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
