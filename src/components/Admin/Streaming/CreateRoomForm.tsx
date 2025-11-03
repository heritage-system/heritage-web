import React, { useState } from "react";
import { useStreaming } from "../Streaming/StreamingContext";

const CreateRoomForm: React.FC = () => {
  const { room, createRoom } = useStreaming();
  const [title, setTitle] = useState("");

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold">Tạo Phòng</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input className="rounded-md border px-3 py-2"
          placeholder="Tiêu đề phòng..." value={title}
          onChange={e=>setTitle(e.target.value)} />
        <button onClick={()=>createRoom(title)}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Tạo phòng</button>
      </div>
      {room && (
        <div className="mt-3 text-sm">
          <div><b>Room:</b> {room.roomName}</div>
          <div><b>Created:</b> {new Date(room.createdAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};

export default CreateRoomForm;
