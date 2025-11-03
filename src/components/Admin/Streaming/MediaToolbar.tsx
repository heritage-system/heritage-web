// src/components/Admin/Streaming/MediaToolbar.tsx
import React from "react";
import { PhoneCall, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useStreaming } from "./StreamingContext";

const MediaToolbar: React.FC = () => {
  const { joined, micOn, camOn, joinLive, leaveLive, toggleMic, toggleCam, grant } = useStreaming();

  return (
    <div className="flex items-center gap-2">
      {!joined ? (
        <button
          onClick={() => joinLive()}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          title="Join phòng (không tự bật cam/mic)"
        >
          <PhoneCall size={18} /> Join
        </button>
      ) : (
        <button
          onClick={leaveLive}
          className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-white hover:bg-rose-700"
        >
          <PhoneOff size={18} /> Leave
        </button>
      )}

      <button
        onClick={toggleMic}
        disabled={!joined}
        className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200 disabled:opacity-50"
      >
        {micOn ? <Mic size={18} /> : <MicOff size={18} />} Mic
      </button>

      <button
        onClick={toggleCam}
        disabled={!joined}
        className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200 disabled:opacity-50"
      >
        {camOn ? <Video size={18} /> : <VideoOff size={18} />} Camera
      </button>

      {/* Nhắc nhỏ quyền publish */}
      {joined && grant && ["Host", "CoHost", "Speaker"].includes(grant.role) === false && (
        <span className="ml-2 text-xs text-amber-600">
          Bạn đang ở vai trò Audience (không thể bật Cam/Mic). Nhờ host đổi quyền.
        </span>
      )}
    </div>
  );
};

export default MediaToolbar;
