// main.js — wires the Vice City Cover Maker editor to the cover renderer.
// All state lives in one `state` object; every control edits it and calls
// render() again, so the preview is always the cover you would export.

import { drawCover, blankState, blankSlot, SIZES, GRADES, sizeById, panelRects } from './cover.js';
import { LOOKS, lookById } from './shots.js';

const $ = (id) => document.getElementById(id);

const state = blankState();
let renderQueued = false;

const preview = $('preview');
const statusEl = $('status');

function note(msg) {
  statusEl.textContent = msg;
}

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    drawCover(preview, state);
    syncPanelButtons();
  });
}

function syncPanelButtons() {
  document.querySelectorAll('#panelRow button').forEach((b, i) => {
    b.classList.toggle('active', i === state.selected);
    const slot = state.slots[i];
    b.textContent = `Panel ${i + 1}${slot && slot.img ? ' ✓' : ''}`;
  });
  const slot = state.slots[state.selected];
  $('zoomRange').value = String(Math.round(((slot && slot.zoom) || 1) * 100));
  $('zoomLabel').textContent = `${Math.round(((slot && slot.zoom) || 1) * 100)}%`;
}

// ---- photos ---------------------------------------------------------------

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not read ${file.name}`));
    img.src = url;
  });
}

async function loadPhotoInto(slotIndex, file) {
  try {
    const img = await fileToImage(file);
    const slot = state.slots[slotIndex];
    slot.img = img;
    slot.name = file.name;
    slot.zoom = 1;
    slot.dx = 0;
    slot.dy = 0;
    note(`Loaded ${file.name} into panel ${slotIndex + 1}.`);
    queueRender();
  } catch (err) {
    note(err.message);
  }
}

async function loadSampleIntoAll(path, label) {
  try {
    const res = await fetch(path);
    const blob = await res.blob();
    const img = await fileToImage(new File([blob], label, { type: blob.type }));
    state.slots = state.slots.map(() => {
      const s = blankSlot();
      s.img = img;
      s.name = label;
      return s;
    });
    note(`Sample “${label}” filled all four panels. Pick a panel to re-crop it.`);
    queueRender();
  } catch (err) {
    note(`Sample failed to load: ${err.message}`);
  }
}

function onFiles(files) {
  const list = [...files].filter((f) => f.type.startsWith('image/'));
  if (!list.length) {
    note('That was not an image file — try a JPG or PNG.');
    return;
  }
  if (list.length === 1) {
    loadPhotoInto(state.selected, list[0]);
  } else {
    list.slice(0, 4).forEach((f, i) => loadPhotoInto(i, f));
    note(`Loaded ${Math.min(list.length, 4)} photos, one per panel.`);
  }
}

// ---- controls -------------------------------------------------------------

function buildButtons(container, items, currentId, onPick) {
  const box = $(container);
  box.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.label;
    b.dataset.id = item.id;
    b.classList.toggle('active', item.id === currentId);
    b.addEventListener('click', () => {
      onPick(item.id);
      box.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
    });
    box.appendChild(b);
  }
}

function buildGradeButtons() {
  buildButtons('gradeRow', GRADES, state.gradeId, (id) => {
    state.gradeId = id;
    queueRender();
  });
}

function buildSizeButtons() {
  buildButtons('sizeRow', SIZES, state.sizeId, (id) => {
    state.sizeId = id;
    queueRender();
    note(`Export size: ${sizeById(id).label}.`);
  });
}

function buildLookButtons() {
  buildButtons('lookRow', LOOKS, '', (id) => {
    const look = lookById(id);
    state.title = look.title;
    state.tagline = look.tagline;
    state.gradeId = look.gradeId;
    state.sizeId = look.sizeId;
    state.titleColor = look.titleColor;
    $('titleInput').value = look.title;
    $('taglineInput').value = look.tagline;
    buildGradeButtons();
    buildSizeButtons();
    buildColorSwatches();
    queueRender();
    note(`Look “${look.label}” applied — swap in your own photo.`);
  });
}

function buildColorSwatches() {
  const colors = [
    { id: 'white', value: '#ffffff', label: 'White' },
    { id: 'yellow', value: '#ffe95e', label: 'Taxi yellow' },
    { id: 'pink', value: '#ff5ea8', label: 'Neon pink' },
    { id: 'cyan', value: '#5ee6ff', label: 'Neon cyan' },
  ];
  const box = $('colorRow');
  box.innerHTML = '';
  for (const c of colors) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.style.background = c.value;
    b.title = c.label;
    b.setAttribute('aria-label', c.label);
    b.classList.toggle('active', state.titleColor === c.value);
    b.addEventListener('click', () => {
      state.titleColor = c.value;
      box.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('active', x === b));
      queueRender();
    });
    box.appendChild(b);
  }
}

function buildPanelButtons() {
  const box = $('panelRow');
  box.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('click', () => {
      state.selected = i;
      queueRender();
      note(`Panel ${i + 1} selected — drag on the preview to move its photo.`);
    });
    box.appendChild(b);
  }
  syncPanelButtons();
}

// ---- preview interaction: click to pick a panel, drag to pan it -----------

function previewPoint(evt) {
  const r = preview.getBoundingClientRect();
  const size = sizeById(state.sizeId);
  return {
    x: ((evt.clientX - r.left) / r.width) * size.w,
    y: ((evt.clientY - r.top) / r.height) * size.h,
    scale: size.w / r.width,
  };
}

function panelAt(x, y) {
  const size = sizeById(state.sizeId);
  const rects = panelRects(size.w, size.h);
  for (let i = 0; i < rects.length; i++) {
    const rc = rects[i];
    if (x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h) return i;
  }
  return -1;
}

let drag = null;

preview.addEventListener('pointerdown', (evt) => {
  const p = previewPoint(evt);
  const i = panelAt(p.x, p.y);
  if (i < 0) return;
  state.selected = i;
  const slot = state.slots[i];
  drag = { startX: p.x, startY: p.y, dx: slot.dx, dy: slot.dy };
  preview.setPointerCapture(evt.pointerId);
  queueRender();
});

preview.addEventListener('pointermove', (evt) => {
  if (!drag) return;
  const p = previewPoint(evt);
  const slot = state.slots[state.selected];
  slot.dx = drag.dx + (p.x - drag.startX);
  slot.dy = drag.dy + (p.y - drag.startY);
  queueRender();
});

preview.addEventListener('pointerup', () => {
  drag = null;
});

// ---- export ---------------------------------------------------------------

async function exportCover() {
  const size = sizeById(state.sizeId);
  const off = document.createElement('canvas');
  await document.fonts.ready;
  drawCover(off, state);
  note('Rendering PNG…');
  off.toBlob((blob) => {
    if (!blob) {
      note('Export failed — the browser could not make the PNG.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vice-cover-${size.w}x${size.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    note(`Exported vice-cover-${size.w}x${size.h}.png (${size.w}×${size.h}).`);
  }, 'image/png');
}

// ---- boot -----------------------------------------------------------------

function boot() {
  buildGradeButtons();
  buildSizeButtons();
  buildLookButtons();
  buildColorSwatches();
  buildPanelButtons();

  $('titleInput').addEventListener('input', (e) => {
    state.title = e.target.value;
    queueRender();
  });
  $('taglineInput').addEventListener('input', (e) => {
    state.tagline = e.target.value;
    queueRender();
  });
  $('outlineCheck').addEventListener('change', (e) => {
    state.outline = e.target.checked;
    queueRender();
  });
  $('zoomRange').addEventListener('input', (e) => {
    const slot = state.slots[state.selected];
    slot.zoom = Number(e.target.value) / 100;
    $('zoomLabel').textContent = `${e.target.value}%`;
    queueRender();
  });
  $('photoInput').addEventListener('change', (e) => {
    onFiles(e.target.files);
    e.target.value = '';
  });
  $('fillAllBtn').addEventListener('click', () => {
    const src = state.slots[state.selected];
    if (!src.img) {
      note('Load a photo into the selected panel first, then Fill all.');
      return;
    }
    state.slots = state.slots.map(() => ({ ...src }));
    note('One photo now fills all four panels — each can still be cropped on its own.');
    queueRender();
  });
  $('clearBtn').addEventListener('click', () => {
    state.slots = [blankSlot(), blankSlot(), blankSlot(), blankSlot()];
    note('Panels cleared.');
    queueRender();
  });
  $('sampleBoulevardBtn').addEventListener('click', () => loadSampleIntoAll('samples/boulevard.jpg', 'boulevard.jpg'));
  $('samplePierBtn').addEventListener('click', () => loadSampleIntoAll('samples/pier.jpg', 'pier.jpg'));
  $('exportBtn').addEventListener('click', exportCover);

  const dz = $('dropZone');
  ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => {
    e.preventDefault();
    dz.classList.add('over');
  }));
  ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => {
    e.preventDefault();
    dz.classList.remove('over');
  }));
  dz.addEventListener('drop', (e) => onFiles(e.dataTransfer.files));

  // The display fonts are local files; wait for them so the first preview
  // already shows the real lettering, then keep rendering live.
  Promise.all([
    document.fonts.load('100px Anton'),
    document.fonts.load('100px "Archivo Black"'),
  ]).catch(() => {}).finally(() => queueRender());
  queueRender();
  note('Drop a photo on the cover, or try a sample below.');
}

boot();
