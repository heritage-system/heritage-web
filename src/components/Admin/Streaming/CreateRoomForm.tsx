import React, { useState } from "react";
import { useStreaming } from "../Streaming/StreamingContext";
import toast from "react-hot-toast";
type CreateRoomFormProps = {
  eventId?: number;
  onCreated?: () => void;     // 👈 NEW
};
const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ eventId, onCreated }) => {

  const { room, createRoom } = useStreaming();
  const [title, setTitle] = useState("");
// Convert Date -> string "YYYY-MM-DDTHH:mm" cho <input type="datetime-local">
const toLocalInputValue = (d: Date) => {
  const offset = d.getTimezoneOffset(); // phút, VN = -420
  // Trừ offset để ra "fake UTC" nhưng value string lại đúng giờ local
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};
const formatDateTimeLocalInput = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

// default: sau 5 phút từ hiện tại
const [startAtLocal, setStartAtLocal] = useState(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return formatDateTimeLocalInput(now);
});

const handleCreate = async () => {
  if (!title.trim()) {
    toast.error("Nhập tiêu đề phòng");
    return;
  }
  if (!startAtLocal) {
    toast.error("Chọn thời gian bắt đầu");
    return;
  }

  // ❌ BỎ: const isoUtc = new Date(startAtLocal).toISOString();
  // ✅ GỬI THẲNG GIỜ LOCAL lên backend
  await createRoom(title, startAtLocal, eventId);

    // 🔥 gọi callback để EventCreate refresh list
    onCreated?.();
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold">Tạo Phòng</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1.5fr,1.2fr,auto]">
        <input
          className="rounded-md border px-3 py-2"
          placeholder="Tiêu đề phòng..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-col text-sm">
          <label className="mb-1 text-xs font-medium text-gray-600">
            Thời gian bắt đầu
          </label>
          <input
            type="datetime-local"
            className="rounded-md border px-2 py-1"
            value={startAtLocal}
            onChange={(e) => setStartAtLocal(e.target.value)}
          />
        </div>

        <button
          onClick={handleCreate}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 self-end"
        >
          Tạo phòng
        </button>
      </div>

      {room && (
        <div className="mt-3 text-sm">
          <div>
            <b>Room:</b> {room.roomName}
          </div>
          <div>
            <b>Created:</b>{" "}
            {new Date(room.createdAt).toLocaleString()}
          </div>
          <div>
            <b>Bắt đầu:</b>{" "}
           {new Date(room.startAt).toLocaleString("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
})}
          </div>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Lưu ý: thời gian bắt đầu sẽ được so với giờ server (UTC) – frontend đang
        convert từ giờ máy của bạn sang UTC.
      </p>
    </div>
  );
};

export default CreateRoomForm;
