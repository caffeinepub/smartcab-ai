import { motion } from "motion/react";

interface MapSVGProps {
  pickup: string;
  dropoff: string;
  progress: number;
  statusIndex: number;
}

function getBezierPoint(t: number) {
  const P = [
    { x: 60, y: 185 },
    { x: 140, y: 75 },
    { x: 230, y: 195 },
    { x: 290, y: 115 },
    { x: 350, y: 55 },
    { x: 390, y: 30 },
  ];
  if (t <= 0.5) {
    const s = t * 2;
    const mt = 1 - s;
    return {
      x:
        mt * mt * mt * P[0].x +
        3 * mt * mt * s * P[1].x +
        3 * mt * s * s * P[2].x +
        s * s * s * P[3].x,
      y:
        mt * mt * mt * P[0].y +
        3 * mt * mt * s * P[1].y +
        3 * mt * s * s * P[2].y +
        s * s * s * P[3].y,
    };
  }
  const s = (t - 0.5) * 2;
  const mt = 1 - s;
  return {
    x:
      mt * mt * mt * P[3].x +
      3 * mt * mt * s * P[4].x +
      3 * mt * s * s * P[5].x +
      s * s * s * P[5].x,
    y:
      mt * mt * mt * P[3].y +
      3 * mt * mt * s * P[4].y +
      3 * mt * s * s * P[5].y +
      s * s * s * P[5].y,
  };
}

export default function MapSVG({
  pickup,
  dropoff,
  progress,
  statusIndex,
}: MapSVGProps) {
  const carPos = getBezierPoint(Math.max(0, Math.min(1, progress)));
  const showCar = statusIndex >= 1;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: 220 }}
    >
      <img
        src="/assets/generated/map-bg.dim_800x400.jpg"
        alt="City map background"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        data-ocid="map.canvas_target"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.11 0.028 252 / 0.3), oklch(0.11 0.028 252 / 0.6))",
        }}
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 440 220"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M 60 185 C 140 75, 230 195, 290 115 C 350 55, 380 35, 390 30"
          fill="none"
          stroke="oklch(0.26 0.038 250)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <motion.path
          d="M 60 185 C 140 75, 230 195, 290 115 C 350 55, 380 35, 390 30"
          fill="none"
          stroke="oklch(0.60 0.23 240)"
          strokeWidth="3"
          strokeLinecap="round"
          className="dash-animated"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        <g transform="translate(60, 185)">
          <circle r="10" fill="oklch(0.70 0.17 196)" opacity="0.25" />
          <motion.circle
            r="10"
            fill="oklch(0.70 0.17 196)"
            opacity="0.15"
            animate={{ r: [10, 20], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
          <circle r="6" fill="oklch(0.70 0.17 196)" />
          <circle r="3" fill="white" />
        </g>

        <g transform="translate(390, 30)">
          <motion.circle
            r="10"
            fill="oklch(0.60 0.23 240)"
            opacity="0.15"
            animate={{ r: [10, 20], opacity: [0.3, 0] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: 1,
            }}
          />
          <circle r="6" fill="oklch(0.60 0.23 240)" />
          <circle r="3" fill="white" />
        </g>

        {showCar && (
          <motion.g
            animate={{
              x: carPos.x - 14,
              y: carPos.y - 14,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <rect width="28" height="20" rx="6" fill="oklch(0.60 0.23 240)" />
            <rect
              x="5"
              y="3"
              width="18"
              height="10"
              rx="3"
              fill="white"
              opacity="0.9"
            />
            <circle cx="6" cy="20" r="4" fill="oklch(0.26 0.038 250)" />
            <circle cx="22" cy="20" r="4" fill="oklch(0.26 0.038 250)" />
            <circle cx="6" cy="20" r="2" fill="oklch(0.60 0.23 240)" />
            <circle cx="22" cy="20" r="2" fill="oklch(0.60 0.23 240)" />
          </motion.g>
        )}
      </svg>

      <div className="absolute bottom-3 left-3 right-3 flex justify-between">
        <div
          className="text-xs font-semibold px-2 py-1 rounded-lg truncate max-w-[45%]"
          style={{ background: "oklch(0.70 0.17 196 / 0.9)", color: "white" }}
        >
          📍 {pickup || "Pickup"}
        </div>
        <div
          className="text-xs font-semibold px-2 py-1 rounded-lg truncate max-w-[45%]"
          style={{ background: "oklch(0.60 0.23 240 / 0.9)", color: "white" }}
        >
          🏁 {dropoff || "Dropoff"}
        </div>
      </div>
    </div>
  );
}
