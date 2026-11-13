import { ImageResponse } from "next/og";

export const alt = "Elite Hive Kenya - Beyond Vision. Beyond Limits.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#111", color: "#fff" }}>
        <div style={{ fontSize: 30, letterSpacing: 8, color: "#FFD800", display: "flex" }}>ELITE HIVE KENYA</div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 24, lineHeight: 1.05, display: "flex" }}>Beyond Vision. Beyond Limits.</div>
        <div style={{ fontSize: 30, marginTop: 32, color: "#ccc", display: "flex" }}>We Capture. We Create. We Inform.</div>
      </div>
    ),
    size,
  );
}
