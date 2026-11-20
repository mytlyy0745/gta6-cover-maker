// Wires the Vice City Cover Maker: pick panels, load photos (file picker,
// drag-and-drop, or the two free samples), crop by dragging and zooming,
// edit the caption and tagline, pick a grade and size, export a PNG.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover, panelAt, clampPan, layoutPanels, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subInput = document.getElementById('subcaption');
const status = document.getElementById('status');
const zoomInput = document.getElementById('zoom');
const zoomValue = document.getElementById('zoom-value');

const state = {
  title: captionInput.value,
  sub: subInput.value,
  grade: 'sunset',
  size: '1080x1080',
  selected: 0,
  panels: [
    { photo: null, zoom: 1, ox: 0, oy: 0 },
    { photo: null, zoom: 1, ox: 0, oy: 0 },
    { photo: null, zoom: 1, ox: 0, oy: 0 },
  ],
};

function redraw() {
  drawCover(canvas, state);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function selectPanel(i) {
  state.selected = i;
  document.querySelectorAll('.panel-btn').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.panel) === i);
  });
  const p = state.panels[i];
  zoomInput.value = Math.round(p.zoom * 100);
  zoomValue.textContent = `${Math.round(p.zoom * 100)}%`;
  redraw();
}

function setPanelPhoto(i, img) {
  state.panels[i] = { photo: img, zoom: 1, ox: 0, oy: 0 };
  selectPanel(i);
  status.textContent = `Photo loaded into panel ${i + 1}.`;
}

async function loadSample(name, panelIndex) {
  const img = await loadImage(`samples/${name}.jpg`);
  setPanelPhoto(panelIndex, img);
}

document.querySelectorAll('.panel-btn').forEach((b) => {
  b.addEventListener('click', () => selectPanel(Number(b.dataset.panel)));
});

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setPanelPhoto(state.selected, await loadImage(URL.createObjectURL(file)));
  e.target.value = '';
});

document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier', state.selected));
document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard', state.selected));
document.getElementById('fill-all').addEventListener('click', () => {
  const src = state.panels[state.selected].photo;
  if (!src) { status.textContent = 'Load a photo into the selected panel first.'; return; }
  for (let i = 0; i < 3; i++) {
    state.panels[i] = { photo: src, zoom: 1 + i * 0.18, ox: i === 2 ? -0.05 : 0.04 * i, oy: i === 1 ? -0.04 : 0 };
    const { panels } = layoutPanels(canvas.width, canvas.height);
    clampPan(panels[i], state.panels[i]);
  }
  selectPanel(state.selected);
  status.textContent = 'One photo now fills all three panels, each cropped differently.';
});

zoomInput.addEventListener('input', () => {
  const p = state.panels[state.selected];
  p.zoom = Number(zoomInput.value) / 100;
  zoomValue.textContent = `${zoomInput.value}%`;
  redraw();
});

captionInput.addEventListener('input', () => { state.title = captionInput.value; redraw(); });
subInput.addEventListener('input', () => { state.sub = subInput.value; redraw(); });

document.querySelectorAll('.grade-btn').forEach((b) => {
  b.addEventListener('click', () => {
    state.grade = b.dataset.grade;
    document.querySelectorAll('.grade-btn').forEach((x) => x.classList.toggle('active', x === b));
    redraw();
  });
});

document.querySelectorAll('.size-btn').forEach((b) => {
  b.addEventListener('click', () => {
    state.size = b.dataset.size;
    const { w, h } = SIZES[state.size];
    canvas.width = w;
    canvas.height = h;
    document.querySelectorAll('.size-btn').forEach((x) => x.classList.toggle('active', x === b));
    redraw();
  });
});

// Drag on the cover: click selects the panel under the pointer, drag pans it.
let dragging = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}
canvas.addEventListener('pointerdown', (e) => {
  const pt = canvasPoint(e);
  const i = panelAt(canvas.width, canvas.height, pt.x, pt.y);
  if (i < 0) return;
  selectPanel(i);
  dragging = { i, x: pt.x, y: pt.y };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const pt = canvasPoint(e);
  const p = state.panels[dragging.i];
  const { panels } = layoutPanels(canvas.width, canvas.height);
  p.ox += (pt.x - dragging.x) / panels[dragging.i].w;
  p.oy += (pt.y - dragging.y) / panels[dragging.i].h;
  dragging.x = pt.x;
  dragging.y = pt.y;
  clampPan(panels[dragging.i], p);
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });

// Drop a photo file onto the cover: it lands in the panel under the drop.
canvas.addEventListener('dragover', (e) => e.preventDefault());
canvas.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const pt = canvasPoint(e);
  const i = panelAt(canvas.width, canvas.height, pt.x, pt.y);
  setPanelPhoto(i >= 0 ? i : state.selected, await loadImage(URL.createObjectURL(file)));
});

document.getElementById('export').addEventListener('click', () => {
  const { w, h } = SIZES[state.size];
  canvas.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    status.textContent = `Saved vice-cover-${w}x${h}.png`;
  }, 'image/png');
});

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, {
    async loadSamples(assignments, text, sub, grade, size) {
      if (size && SIZES[size]) {
        state.size = size;
        canvas.width = SIZES[size].w;
        canvas.height = SIZES[size].h;
        document.querySelectorAll('.size-btn').forEach((x) => x.classList.toggle('active', x.dataset.size === size));
      }
      if (grade) {
        state.grade = grade;
        document.querySelectorAll('.grade-btn').forEach((x) => x.classList.toggle('active', x.dataset.grade === grade));
      }
      for (const [i, name] of assignments) {
        state.panels[i] = { photo: await loadImage(`samples/${name}.jpg`), zoom: 1 + i * 0.12, ox: i === 2 ? -0.04 : 0.03 * i, oy: i === 0 ? 0 : 0.14 + i * 0.08 };
      }
      captionInput.value = text;
      subInput.value = sub;
      state.title = text;
      state.sub = sub;
      selectPanel(0);
      redraw();
    },
  });
} else {
  redraw();
}

// Redraw once the Anton display font arrives, so the caption uses it.
if (document.fonts && document.fonts.load) {
  document.fonts.load('100px Anton').then(redraw).catch(() => {});
  document.fonts.ready.then(redraw).catch(() => {});
}
