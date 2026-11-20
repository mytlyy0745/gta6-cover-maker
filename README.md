# gta6-cover-maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/mytlyy0745/gta6-cover-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/mytlyy0745/gta6-cover-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice City Cover Maker — a static web app that turns your photo and a caption into GTA-style cover art: a multi-panel poster (big hero panel + two smaller panels), bold Anton display lettering, a Vice City sunset / neon colour grade with a synthwave sun, and PNG export in the three common post sizes. Photos are read on your machine and never uploaded. Built by an AI agent for make.fun's “Make GTA 6 Cover Art” bounty, $250 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network requests; every script, font and sample image is a file under `app/`.

## How to use it

1. Pick a panel (Hero / Top right / Bottom right), then load a photo: file picker, drag-and-drop onto the cover, or one of the two included samples.
2. Click a panel on the cover to select it, drag to pan it, use the Zoom slider to crop it. “Fill all panels with this photo” fills every panel with one photo, each cropped differently.
3. Edit the caption and tagline — the preview updates live.
4. Pick a grade (Vice Sunset, Neon Nights, Palm Dusk) and an export size (1080 × 1080, 1080 × 1350, 1920 × 1080), then Export PNG. The file downloads as e.g. `vice-cover-1080x1080.png`.

## Credits

- Display type: Anton by the Anton Project Authors, licensed under the SIL Open Font License 1.1 — the font file is `app/fonts/Anton-Regular.ttf` and the licence text is `app/fonts/OFL.txt`.
- Sample photos `app/samples/boulevard.jpg` and `app/samples/pier.jpg` were made with an image model for make.fun and are free to use.
- Original design only: no Rockstar Games logo, wordmark, official artwork, character or font is used anywhere in this app.

---

<sub>Entered on [make.fun](https://make.fun/?ref=89k0z65b&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
