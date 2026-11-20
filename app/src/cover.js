// cover.js — draws a multi-panel Vice City style cover onto a canvas.
// Pure rendering: no DOM access here except the canvas passed in.
// A "state" describes the cover: size, four photo slots, caption, grade.

export const SIZES = [
  { id: 'square', label: '1080 x 1080 — square post', w: 1080, h: 1080 },
  { id: 'portrait', label: '1080 x 1350 — portrait post', w: 1080, h: 1350 },
  { id: 'wide', label: '1920 x 1080 — wide post', w: 1920, h: 1080 },
];

export const GRADES = [
  {
    id: 'sunset',
    label: 'Sunset',
    filter: 'saturate(1.45) contrast(1.12) brightness(1.04)',
    washes: [
      { kind: 'linear', x0: 0, y0: 0, x1: 0, y1: 1, stops: [[0, 'rgba(255, 94, 0, 0.20)'], [0.55, 'rgba(255, 45, 120, 0.10)'], [1, 'rgba(40, 10, 90, 0.28)']], blend: 'overlay' },
    ],
  },
  {
    id: 'neon',
    label: 'Neon Nights',
    filter: 'saturate(1.7) contrast(1.18) brightness(0.98)',
    washes: [
      { kind: 'linear', x0: 0, y0: 0, x1: 1, y1: 0, stops: [[0, 'rgba(255, 0, 150, 0.26)'], [0.5, 'rgba(120, 0, 255, 0.10)'], [1, 'rgba(0, 220, 255, 0.26)']], blend: 'overlay' },
      { kind: 'linear', x0: 0, y0: 0, x1: 0, y1: 1, stops: [[0, 'rgba(0, 0, 0, 0)'], [1, 'rgba(10, 0, 40, 0.34)']], blend: 'multiply' },
    ],
  },
  {
    id: 'palm',
    label: 'Palm Dusk',
    filter: 'saturate(1.25) contrast(1.06) sepia(0.22) brightness(1.02)',
    washes: [
      { kind: 'linear', x0: 0, y0: 0, x1: 0, y1: 1, stops: [[0, 'rgba(255, 190, 80, 0.22)'], [1, 'rgba(20, 60, 90, 0.30)']], blend: 'soft-light' },
    ],
  },
  {
    id: 'noir',
    label: 'Vice Noir',
    filter: 'saturate(0.55) contrast(1.3) brightness(0.94)',
    washes: [
      { kind: 'linear', x0: 0, y0: 0, x1: 0, y1: 1, stops: [[0, 'rgba(0, 0, 0, 0)'], [1, 'rgba(0, 0, 0, 0.42)']], blend: 'multiply' },
      { kind: 'linear', x0: 0, y0: 0, x1: 1, y1: 0, stops: [[0, 'rgba(255, 40, 120, 0.14)'], [1, 'rgba(0, 200, 255, 0.14)']], blend: 'overlay' },
    ],
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}

// Four panels, as fractions of the cover. The hero takes the left two
// thirds; two small panels stack on the right; a wide strip runs along
// the bottom above the caption band.
export function panelRects(w, h) {
  const band = Math.round(h * 0.20); // caption band at the bottom
  const top = h - band;
  const gap = Math.max(6, Math.round(w * 0.008));
  const heroW = Math.round(w * 0.62);
  return [
    { x: 0, y: 0, w: heroW, h: Math.round(top * 0.72) },
    { x: heroW + gap, y: 0, w: w - heroW - gap, h: Math.round(top * 0.35) },
    { x: heroW + gap, y: Math.round(top * 0.35) + gap, w: w - heroW - gap, h: top - Math.round(top * 0.35) - gap - Math.round(top * 0.28) - gap },
    { x: 0, y: Math.round(top * 0.72) + gap, w: w, h: top - Math.round(top * 0.72) - gap },
  ];
}

export function blankSlot() {
  return { img: null, zoom: 1, dx: 0, dy: 0, name: '' };
}

export function blankState() {
  return {
    sizeId: 'square',
    gradeId: 'sunset',
    title: 'VICE CITY',
    tagline: 'One last ride down Ocean Drive',
    titleColor: '#ffffff',
    outline: true,
    selected: 0,
    slots: [blankSlot(), blankSlot(), blankSlot(), blankSlot()],
  };
}

function coverDrawImage(ctx, img, rect, slot) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(rect.w / iw, rect.h / ih);
  const scale = base * (slot.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = rect.x + rect.w / 2 + (slot.dx || 0);
  const cy = rect.y + rect.h / 2 + (slot.dy || 0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

function paintPlaceholder(ctx, rect, i) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  const hues = [['#ff7a18', '#ff2d78'], ['#7b2fff', '#00d4ff'], ['#00c2a8', '#ff5e62'], ['#ffd319', '#ff2975']];
  const [a, b] = hues[i % hues.length];
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `700 ${Math.max(18, Math.round(rect.h * 0.16))}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`PANEL ${i + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2 - Math.round(rect.h * 0.08));
  ctx.font = `${Math.max(13, Math.round(rect.h * 0.07))}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('drop a photo here', rect.x + rect.w / 2, rect.y + rect.h / 2 + Math.round(rect.h * 0.12));
}

function paintWash(ctx, w, h, wash) {
  let g;
  if (wash.kind === 'linear') {
    g = ctx.createLinearGradient(wash.x0 * w, wash.y0 * h, wash.x1 * w, wash.y1 * h);
  } else {
    g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  }
  for (const [at, color] of wash.stops) g.addColorStop(at, color);
  ctx.save();
  ctx.globalCompositeOperation = wash.blend || 'overlay';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function paintVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function paintCaption(ctx, w, h, state) {
  const band = Math.round(h * 0.20);
  const top = h - band;
  const g = ctx.createLinearGradient(0, top - Math.round(band * 0.6), 0, h);
  g.addColorStop(0, 'rgba(8, 2, 24, 0)');
  g.addColorStop(1, 'rgba(8, 2, 24, 0.88)');
  ctx.fillStyle = g;
  ctx.fillRect(0, top - Math.round(band * 0.6), w, band + Math.round(band * 0.6));

  const pad = Math.round(w * 0.045);
  const title = (state.title || '').toUpperCase();
  let size = Math.round(w * 0.115);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const fit = () => {
    ctx.font = `${size}px Anton, "Archivo Black", system-ui, sans-serif`;
    return ctx.measureText(title || ' ').width;
  };
  while (size > Math.round(w * 0.03) && fit() > w - pad * 2) size = Math.round(size * 0.92);
  // keep the title inside the caption band even on wide covers
  size = Math.min(size, Math.round(band * 0.62));
  ctx.font = `${size}px Anton, "Archivo Black", system-ui, sans-serif`;
  const titleY = h - Math.round(band * 0.38);
  ctx.save();
  ctx.shadowColor = 'rgba(255, 45, 120, 0.85)';
  ctx.shadowBlur = Math.round(w * 0.012);
  ctx.shadowOffsetY = Math.round(w * 0.004);
  if (state.outline) {
    ctx.lineWidth = Math.max(2, Math.round(size * 0.06));
    ctx.strokeStyle = '#12041f';
    ctx.lineJoin = 'round';
    ctx.strokeText(title, pad, titleY);
  }
  ctx.fillStyle = state.titleColor || '#ffffff';
  ctx.fillText(title, pad, titleY);
  ctx.restore();

  const tag = state.tagline || '';
  if (tag) {
    const tagSize = Math.max(14, Math.round(w * 0.026));
    ctx.font = `600 ${tagSize}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText(tag, pad, h - Math.round(band * 0.10));
  }

  // thin neon rule just above the title, sized from the fitted title
  const ruleY = titleY - size - Math.round(w * 0.012);
  ctx.fillStyle = '#ff2d78';
  ctx.fillRect(pad, ruleY, Math.round(w * 0.16), Math.max(3, Math.round(h * 0.004)));
  ctx.fillStyle = '#00d4ff';
  ctx.fillRect(pad + Math.round(w * 0.16) + Math.round(w * 0.012), ruleY, Math.round(w * 0.05), Math.max(3, Math.round(h * 0.004)));
}

// Draw the whole cover. `images` is state.slots with loaded HTMLImageElements.
export function drawCover(canvas, state) {
  const size = sizeById(state.sizeId);
  const w = size.w;
  const h = size.h;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.gradeId);
  const rects = panelRects(w, h);

  ctx.fillStyle = '#0b0218';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.filter = grade.filter;
  rects.forEach((rect, i) => {
    const slot = state.slots[i];
    if (slot && slot.img) coverDrawImage(ctx, slot.img, rect, slot);
    else paintPlaceholder(ctx, rect, i);
  });
  ctx.restore();

  for (const wash of grade.washes) paintWash(ctx, w, h, wash);
  paintVignette(ctx, w, h);

  // hairline gutters between panels
  ctx.fillStyle = 'rgba(11, 2, 24, 0.9)';
  const gap = Math.max(6, Math.round(w * 0.008));
  ctx.fillRect(rects[0].w, 0, gap, rects[0].h);
  ctx.fillRect(rects[0].w, rects[1].h, gap, rects[2].h + gap);
  ctx.fillRect(0, rects[0].h, w, gap);

  paintCaption(ctx, w, h, state);
  return { w, h };
}
