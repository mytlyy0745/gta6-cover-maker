# gta6-cover-maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/mytlyy0745/gta6-cover-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/mytlyy0745/gta6-cover-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice City Cover Maker turns your own photo and a caption into GTA 6-style poster art: a big hero panel, two smaller panels, a Vice City sunset or neon colour grade, bold display lettering, and a one-click PNG export in the three sizes people actually post — 1080×1080, 1080×1350 and 1920×1080. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

- **Any photo, any panel** — pick a file, drag one onto the preview, or load a built-in sample. Each of the three panels (hero, left, right) takes its own photo, or one photo can fill all three.
- **Crop and position per panel** — zoom and pan sliders apply to whichever panel you have selected, so any photo fits.
- **Live lettering** — a big caption in Bebas Neue, a tagline ribbon and a kicker strip, all editable with the preview updating as you type.
- **Four sunset grades** — Sunset, Neon Nights, Palm Dusk and Vice Pop, with a strength slider.
- **Fast export** — choose a post size, hit Export PNG, and the file downloads as `vice-cover-1080x1080.png` (or the size you picked).
- **Fully offline** — every script, font and sample photo is a file under `app/`; your photos are read on your own machine and never uploaded.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no install.

To hand the app in exactly as the grader sees it:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json`.

## Fonts

Display type is **Bebas Neue** and secondary type is **Russo One** — both SIL Open Font License faces shipped under `app/fonts/` (see `app/fonts/OFL.txt`). No Rockstar Games logo, wordmark, artwork, character or font is used anywhere.

## Layout

- `app/index.html` — the editor page
- `app/style.css` — sunset/neon editor theme
- `app/src/cover.js` — the multi-panel poster renderer and grades
- `app/src/main.js` — photo input, crop controls, live preview, export wiring
- `app/src/shots.js` — offscreen-canvas PNG export helpers
- `app/samples/` — two AI-made sample photos, free to use
- `main.ts` — copies the app and screenshots to `/output` and writes `dossier.json`
- `screenshots/` — the cover and editor screenshots taken from the real app

---

<sub>Entered on [make.fun](https://make.fun/?ref=mytlyy0745&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
