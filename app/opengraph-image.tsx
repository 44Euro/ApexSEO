import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE_NAME;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#161826",
          padding: "0 88px",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9184d9",
            marginBottom: 28,
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 68, color: "#e9e9ed", lineHeight: 1.15, maxWidth: 900 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ marginTop: 40, height: 3, width: 160, background: "#9184d9" }} />
      </div>
    ),
    size,
  );
}
