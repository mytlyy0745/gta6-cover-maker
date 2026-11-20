// Draws the multi-panel Vice City cover: a big hero panel, two smaller panels,
// a synthwave sun, a sunset/neon colour grade and bold Anton caption lettering.
// Every photo is drawn from an Image the user loaded on their own machine.

/** Export sizes offered by the app, in pixels. */
export const SIZES = {
  '1080x1080': { w: 1080, h: 1080 },
  '1080x1350': { w: 1080, h: 1350 },
  '1920x1080': { w: 1920, h: 1080 },
};

/** Colour grades: a canvas filter for the photos plus overlay colours. */
export const GRADES = {
  sunset: {
    filter: 'saturate(1.45) contrast(1.12) brightness(1.04) sepia(0.18)',
    skyTop: 'rgba(255, 94, 98, 0.10)',
    skyBottom: 'rgba(255, 60, 140, 0.38)',
    bandFrom: '#2a0a4a', bandTo: '#ff2e63',
    sunFrom: '#ffd319', sunTo: '#ff2975',
    accent: '#00e5ff',
  },
  neon: {
    filter: 'saturate(1.7) contrast(1.18) brightness(1.0) hue-rotate(-12deg)',
    skyTop: 'rgba(0, 229, 255, 0.12)',
    skyBottom: 'rgba(255, 46, 136, 0.45)',
    bandFrom: '#0d0221', bandTo: '#8b00ff',
    sunFrom: '#00e5ff', sunTo: '#ff2e88',
    accent: '#ffd319',
  },
  dusk: {
    filter: 'saturate(1.25) contrast(1.08) brightness(0.96) sepia(0.32)',
    skyTop: 'rgba(255, 170, 60, 0.14)',
    skyBottom: 'rgba(120, 20, 90, 0.42)',
    bandFrom: '#1c1030', bandTo: '#c94b4b',
    sunFrom: '#ff9a3d', sunTo: '#c2185b',
    accent: '#ffb347',
  },
};

/** Panel rectangles for a cover of width w and height h. Band is the caption strip. */
export function layoutPanels(w, h) {
  const bandH = Math.round(h * 0.21);
  const ph = h - bandH;
  const gap = Math.max(6, Math.round(w * 0.008));
  const heroW = Math.round(w * 0.60);
  return {
    bandH,
    panels: [
      { x: 0, y: 0, w: heroW, h: ph },
      { x: heroW + gap, y: 0, w: w - heroW - gap, h: Math.round(ph * 0.52) },
      { x: heroW + gap, y: Math.round(ph * 0.52) + gap, w: w - heroW - gap, h: ph - Math.round(ph * 0.52) - gap },
    ],
  };
}

/** Index of the panel containing point (x, y) in cover pixels, or -1. */
export function panelAt(w, h, x, y) {
  const { panels } = layoutPanels(w, h);
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    if (x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) return i;
  }
  return -1;
}

/** Clamps a panel state's pan offsets so its photo still covers the panel rect. */
export function clampPan(rect, p) {
  if (!p.photo) { p.ox = 0; p.oy = 0; return; }
  const base = Math.max(rect.w / p.photo.naturalWidth, rect.h / p.photo.naturalHeight);
  const sw = p.photo.naturalWidth * base * p.zoom;
  const sh = p.photo.naturalHeight * base * p.zoom;
  const maxX = Math.max(0, (sw - rect.w) / 2 / rect.w);
  const maxY = Math.max(0, (sh - rect.h) / 2 / rect.h);
  p.ox = Math.max(-maxX, Math.min(maxX, p.ox || 0));
  p.oy = Math.max(-maxY, Math.min(maxY, p.oy || 0));
}

function drawPanelPhoto(ctx, rect, photo, zoom, ox, oy, filter) {
  if (!photo) {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, '#3d1a5e');
    g.addColorStop(1, '#160a24');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `${Math.round(rect.h * 0.07)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = filter;
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const sw = photo.naturalWidth * base * zoom;
  const sh = photo.naturalHeight * base * zoom;
  ctx.drawImage(photo, rect.x + (rect.w - sw) / 2 + ox * rect.w, rect.y + (rect.h - sh) / 2 + oy * rect.h, sw, sh);
  ctx.restore();
}

function drawSun(ctx, hero, grade) {
  // Small sun tucked into the hero panel's top-right sky corner, clear of faces.
  const r = hero.w * 0.17;
  const cx = hero.x + hero.w * 0.86;
  const cy = hero.y + hero.h * 0.16;
  ctx.save();
  ctx.beginPath();
  ctx.rect(hero.x, hero.y, hero.w, hero.h);
  ctx.clip();
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, grade.sunFrom);
  g.addColorStop(1, grade.sunTo);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(43, 24, 56, 0.9)';
  for (let i = 0; i < 4; i++) {
    const y = cy + r * (0.05 + i * 0.22);
    ctx.fillRect(cx - r, y, r * 2, r * 0.045);
  }
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, startSize, family) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

/**
 * Draws the whole cover onto `canvas` from `state`:
 * { title, sub, grade, panels: [{ photo, zoom, ox, oy }] }.
 * The canvas's own width/height are the export size.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const { bandH, panels } = layoutPanels(w, h);
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);
  ctx.filter = 'none';

  for (let i = 0; i < panels.length; i++) {
    const p = state.panels[i];
    if (!p) continue;
    clampPan(panels[i], p);
    drawPanelPhoto(ctx, panels[i], p.photo, p.zoom, p.ox, p.oy, grade.filter);
  }
  ctx.filter = 'none';
  drawSun(ctx, panels[0], grade);

  // Sunset wash over the panels, stronger toward the caption band.
  const wash = ctx.createLinearGradient(0, 0, 0, h - bandH);
  wash.addColorStop(0, grade.skyTop);
  wash.addColorStop(1, grade.skyBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h - bandH);

  // Neon gutters: a bright frame line around each panel.
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = Math.max(2, w * 0.002);
  for (const p of panels) ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);

  // Caption band: diagonal gradient, big Anton title, spaced tagline.
  const bandY = h - bandH;
  const band = ctx.createLinearGradient(0, bandY, w, h);
  band.addColorStop(0, grade.bandFrom);
  band.addColorStop(1, grade.bandTo);
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, w, bandH);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, bandY, w, Math.max(3, h * 0.006));

  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    const size = fitFont(ctx, title, w * 0.92, bandH * 0.52, "Anton, sans-serif");
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.06;
    ctx.fillText(title, w / 2, bandY + bandH * 0.38);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  const sub = (state.sub || '').trim().toUpperCase();
  if (sub) {
    const size = fitFont(ctx, sub.split('').join(' '), w * 0.88, bandH * 0.17, "bold sans-serif");
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(sub, w / 2, bandY + bandH * 0.80);
  }
}
