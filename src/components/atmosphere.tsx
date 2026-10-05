/**
 * Fixed Ramadan-night backdrop: pre-dawn gradients, a faint arcade
 * lattice, a crescent hilal in the upper right, and scattered four-point
 * stars that gently twinkle. Everything here is decorative and subdued;
 * the reduced-motion media query in globals.css freezes the twinkle.
 */

interface Star {
  top: string;
  left: string;
  size: number;
  max: number;
  dur: number;
  delay: number;
}

const STARS: Star[] = [
  { top: "7%", left: "10%", size: 13, max: 0.5, dur: 5.4, delay: 0.2 },
  { top: "14%", left: "62%", size: 9, max: 0.42, dur: 6.6, delay: 1.4 },
  { top: "26%", left: "86%", size: 15, max: 0.34, dur: 7.2, delay: 0.7 },
  { top: "38%", left: "5%", size: 9, max: 0.4, dur: 5.9, delay: 2.2 },
  { top: "55%", left: "14%", size: 11, max: 0.3, dur: 6.9, delay: 1.0 },
  { top: "10%", left: "38%", size: 7, max: 0.46, dur: 5.6, delay: 2.9 },
  { top: "47%", left: "80%", size: 8, max: 0.28, dur: 7.6, delay: 1.8 },
];

/** Curved four-point sparkle, the classic Ramadan night-star silhouette. */
const STAR_PATH =
  "M12 2c.9 5.2 4.8 9.1 10 10-5.2.9-9.1 4.8-10 10-.9-5.2-4.8-9.1-10-10 5.2-.9 9.1-4.8 10-10Z";

export function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="atmosphere-base absolute inset-0" />
      {/* Soft halo behind the moon. */}
      <div className="atmosphere-moon-glow absolute -top-28 -right-24 h-[26rem] w-[26rem] rounded-full" />
      {/* Crescent hilal: one circle minus an offset one via mask, tilted.
          The thick body faces lower-left, so cropping at the top-right
          corner keeps the shape readable on phones. */}
      <svg
        viewBox="0 0 200 200"
        className="atmosphere-moon absolute -top-16 -right-12 h-64 w-64 rotate-[18deg]"
      >
        <mask id="amal-crescent">
          <circle cx="100" cy="100" r="78" fill="white" />
          <circle cx="127" cy="84" r="70" fill="black" />
        </mask>
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="currentColor"
          mask="url(#amal-crescent)"
        />
      </svg>
      {STARS.map((star, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="atmosphere-star absolute"
          style={
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              "--tw-max": String(star.max),
              "--tw-dur": `${star.dur}s`,
              "--tw-delay": `${star.delay}s`,
            } as React.CSSProperties
          }
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
      <div className="lattice absolute inset-0" />
    </div>
  );
}
