import { ImageResponse } from "next/og";

import { profile, promptUser } from "@/data/profile";

/**
 * Rendered once at build time: a static export has no server to generate
 * this per request.
 */
export const dynamic = "force-static";

export const alt = `${profile.name} — ${profile.primaryTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview card, generated at build time in the site's own visual
 * language. Uses system fonts only so the build needs no font fetch.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#080B0F",
          padding: "72px 80px",
          fontFamily: "monospace",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: "#39FF88",
            }}
          />
          <div style={{ fontSize: 24, color: "#7C8693" }}>
            {profile.status.toUpperCase()}
          </div>
        </div>

        {/* Main block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#39FF88", marginBottom: 28 }}>
            {`${promptUser}:~$ whoami`}
          </div>

          <div
            style={{
              fontSize: 86,
              fontWeight: 700,
              color: "#E6EDF3",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            ABDALKARIM DWIKAT
          </div>

          <div style={{ fontSize: 42, color: "#39FF88", marginTop: 22 }}>
            {"SOFTWARE & AI ENGINEER"}
          </div>

          <div style={{ fontSize: 26, color: "#8B949E", marginTop: 22 }}>
            AI · SOFTWARE · EMBEDDED SYSTEMS
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #252C35",
            paddingTop: 26,
            fontSize: 22,
            color: "#626C77",
          }}
        >
          <div>B.Sc. Computer Engineering — Birzeit University</div>
          <div>{profile.location}</div>
        </div>
      </div>
    ),
    size,
  );
}
