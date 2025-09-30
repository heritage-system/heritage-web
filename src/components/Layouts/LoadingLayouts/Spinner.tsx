// components/Feedback/Spinner.tsx
import React from "react";

type SpinnerProps = {
  size?: number;           // px
  thickness?: number;      // px
  className?: string;
  ariaLabel?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 28,
  thickness = 3,
  className = "",
  ariaLabel = "Đang tải",
}) => {
  const border = `${thickness}px`;
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-block align-middle ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="block rounded-full animate-spin"
        style={{
          width: "100%",
          height: "100%",
          border: `${border} solid rgba(0,0,0,0.08)`,
          borderTop: `${border} solid`,
          borderImage: "linear-gradient(to right, #A16207, #B91C1C) 1", 
          // #A16207 ~ yellow-700, #B91C1C ~ red-700
        }}
      />
    </span>
  );
};

export default Spinner;
