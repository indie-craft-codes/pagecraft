import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PageCraft - AI Landing Page Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "white",
            }}
          >
            PageCraft
          </span>
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          Build landing pages
          <br />
          in seconds, not days
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.8)",
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          AI-powered landing page generator · No design skills needed
        </div>
      </div>
    ),
    { ...size }
  );
}
