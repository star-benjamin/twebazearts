// Deterministic "randomness" keyed off a class's id — see previous version's
// notes. This revision expands what actually varies: frame style, texture
// type, badge shape, panel corners, and title layout all now come from the
// seed, not just dot scatter positions.

function hashToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export const PALETTES = [
  { name: 'ink-gold',            bg: '#f6f5f3', panel: '#0a0a0a', accent: '#b8975a', light: '#e8e5e0', text: '#0a0a0a' },
  { name: 'charcoal-terracotta', bg: '#f6f5f3', panel: '#2b2420', accent: '#c1633f', light: '#e8ded4', text: '#0a0a0a' },
  { name: 'ink-sage',            bg: '#f6f5f3', panel: '#111612', accent: '#7c8b6f', light: '#dfe3da', text: '#0a0a0a' },
  { name: 'clay-cream',          bg: '#faf6ef', panel: '#4a3527', accent: '#d9a441', light: '#f0e6d2', text: '#2b1e14' },
  { name: 'plum-blush',          bg: '#f7f3f3', panel: '#2e1f28', accent: '#c98a9c', light: '#efe2e6', text: '#1c1015' },
];

export const FRAME_STYLES = ['double-offset', 'single-thick', 'corner-brackets'];
export const TEXTURE_STYLES = ['scatter-dots', 'diagonal-lines', 'brush-swoosh'];
export const BADGE_SHAPES = ['square', 'circle', 'ribbon'];
export const TITLE_LAYOUTS = ['below-panel', 'overlay-panel'];

// Splits a course title into a bold main line + a script accent line. Falls
// back to the instructor's first name as the accent when the title is a
// single word, so the layout always has something for the flourish.
export function splitTitle(title, instructor) {
  const words = (title || '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return { main: words[0], accent: words.slice(1).join(' ') };
  }
  const firstName = (instructor || '').trim().split(/\s+/)[0];
  return { main: words[0] || 'Class', accent: firstName || null };
}

export function generatePosterVariant(seedString) {
  const rng = mulberry32(hashToSeed(seedString || 'default'));

  const palette = pick(rng, PALETTES);
  const frameStyle = pick(rng, FRAME_STYLES);
  const textureStyle = pick(rng, TEXTURE_STYLES);
  const badgeShape = pick(rng, BADGE_SHAPES);
  const titleLayout = pick(rng, TITLE_LAYOUTS);
  const panelCorner = rng() < 0.35 ? 16 : 0; // occasional soft-rounded panel

  const frameOffset = 12 + Math.floor(rng() * 16); // 12-28
  const frameRotation = Math.round((rng() * 3 - 1.5) * 10) / 10; // -1.5 to 1.5 deg

  const dotCount = 14 + Math.floor(rng() * 10);
  const dots = Array.from({ length: dotCount }, () => ({
    x: rng(), y: rng(), r: 1.5 + rng() * 3, accent: rng() < 0.5,
  }));

  const lineCount = 5 + Math.floor(rng() * 5);
  const diagonalLines = Array.from({ length: lineCount }, () => ({
    offset: rng(), accent: rng() < 0.5,
  }));

  // Two brush-like swoosh curves, each with randomized control points so the
  // curve shape itself differs between classes, not just its presence.
  const swooshes = [0, 1].map(() => ({
    y1: 0.3 + rng() * 0.15,
    y2: 0.3 + rng() * 0.15,
    cy: 0.25 + rng() * 0.35,
    accent: rng() < 0.5,
  }));

  return {
    palette, frameStyle, textureStyle, badgeShape, titleLayout, panelCorner,
    frameOffset, frameRotation, dots, diagonalLines, swooshes,
  };
}
