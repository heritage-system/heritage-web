// src/pages/AdminPage/AdminStreamPage.tsx
import React from "react";
import CreateRoomForm from "../../components/Admin/Streaming/CreateRoomForm";
import RoomSelector from "../../components/Admin/Streaming/RoomSelector";
import HostActionsPanel from "../../components/Admin/Streaming/HostActionsPanel";
import WaitingListPanel from "../../components/Admin/Streaming/WaitingListPanel";
import EnterLiveButton from "../../components/Admin/Streaming/EnterLiveButton";
import ParticipantsListPanel from "../../components/Admin/Streaming/ParticipantsListPanel";
import { useSearchParams } from "react-router-dom";
import EventCreate from "../../components/Admin/EventManagement/EventCreate";

const AdminStreamPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventIdParam = searchParams.get("eventId");
  const eventId = eventIdParam ? Number(eventIdParam) : undefined;

  return <EventCreate eventId={eventId} />;
};
  
export default AdminStreamPage;
