import React, { useEffect } from "react";
import VideoCanvas from "../../components/Admin/Streaming/VideoCanvas";
import MediaToolbar from "../../components/Admin/Streaming/MediaToolbar";
import TokenDebugPanel from "../../components/Admin/Streaming/TokenDebugPanel";
import { useStreaming } from "../../components/Admin/Streaming/StreamingContext";
import RightSidebar from "../../components/Admin/Streaming/RightSidebar";

const LiveRoomPage: React.FC = () => {
  const { grant, fetchTokens } = useStreaming();

  useEffect(() => {
    if (!grant) fetchTokens();
  }, [grant, fetchTokens]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="font-semibold">Phòng livestream</div>
        <MediaToolbar />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <VideoCanvas />
          <TokenDebugPanel />
        </div>
        <div className="lg:col-span-1">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default LiveRoomPage;
