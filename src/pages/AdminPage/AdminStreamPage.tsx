// src/pages/AdminPage/AdminStreamPage.tsx
import React from "react";
import CreateRoomForm from "../../components/Admin/Streaming/CreateRoomForm";
import RoomSelector from "../../components/Admin/Streaming/RoomSelector";
import HostActionsPanel from "../../components/Admin/Streaming/HostActionsPanel";
import WaitingListPanel from "../../components/Admin/Streaming/WaitingListPanel";
import EnterLiveButton from "../../components/Admin/Streaming/EnterLiveButton";
import ParticipantsListPanel from "../../components/Admin/Streaming/ParticipantsListPanel";

const AdminStreamPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <CreateRoomForm />
      <RoomSelector />
      <EnterLiveButton/>
        <WaitingListPanel />       {/* chờ duyệt: reload + auto */}
      <ParticipantsListPanel />  {/* đã trong phòng: reload + auto */}
      <HostActionsPanel />   {/* <- duyệt nhanh theo UserId nếu muốn */}
    </div>
  );
};
export default AdminStreamPage;
