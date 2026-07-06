// Deterministic "randomness" keyed off a class's id, so the same class
// always renders the same poster (no flicker on re-render / refetch) while
// different classes land on different palettes, frame offsets, and scatter
// patterns without needing per-class design work or an image generator.

function hashToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// mulberry32 — small, fast, deterministic PRNG
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

export const PALETTES = [
  { name: 'ink-gold',       bg: '#f6f5f3', panel: '#0a0a0a', accent: '#b8975a', light: '#e8e5e0', text: '#0a0a0a' },
  { name: 'charcoal-terracotta', bg: '#f6f5f3', panel: '#2b2420', accent: '#c1633f', light: '#e8ded4', text: '#0a0a0a' },
  { name: 'ink-sage',       bg: '#f6f5f3', panel: '#111612', accent: '#7c8b6f', light: '#dfe3da', text: '#0a0a0a' },
];

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

  const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
  const frameOffset = 12 + Math.floor(rng() * 16); // 12-28
  const frameRotation = Math.round((rng() * 3 - 1.5) * 10) / 10; // -1.5 to 1.5 deg

  const dotCount = 14 + Math.floor(rng() * 10); // 14-23
  const dots = Array.from({ length: dotCount }, () => ({
    x: rng(),
    y: rng(),
    r: 1.5 + rng() * 3,
    accent: rng() < 0.5,
  }));

  const swoosh1 = rng() < 0.5;
  const swoosh2 = rng() < 0.5;

  return { palette, frameOffset, frameRotation, dots, swoosh1, swoosh2 };
}
