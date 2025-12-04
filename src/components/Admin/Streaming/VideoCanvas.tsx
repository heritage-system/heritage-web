import React from "react";

const VideoCanvas: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div>
        <div className="text-xs font-medium">Local Preview</div>
        <div id="local-player" className="mt-1 aspect-video w-full rounded bg-black" />
      </div>
      <div>
        <div className="text-xs font-medium">Remote Streams</div>
        <div id="remote-container" className="mt-1 grid w-full grid-cols-2 gap-2" />
      </div>
    </div>
  );
};

export default VideoCanvas;
