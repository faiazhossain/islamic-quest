import { ImageResponse } from "next/og";

/**
 * Static preview of the challenge milestone share card (2026-10-08).
 * The real card is drawn client-side on /challenge/[id]/share from the
 * user's own IndexedDB data (canvas, bilingual, two themes); this route
 * renders the same design as a plain PNG with example data so the card
 * can be seen - and used as a share/OG image - without completing a
 * challenge first. Same palette and layout proportions as
 * src/app/challenge/[id]/share/page.tsx. Satori supports flexbox only.
 */
export const contentType = "image/png";

const PALETTE = {
  bgTop: "#0b1020",
  bgBottom: "#060a16",
  accent: "#f0c877",
  ink: "#eaedf9",
  sub: "#a7b1cc",
};

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: `linear-gradient(180deg, ${PALETTE.bgTop} 0%, ${PALETTE.bgBottom} 100%)`,
          color: PALETTE.ink,
        }}
      >
        {/* Khatam mark: two overlaid squares, one rotated 45deg. */}
        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: 280,
            marginTop: 300,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 70,
              left: 440,
              width: 200,
              height: 200,
              border: `9px solid ${PALETTE.accent}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 70,
              left: 440,
              width: 200,
              height: 200,
              border: `9px solid ${PALETTE.accent}`,
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 157,
              left: 527,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: PALETTE.accent,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 130,
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: 8,
            color: PALETTE.accent,
          }}
        >
          CHALLENGE COMPLETE
        </div>

        <div style={{ marginTop: 40, fontSize: 230, fontWeight: 300 }}>
          30
        </div>
        <div style={{ fontSize: 44, fontWeight: 600, color: PALETTE.sub }}>
          days completed
        </div>

        <div style={{ marginTop: 90, fontSize: 76, fontWeight: 700 }}>
          AYAT AL-KURSI
        </div>

        <div
          style={{
            marginTop: 70,
            fontSize: 88,
            fontStyle: "italic",
            color: PALETTE.accent,
          }}
        >
          Alhamdulillah
        </div>

        <div style={{ marginTop: 280, fontSize: 34, color: PALETTE.sub }}>
          7 October 2026
        </div>
        <div
          style={{
            marginTop: 60,
            width: 180,
            height: 2,
            background: "rgba(167, 177, 204, 0.3)",
          }}
        />
        <div
          style={{
            marginTop: 50,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: 10,
            color: PALETTE.accent,
          }}
        >
          AMALYN
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    },
  );
}
