# gta6-cover-maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/mytlyy0745/gta6-cover-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/mytlyy0745/gta6-cover-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice City Cover Maker turns your photo and a caption into GTA-style multi-panel cover art: a big hero panel plus three smaller panels, per-panel crop and positioning, bold display lettering, Vice City sunset and neon colour grades, and PNG export in the three common post sizes — 1080×1080, 1080×1350 and 1920×1080. It is a static offline web app: every script, font and sample is a file under `app/`, photos are read on your own machine and never uploaded.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080, drop a photo on the cover (or try a bundled sample), pick a panel to crop it, type your caption, choose a grade and size, and hit Export PNG.

## How it works

- `app/index.html` + `app/style.css` — the editor shell: photo picker and drag-and-drop, panel picker, zoom slider, caption fields, grade and size pickers.
- `app/src/cover.js` — the renderer: four-panel layout, per-slot crop/zoom/pan, colour-grade washes (sunset, neon, palm dusk, vice noir), Anton display lettering with outline and neon glow.
- `app/src/main.js` — editor wiring: file loading, click-to-select and drag-to-pan on the preview canvas, live re-render, PNG export via `canvas.toBlob`.
- `app/src/shots.js` — one-click looks (Sunset Drive, Neon Nights, Palm Noir) and the screenshot list.
- `app/fonts/` — Anton and Archivo Black, both SIL Open Font License (see `app/fonts/OFL.txt`).
- `app/samples/` — two AI-made sample photos, free to use.

Original design only: no Rockstar Games logo, wordmark, official artwork, character or font anywhere in the app.

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=mytlyy0745&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
