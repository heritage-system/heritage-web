import React from "react";
import { useStreaming } from "./StreamingContext";
import UsersRoster from "./UsersRoster";

const RightSidebar: React.FC = () => {
  const { roster } = useStreaming();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-2 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Người trong phòng</span>
          <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
            {roster.length}
          </span>
        </div>
      </div>

      <UsersRoster />
    </div>
  );
};

export default RightSidebar;
