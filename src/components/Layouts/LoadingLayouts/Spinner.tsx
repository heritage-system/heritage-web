// components/Feedback/Spinner.tsx
import React from "react";

type SpinnerProps = {
  size?: number;
  thickness?: number;
  className?: string;
  ariaLabel?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 28,
  thickness = 3,
  className = "",
  ariaLabel = "Đang tải",
}) => {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-block relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* TRACK — vòng tròn nền luôn hiện */}
      <span
        className="absolute inset-0 block rounded-full"
        style={{
          border: `${thickness}px solid rgba(0,0,0,0.15)`,
        }}
      />

      {/* ACTIVE — đoạn sáng chạy quanh */}
      <span
        className="absolute inset-0 block animate-spin rounded-full"
        style={{
          background: `
            conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 240deg,
              #A16207 270deg,
              #B91C1C 320deg,
              transparent 360deg
            )
          `,
          mask: `
            radial-gradient(
              farthest-side,
              transparent calc(100% - ${thickness}px),
              black calc(100% - ${thickness}px)
            )
          `,
          WebkitMask: `
            radial-gradient(
              farthest-side,
              transparent calc(100% - ${thickness}px),
              black calc(100% - ${thickness}px)
            )
          `,
        }}
      />
    </span>
  );
};

export default Spinner;
