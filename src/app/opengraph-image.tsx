import { ImageResponse } from "next/og";

/**
 * Share-card image for every route. The file convention at the root
 * segment applies app-wide; child pages inherit it unless they define
 * their own. Rendered once at build time with next/og's bundled default
 * font, so there are no font assets to keep in sync. Satori supports
 * flexbox only - no grid, no external stylesheets.
 */
export const alt = "Amalyn — a calm, offline-first Dhikr companion";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1020 30%, #060a16 100%)",
        }}
      >
        {/* Journey-of-light motif: milestones brightening left to right. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 34,
            marginBottom: 56,
          }}
        >
          {[0.14, 0.28, 0.46, 0.68, 1].map((opacity, index) => (
            <div
              key={index}
              style={{
                width: index === 4 ? 26 : 16,
                height: index === 4 ? 26 : 16,
                borderRadius: "50%",
                background: "#f0c877",
                opacity,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 128,
            letterSpacing: -4,
            color: "#eaedf9",
          }}
        >
          Amalyn
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#a7b1cc",
            marginTop: 28,
          }}
        >
          A calm, offline Dhikr companion
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#76819f",
            marginTop: 20,
          }}
        >
          Free forever
        </div>
      </div>
    ),
    // For convenience, re-use the exported size config as the image
    // dimensions so the meta tags and the rendered PNG always agree.
    { ...size },
  );
}
