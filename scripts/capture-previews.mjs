// Purpose: record "website plays like a video" previews of live sites.
// For each target it saves public/media/<slug>.jpg (poster) and public/media/<slug>.webm (slow scroll, loops
// back to the top). If ffmpeg is installed it trims the page-load seconds and compresses the video.
// Run: pnpm capture                     (uses the default targets below)
//      pnpm capture estate-demo=https://example.com   (override: slug=url pairs)
// Setup once: pnpm add -D @playwright/test && pnpm exec playwright install chromium
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

// EDIT: slug must equal the project slug in content/projects.ts
const DEFAULT_TARGETS = {
  "estate-demo": "https://estate-demo-nu.vercel.app/",
  nexymark: "https://nexymark.com",
  "al-hesan": "https://alhesanalabyadhbuildingmaterials.com/en",
};

const W = 1280;
const H = 720;
const SCROLL_DOWN_MS = 9000;
const SCROLL_UP_MS = 2500;
const MAX_SCROLL_PX = 5000;

const pairs = process.argv.slice(2).filter((a) => a.includes("="));
const targets = pairs.length
  ? Object.fromEntries(
      pairs.map((a) => {
        const i = a.indexOf("=");
        return [a.slice(0, i), a.slice(i + 1)];
      }),
    )
  : DEFAULT_TARGETS;

const OUT = path.resolve("public", "media");
const TMP = path.resolve(".capture-tmp");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const hasFfmpeg = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
if (!hasFfmpeg)
  console.log(
    "ffmpeg not found: videos will keep their page-load intro and stay large. See docs/MEDIA_GUIDE.md.",
  );

const scroll = (page, to, ms) =>
  page.evaluate(
    ({ to, ms }) =>
      new Promise((resolve) => {
        const from = window.scrollY;
        const start = performance.now();
        const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        const tick = (now) => {
          const t = Math.min(1, (now - start) / ms);
          window.scrollTo(0, from + (to - from) * ease(t));
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      }),
    { to, ms },
  );

const browser = await chromium.launch();

for (const [slug, url] of Object.entries(targets)) {
  console.log(`\nCapturing ${slug} from ${url}`);
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: TMP, size: { width: W, height: H } },
  });
  const page = await context.newPage();
  const startedAt = Date.now();
  let trimSeconds = 0;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1500);
    trimSeconds = (Date.now() - startedAt) / 1000;
    await page.screenshot({ path: path.join(OUT, `${slug}.jpg`), type: "jpeg", quality: 80 });
    const total = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const distance = Math.max(0, Math.min(total, MAX_SCROLL_PX));
    await scroll(page, distance, SCROLL_DOWN_MS);
    await page.waitForTimeout(700);
    await scroll(page, 0, SCROLL_UP_MS);
    await page.waitForTimeout(500);
  } catch (error) {
    console.error(`  failed: ${error.message}`);
  }

  const video = page.video();
  await context.close();
  if (!video) continue;
  const raw = path.join(TMP, `${slug}.raw.webm`);
  await video.saveAs(raw);
  const dest = path.join(OUT, `${slug}.webm`);

  if (hasFfmpeg) {
    const result = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-ss",
        trimSeconds.toFixed(1),
        "-i",
        raw,
        "-c:v",
        "libvpx-vp9",
        "-crf",
        "34",
        "-b:v",
        "0",
        "-an",
        "-r",
        "30",
        dest,
      ],
      { stdio: "ignore" },
    );
    if (result.status !== 0) copyFileSync(raw, dest);
  } else {
    copyFileSync(raw, dest);
  }
  console.log(`  saved public/media/${slug}.jpg and ${slug}.webm`);
}

await browser.close();
rmSync(TMP, { recursive: true, force: true });
console.log("\nDone. Run pnpm dev to see the previews on the project cards.");
