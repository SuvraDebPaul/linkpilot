import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LinkPilot — Campaign Link Management for Freelancers and Agencies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(13,148,136,0.15)",
            border: "1.5px solid rgba(20,184,166,0.4)",
            borderRadius: "100px",
            padding: "8px 22px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#14b8a6",
            }}
          />
          <span style={{ color: "#5eead4", fontSize: "18px", fontWeight: 600 }}>
            Campaign link management
          </span>
        </div>

        {/* Logotype */}
        <div
          style={{
            display: "flex",
            fontSize: "80px",
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: "24px",
          }}
        >
          <span style={{ color: "#f8fafc" }}>Link</span>
          <span style={{ color: "#0d9488" }}>Pilot</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            lineHeight: 1.5,
            maxWidth: "780px",
            marginBottom: "52px",
          }}
        >
          Short links · QR codes · Campaigns · Analytics · Client reports
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          {["Free account", "50 managed links", "2 campaigns", "Basic analytics"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                padding: "10px 22px",
                fontSize: "18px",
                color: "#cbd5e1",
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
