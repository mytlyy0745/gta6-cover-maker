// Fixed scenes for screenshots: ?shot=editor shows the page with photos in
// all three panels; ?shot=cover shows the cover alone. `photo` picks the hero
// sample, `caption`/`sub`/`grade`/`size` set the rest. window.__shotReady is
// set once the cover is painted with the Anton font loaded.
export async function runShot(shot, query, api) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'pier';
  const other = photo === 'pier' ? 'boulevard' : 'pier';
  await api.loadSamples(
    [[0, photo], [1, other], [2, photo]],
    query.get('caption') ?? 'Sunset Heist',
    query.get('sub') ?? 'VICE CITY · ONE LAST SCORE',
    query.get('grade') ?? 'sunset',
    query.get('size') ?? '1080x1080',
  );
  try { await document.fonts.load('100px Anton'); } catch { /* fall back to sans-serif */ }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
