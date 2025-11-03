import React from "react";
import RoomSelector from "../../components/Admin/Streaming/RoomSelector";
import JoinRequestPanel from "../../components/Admin/Streaming/JoinRequestPanel";

const JoinRoomPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <RoomSelector />
      <JoinRequestPanel />
    </div>
  );
};

export default JoinRoomPage;
