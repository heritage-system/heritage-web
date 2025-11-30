import React, { useState } from "react";
import { useStreaming } from "../Streaming/StreamingContext";
import { useNavigate } from "react-router-dom";

const JoinRequestPanel: React.FC = () => {
  const { roomName, requestJoin, fetchTokens } = useStreaming();
  const [rtcUid, setRtcUid] = useState("");
  const navigate = useNavigate();
  const { room } = useStreaming();
  const onRequest = async () => {
    await requestJoin(rtcUid || undefined);
  };
  const onGoLive = async () => {
    const grant = await fetchTokens();
    console.log(grant);
    if (grant) navigate(`/live/${encodeURIComponent(roomName)}`);
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Vào phòng</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input className="rounded-md border px-3 py-2"
          placeholder="RTC UID (tuỳ chọn)" value={rtcUid}
          onChange={e=>setRtcUid(e.target.value)} />
        <button onClick={onRequest} className="rounded bg-emerald-600 px-3 py-2 text-white">Xin vào</button>
        <button onClick={onGoLive} className="rounded bg-blue-600 px-3 py-2 text-white">Lấy token & Vào live</button>
      </div>
      <p className="mt-1 text-xs text-gray-500">Nếu chưa được admit, bước “Vào live” sẽ báo lỗi.</p>
    </div>
  );
};

export default JoinRequestPanel;
