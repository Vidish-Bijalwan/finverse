import { cn } from "@/lib/utils";

type Orb = {
  color: string;
  size: string;
  top: string;
  left: string;
  blur: string;
  opacity: number;
  animation: string;
};

/**
 * Five large, blurred, colored light orbs drifting slowly on different paths —
 * the "colored bulbs" ambient feel for the auth screens. Each orb has its own
 * size, position, color, blur and drift duration so the field never looks
 * looped or mechanical. Rendered with `mix-blend-screen` over deep ink.
 *
 * Motion is disabled via `@media (prefers-reduced-motion: reduce)` in CSS;
 * the orbs simply sit still in their composed positions.
 */
const ORBS: Orb[] = [
  {
    // Brand mint — large, upper left
    color: "oklch(0.62 0.15 163 / 0.55)",
    size: "36rem",
    top: "-12%",
    left: "-10%",
    blur: "100px",
    opacity: 0.8,
    animation: "fv-orb-drift-a 42s ease-in-out infinite alternate",
  },
  {
    // Electric blue — upper right
    color: "oklch(0.58 0.2 262 / 0.5)",
    size: "32rem",
    top: "-8%",
    left: "68%",
    blur: "110px",
    opacity: 0.75,
    animation: "fv-orb-drift-b 55s ease-in-out infinite alternate",
  },
  {
    // Violet — lower left
    color: "oklch(0.58 0.22 305 / 0.42)",
    size: "30rem",
    top: "62%",
    left: "-12%",
    blur: "100px",
    opacity: 0.7,
    animation: "fv-orb-drift-c 48s ease-in-out infinite alternate",
  },
  {
    // Warm amber — lower right, the "bulb" warmth
    color: "oklch(0.75 0.16 80 / 0.38)",
    size: "28rem",
    top: "58%",
    left: "70%",
    blur: "110px",
    opacity: 0.7,
    animation: "fv-orb-drift-a 64s ease-in-out infinite alternate-reverse",
  },
  {
    // Teal — small, center, ties the palette together
    color: "oklch(0.68 0.15 200 / 0.32)",
    size: "24rem",
    top: "30%",
    left: "38%",
    blur: "90px",
    opacity: 0.6,
    animation: "fv-orb-drift-b 36s ease-in-out infinite alternate-reverse",
  },
];

export function AmbientOrbs({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("fv-orbs", className)}>
      {ORBS.map((orb, i) => (
        <span
          key={i}
          className="fv-orb"
          style={{
            background: orb.color,
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            filter: `blur(${orb.blur})`,
            opacity: orb.opacity,
            animation: orb.animation,
          }}
        />
      ))}
      <span aria-hidden="true" className="fv-vignette" />
    </div>
  );
}
