import React from "react";

type ScoreRingProps = {
  score: number;           
  size?: number;           
  thickness?: number;      
  className?: string;
  ariaLabel?: string;
  tooltip?: string;        // ⭐ thêm tooltip text
};

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const interpolateColor = (t: number) => {
  const r1 = 0xF5, g1 = 0x9E, b1 = 0x0B;
  const r2 = 0xB9, g2 = 0x1C, b2 = 0x1C;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
};

const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 44,
  thickness = 4,
  className = "",
  ariaLabel,
  tooltip = "Độ tương thích nhận diện:"
}) => {
  const pct = clamp(Math.round(score), 0, 100);
  const t = pct / 100;
  const color = interpolateColor(t);

  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="relative inline-block group" style={{ width: size, height: size }}>
      {/* Tooltip */}
      {/* <div
        className="
          absolute -top-8 left-1/2 -translate-x-1/2
          px-2 py-1 rounded text-xs font-medium
          bg-black/80 text-white whitespace-nowrap 
          opacity-0 group-hover:opacity-100 
          pointer-events-none transition-all duration-200
        "
      >
        {tooltip}: {pct}%
      </div> */}

      {/* The ring */}
      <div
        role="img"
        aria-label={ariaLabel ?? `Điểm: ${pct}%`}
        title={`${tooltip} ${pct}%`}
        className={`inline-block ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={thickness}
            fill="transparent"
          />

          <g style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
              fill="transparent"
              style={{
                transition: "stroke-dasharray 360ms ease, stroke 360ms ease",
              }}
            />
          </g>

          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            fontSize={Math.max(10, Math.round(size * 0.30))}
            fontWeight={700}
            fill="#111827"
          >
            {pct}%
          </text>
        </svg>
      </div>
    </div>
  );
};

export default ScoreRing;
