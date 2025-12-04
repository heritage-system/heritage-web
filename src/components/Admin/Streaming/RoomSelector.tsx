import React from "react";
import { useStreaming } from "../Streaming/StreamingContext";

const RoomSelector: React.FC = () => {
  const { room, roomName, setRoomName } = useStreaming();
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">Chọn/nhập RoomName</h3>
      <input className="w-full rounded-md border px-3 py-2"
        placeholder="room-xxxx..." value={roomName || room?.roomName || ""}
        onChange={e=>setRoomName(e.target.value)} />
    </div>
  );
};

export default RoomSelector;
