// src/services/eventService.ts
import { API_URL } from "../utils/baseUrl";
import { fetchInterceptor } from "../utils/interceptor";
import type { ApiResponse } from "../types/apiResponse";
import {
  EventResponse,
  EventRegistrationResponse,
  EventRegistrationUserResponse,
  EventWithRoomsUpdateRequest,
  EventWithRoomsCreateRequest,
  EventSearchRequest,
} from "../types/event";
import { EventStatus } from "../types/enum";
import { PageResponse } from "../types/pageResponse";

export async function getEvents(opts?: {
  status?: EventStatus;
  from?: string; // ISO
}): Promise<ApiResponse<EventResponse[]>> {
  const params: string[] = [];

  if (typeof opts?.status === "number") {
    params.push(`status=${encodeURIComponent(String(opts.status))}`);
  }
  if (opts?.from) {
    params.push(`from=${encodeURIComponent(opts.from)}`);
  }

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
export const searchEvents = async (
  params: EventSearchRequest
): Promise<ApiResponse<PageResponse<EventResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.append("Keyword", params.keyword);
  if (typeof params.status === "number") {
    query.append("Status", String(params.status));
  }
  if (typeof params.category === "number") {
    query.append("Category", String(params.category));
  }
  if (typeof params.tag === "number") {
    query.append("Tag", String(params.tag));
  }
  if (params.fromDate) {
    query.append("FromDate", params.fromDate);
  }
  if (params.toDate) {
    query.append("ToDate", params.toDate);
  }
  if (params.page) {
    query.append("Page", params.page.toString());
  }
  if (params.pageSize) {
    query.append("PageSize", params.pageSize.toString());
  }

  const qs = query.toString();
  const url =
    qs.length > 0
      ? `${API_URL}/api/v1/events/search?${qs}`
      : `${API_URL}/api/v1/events/search`;

  return await fetchInterceptor<PageResponse<EventResponse>>(url, {
    method: "GET",
  });
};