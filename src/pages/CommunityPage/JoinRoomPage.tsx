// src/pages/JoinRoomPage.tsx
import React from "react";
import RoomsWithPeoplePanel from "../../components/Admin/Streaming/RoomsWithPeoplePanel";
import RoomSelector from "../../components/Admin/Streaming/RoomSelector";
import JoinRequestPanel from "../../components/Admin/Streaming/JoinRequestPanel";

const JoinRoomPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <RoomsWithPeoplePanel />
      <RoomSelector />
      <JoinRequestPanel />
    </div>
  );
};
export default JoinRoomPage;
