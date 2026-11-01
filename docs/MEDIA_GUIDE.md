# Media guide: photos and "playing" previews

No content edits are needed. Drop files in `public/` using these names:

| File                                                 | Used for                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| `public/images/profile.jpg` (or webp/png/avif)       | Hero portrait (4:5 works best)                               |
| `public/media/<project-slug>.jpg` (or webp/png/avif) | Project cover and video poster (16:9)                        |
| `public/media/<project-slug>.webm` or `.mp4`         | Muted looping preview that plays while the card is on screen |

`<project-slug>` is the `slug` in `content/projects.ts` (for example `inventory-offline-sync`, `estate-demo`).
A `cover` set in content wins over a discovered file.

## Websites: record them automatically

```
pnpm add -D @playwright/test
pnpm exec playwright install chromium
pnpm capture
```

This opens the live sites listed at the top of `scripts/capture-previews.mjs`, saves a poster, records a slow scroll
that returns to the top (so it loops), and, if ffmpeg is installed (`winget install Gyan.FFmpeg`), trims the load
intro and compresses to VP9. Override targets: `pnpm capture my-slug=https://example.com`.

## Flutter / Android apps: record the phone

Mirror and record with scrcpy: `scrcpy --record=public/media/inventory-offline-sync.mp4`. Take a screenshot for the poster
(`public/media/inventory-offline-sync.jpg`). Portrait video is shown with `object-contain` inside a 16:9 frame.
Compress: `ffmpeg -i in.mp4 -an -c:v libvpx-vp9 -crf 34 -b:v 0 -r 30 out.webm`.

## Rules the site follows

- Videos are muted, loop, and only download when the card is near the viewport; they pause when off screen.
- Under `prefers-reduced-motion` nothing autoplays (poster only). Every video has a pause/play button.
- Keep each video under about 3 MB (10 to 12 seconds, no audio) and each image under about 300 KB. Large files slow the page and the git repo; use Git LFS if the folder grows past roughly 50 MB.
