// src/components/Admin/Event/EventContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "react-hot-toast";
import {
  EventResponse,
  EventCreateRequest,
  EventUpdateRequest,
  EventStatus,
  EventTag,
} from "../../../types/event";
import type { ApiResponse } from "../../../types/apiResponse";
import {
  createEvent,
  getEvents,
  getEventDetail,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
} from "../../../services/eventService";

type EventCtx = {
  events: EventResponse[];
  selectedEvent: EventResponse | null;
  loading: boolean;

  loadEvents: (opts?: { status?: EventStatus; from?: string }) => Promise<void>;
  loadEvent: (id: number) => Promise<EventResponse | null>;

  createEvent: (req: EventCreateRequest) => Promise<EventResponse | null>;
  updateEvent: (id: number, req: EventUpdateRequest) => Promise<EventResponse | null>;
  deleteEvent: (id: number) => Promise<void>;

  register: (id: number) => Promise<void>;
  unregister: (id: number) => Promise<void>;

  setSelectedEvent: (e: EventResponse | null) => void;
};

const EventContext = createContext<EventCtx | null>(null);

export const useEvent = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent must be used inside <EventProvider>");
  return ctx;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadEvents: EventCtx["loadEvents"] = useCallback(async (opts) => {
    setLoading(true);
    try {
      const res = await getEvents(opts);
      if (res.code === 200 && res.result) {
        setEvents(res.result);
      } else {
        toast.error(res.message || "Không thể tải danh sách sự kiện");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvent: EventCtx["loadEvent"] = useCallback(async (id) => {
    try {
      const res = await getEventDetail(id);
      if (res.code === 200 && res.result) {
        setSelectedEvent(res.result);
        // update list cache
        setEvents((prev) => {
          const idx = prev.findIndex(e => e.id === id);
          if (idx === -1) return [...prev, res.result!];
          const clone = [...prev];
          clone[idx] = res.result!;
          return clone;
        });
        return res.result;
      }
      toast.error(res.message || "Không thể tải sự kiện");
      return null;
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi tải sự kiện");
      return null;
    }
  }, []);

  const createEventFn: EventCtx["createEvent"] = useCallback(async (req) => {
    try {
      const res = await createEvent(req);
      if ((res.code === 200 || res.code === 201) && res.result) {
        toast.success("Tạo sự kiện thành công");
        setEvents((prev) => [...prev, res.result!]);
        setSelectedEvent(res.result!);
        return res.result;
      }
      toast.error(res.message || "Tạo sự kiện thất bại");
      return null;
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi tạo sự kiện");
      return null;
    }
  }, []);

  const updateEventFn: EventCtx["updateEvent"] = useCallback(async (id, req) => {
    try {
      const res = await updateEvent(id, { ...req, id });
      if (res.code === 200 && res.result) {
        toast.success("Cập nhật sự kiện thành công");
        setEvents((prev) => {
          const idx = prev.findIndex(e => e.id === id);
          if (idx === -1) return prev;
          const clone = [...prev];
          clone[idx] = res.result!;
          return clone;
        });
        setSelectedEvent(res.result!);
        return res.result;
      }
      toast.error(res.message || "Cập nhật sự kiện thất bại");
      return null;
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi cập nhật sự kiện");
      return null;
    }
  }, []);

  const deleteEventFn: EventCtx["deleteEvent"] = useCallback(async (id) => {
    try {
      const res = await deleteEvent(id);
      if (res.code === 200) {
        toast.success("Đã xoá sự kiện");
        setEvents((prev) => prev.filter(e => e.id !== id));
        if (selectedEvent?.id === id) setSelectedEvent(null);
      } else {
        toast.error(res.message || "Xoá sự kiện thất bại");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi xoá sự kiện");
    }
  }, [selectedEvent]);

  const registerFn: EventCtx["register"] = useCallback(async (id) => {
    try {
      const res = await registerForEvent(id);
      if (res.code === 200 && res.result?.registered) {
        toast.success("Đăng ký tham gia sự kiện thành công");
        // update selected and list
        setEvents(prev =>
          prev.map(e =>
            e.id === id ? { ...e, registeredByMe: true, registeredCount: e.registeredCount + 1 } : e
          )
        );
        setSelectedEvent(prev =>
          prev && prev.id === id
            ? { ...prev, registeredByMe: true, registeredCount: prev.registeredCount + 1 }
            : prev
        );
      } else {
        toast.error(res.message || "Đăng ký tham gia sự kiện thất bại");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi đăng ký sự kiện");
    }
  }, []);

  const unregisterFn: EventCtx["unregister"] = useCallback(async (id) => {
    try {
      const res = await unregisterFromEvent(id);
      if (res.code === 200 && !res.result?.registered) {
        toast.success("Huỷ đăng ký sự kiện thành công");
        setEvents(prev =>
          prev.map(e =>
            e.id === id
              ? { ...e, registeredByMe: false, registeredCount: Math.max(0, e.registeredCount - 1) }
              : e
          )
        );
        setSelectedEvent(prev =>
          prev && prev.id === id
            ? {
                ...prev,
                registeredByMe: false,
                registeredCount: Math.max(0, prev.registeredCount - 1),
              }
            : prev
        );
      } else {
        toast.error(res.message || "Huỷ đăng ký thất bại");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi huỷ đăng ký sự kiện");
    }
  }, []);

  const value: EventCtx = {
    events,
    selectedEvent,
    loading,
    loadEvents,
    loadEvent,
    createEvent: createEventFn,
    updateEvent: updateEventFn,
    deleteEvent: deleteEventFn,
    register: registerFn,
    unregister: unregisterFn,
    setSelectedEvent,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};
