// shots.js — named cover presets ("looks") the editor offers as one-click
// starting points, and the metadata for the screenshots this repo ships.
// A preset only sets text, grade and size; photos always come from the user
// (or the bundled samples) so every cover stays the maker's own.

export const LOOKS = [
  {
    id: 'sunset-drive',
    label: 'Sunset Drive',
    title: 'VICE CITY',
    tagline: 'One last ride down Ocean Drive',
    gradeId: 'sunset',
    sizeId: 'square',
    titleColor: '#ffffff',
  },
  {
    id: 'neon-nights',
    label: 'Neon Nights',
    title: 'NEON HEAT',
    tagline: 'The city never sleeps. Neither do we.',
    gradeId: 'neon',
    sizeId: 'portrait',
    titleColor: '#ffe95e',
  },
  {
    id: 'palm-noir',
    label: 'Palm Noir',
    title: 'PALM NOIR',
    tagline: 'Every sunset hides a story',
    gradeId: 'noir',
    sizeId: 'wide',
    titleColor: '#ffffff',
  },
];

export function lookById(id) {
  return LOOKS.find((l) => l.id === id) || LOOKS[0];
}

// What the screenshots/ folder is meant to show, in file order. The
// screenshot tooling in /tmp (not part of the app) follows this list.
export const SHOT_LIST = [
  { file: '1-cover.jpg', kind: 'export', sizeId: 'wide', lookId: 'neon-nights', note: 'Exported 1920x1080 cover, scaled to 1280x720' },
  { file: '2-editor.jpg', kind: 'editor', sizeId: 'square', lookId: 'sunset-drive', note: 'Editor with a sample photo loaded in the panels' },
  { file: '3-cover.jpg', kind: 'export', sizeId: 'square', lookId: 'sunset-drive', note: 'Exported 1080x1080 cover, scaled to 1024x1024' },
];
