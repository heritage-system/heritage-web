import React, { useState } from "react";
import { useStreaming } from "./StreamingContext";
import UsersRoster from "./UsersRoster";
import WaitingQueuePanel from "./WaitingQueuePanel";

const RightSidebar: React.FC = () => {
  const { isHost, roster, waiting } = useStreaming();
  const [tab, setTab] = useState<"roster" | "waiting">("roster");

  // Người dùng thường: chỉ xem danh sách người trong phòng
  if (!isHost) {
    return (
      <div className="space-y-6">
        <UsersRoster />
      </div>
    );
  }

  // Admin/CoHost: có tabs để chuyển giữa Roster và Waiting
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-2 shadow-sm">
        <div className="flex text-sm gap-2">
          <button
            onClick={() => setTab("roster")}
            className={`flex-1 rounded-md px-3 py-2 ${
              tab === "roster" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            Người trong phòng
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-white/20 px-2 text-xs">
              {roster.length}
            </span>
          </button>
          <button
            onClick={() => setTab("waiting")}
            className={`flex-1 rounded-md px-3 py-2 ${
              tab === "waiting" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            Hàng chờ
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-white/20 px-2 text-xs">
              {waiting.length}
            </span>
          </button>
        </div>
      </div>

      {tab === "roster" ? <UsersRoster /> : <WaitingQueuePanel />}
    </div>
  );
};

export default RightSidebar;
