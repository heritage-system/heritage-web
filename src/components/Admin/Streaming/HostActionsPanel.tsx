import React, { useState } from "react";
import { useStreaming } from "../Streaming/StreamingContext";
import type { RoomRole } from "../../../types/streaming";

const HostActionsPanel: React.FC = () => {
  const { admit, reject, setRole } = useStreaming();
  const [userId, setUserId] = useState<number | "">("");
  const [role, setRoleState] = useState<RoomRole>("Audience");

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="font-semibold">Quản lý người tham gia</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <input className="rounded-md border px-3 py-2" type="number"
          placeholder="UserId mục tiêu"
          value={userId}
          onChange={(e)=>setUserId(e.target.value?Number(e.target.value):"")} />
        <select className="rounded-md border px-3 py-2"
          value={role} onChange={e=>setRoleState(e.target.value as RoomRole)}>
          {(["Audience","Speaker","CoHost","Host"] as RoomRole[]).map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={()=> userId!=="" && admit(Number(userId))}
            className="rounded bg-emerald-600 px-3 py-2 text-white">Admit</button>
          <button onClick={()=> userId!=="" && reject(Number(userId))}
            className="rounded bg-rose-600 px-3 py-2 text-white">Reject</button>
          <button onClick={()=> userId!=="" && setRole(Number(userId), role)}
            className="rounded bg-indigo-600 px-3 py-2 text-white">Set Role</button>
        </div>
      </div>
    </div>
  );
};

export default HostActionsPanel;
