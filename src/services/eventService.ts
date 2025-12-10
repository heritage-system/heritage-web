// src/services/eventService.ts
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import type { ApiResponse } from "../types/apiResponse";
import {
  EventResponse,
  EventCreateRequest,
  EventUpdateRequest,
  EventStatus,
  EventRegistrationResponse,
  EventRegistrationUserResponse,
  EventWithRoomsUpdateRequest,
  EventWithRoomsCreateRequest,
} from "../types/event";

export async function createEvent(
  data: EventCreateRequest
): Promise<ApiResponse<EventResponse>> {
  return await fetchInterceptor<EventResponse>(`${API_URL}/api/v1/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data as any, // interceptor will JSON.stringify
  });
}

export async function getEvents(opts?: {
  status?: EventStatus;
  from?: string; // ISO
}): Promise<ApiResponse<EventResponse[]>> {
  const params: string[] = [];

  if (opts?.status) params.push(`status=${encodeURIComponent(opts.status)}`);
  if (opts?.from) params.push(`from=${encodeURIComponent(opts.from)}`);

  const qs = params.length ? `?${params.join("&")}` : "";

  return await fetchInterceptor<EventResponse[]>(
    `${API_URL}/api/v1/events${qs}`,
    { method: "GET" }
  );
}

export async function getEventDetail(
  id: number
): Promise<ApiResponse<EventResponse>> {
  return await fetchInterceptor<EventResponse>(
    `${API_URL}/api/v1/events/${id}`,
    { method: "GET" }
  );
}

export async function updateEvent(
  id: number,
  data: EventUpdateRequest
): Promise<ApiResponse<EventResponse>> {
  return await fetchInterceptor<EventResponse>(
    `${API_URL}/api/v1/events/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: data as any,
    }
  );
}

export async function deleteEvent(
  id: number
): Promise<ApiResponse<unknown>> {
  return await fetchInterceptor<unknown>(
    `${API_URL}/api/v1/events/${id}`,
    { method: "DELETE" }
  );
}

export async function registerForEvent(
  id: number
): Promise<ApiResponse<EventRegistrationResponse>> {
  return await fetchInterceptor<EventRegistrationResponse>(
    `${API_URL}/api/v1/events/${id}/register`,
    { method: "POST" }
  );
}

export async function unregisterFromEvent(
  id: number
): Promise<ApiResponse<EventRegistrationResponse>> {
  return await fetchInterceptor<EventRegistrationResponse>(
    `${API_URL}/api/v1/events/${id}/unregister`,
    { method: "POST" }
  );
}
export const getEventRegistrations = async (
  eventId: number
): Promise<ApiResponse<EventRegistrationUserResponse[]>> => {
  return await fetchInterceptor<EventRegistrationUserResponse[]>(
    `${API_URL}/api/v1/events/${eventId}/registrations`,
    { method: "GET" }
  );
};
export const createEventWithRooms = async (
  data: EventWithRoomsCreateRequest
): Promise<ApiResponse<EventResponse>> => {
  return await fetchInterceptor<EventResponse>(
    `${API_URL}/api/v1/events/with-rooms`,
    { method: "POST", body: data as any }
  );
};

export const updateEventWithRooms = async (
  id: number,
  data: EventWithRoomsUpdateRequest
): Promise<ApiResponse<EventResponse>> => {
  return await fetchInterceptor<EventResponse>(
    `${API_URL}/api/v1/events/with-rooms/${id}`,
    { method: "PUT", body: data as any }
  );
};