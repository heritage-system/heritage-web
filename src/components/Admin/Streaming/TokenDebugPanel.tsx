import React from "react";
import { useStreaming } from "../Streaming/StreamingContext";

const TokenDebugPanel: React.FC = () => {
  const { grant } = useStreaming();
  if (!grant) return null;
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h4 className="font-semibold mb-2">Token (Debug)</h4>
      <div className="text-sm space-y-2">
        <div><b>Channel:</b> {grant.channel}</div>
        <div><b>RTC UID:</b> {grant.rtcUid}</div>
        <div>
          <div className="font-medium">RTC Token:</div>
          <textarea className="mt-1 w-full resize-none rounded border p-2 text-xs" rows={3} readOnly value={grant.rtcToken} />
        </div>
        <div>
          <div className="font-medium">RTM Token:</div>
          <textarea className="mt-1 w-full resize-none rounded border p-2 text-xs" rows={3} readOnly value={grant.rtmToken} />
        </div>
      </div>
    </div>
  );
};

export default TokenDebugPanel;
