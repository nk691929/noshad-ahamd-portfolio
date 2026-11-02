/**
 * Purpose: the social-share image (1200x630) shown by WhatsApp, LinkedIn, X, Slack and search previews. Generated at
 * build time from /content; embeds public/images/profile-wide.jpg when it exists. Served at /opengraph-image.
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { real } from "@/lib/content/real";
import { profile } from "@content/profile";

export const alt = "Noshad Ahmad, Flutter Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadPhoto(): Promise<string | undefined> {
  try {
    const file = path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "public",
      "images",
      "profile-wide.jpg",
    );
    const buffer = await readFile(/*turbopackIgnore: true*/ file);
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export default async function OpengraphImage() {
  const photo = await loadPhoto();
  const location = real(profile.location);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #07080b 0%, #0b1d2c 55%, #0a3b36 100%)",
        color: "#f2f5fa",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 72px",
          width: photo ? 700 : 1200,
        }}
      >
        <div
          style={{ display: "flex", width: 72, height: 6, background: "#10c98f", marginBottom: 36 }}
        />
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
          {profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 24, color: "#13b9fd" }}>
          Flutter Developer
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 28,
            color: "rgba(242,245,250,0.72)",
            lineHeight: 1.35,
          }}
        >
          Offline-first mobile apps, Firebase and Next.js
        </div>
        {location ? (
          <div
            style={{
              display: "flex",
              fontSize: 26,
              marginTop: 36,
              color: "rgba(242,245,250,0.55)",
            }}
          >
            {location}
          </div>
        ) : null}
      </div>
      {photo ? (
        <div style={{ display: "flex", width: 500, height: 630, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} width={1120} height={630} alt="" style={{ marginLeft: -520 }} />
        </div>
      ) : null}
    </div>,
    { ...size },
  );
}
