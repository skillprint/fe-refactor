// How to play: a handful of scripted mobiles, each teaching one idea by
// doing it. Pure data and arithmetic (no three.js, no DOM); main.js drives it.
//
// Each lesson has a mobile (or reuses the last one), a line to say, the
// weight to point at, a test for done, and `why`, which turns a wrong move
// into a short lesson with the arithmetic in it. Nothing here scores or
// penalises anything.

const beam = (id, reach, parent = null, hook = null) => ({ id, depth: parent == null ? 0 : 1, parent, hook, reach, kids: [] });
const weight = (id, w, b, d, loose, look) => ({ id, w, beam: b, d, loose, look });

// The same paint and outline for the same weight from one lesson to the next.
const FOUR = { paint: 1, kind: 'disc' };
const SIX = { paint: 0, kind: 'drop' };
const THREE = { paint: 2, kind: 'half' };
const RIVET = { paint: 3, kind: 'tri' };

function mobile(beams, weights) {
  for (const b of beams) if (b.parent != null) beams[b.parent].kids.push(b.id);
  return { rung: 0, maxWeight: 9, seed: 7, beams, weights };
}

const at = (p, b, d) => Boolean(p) && p.beam === b && p.d === d;

export const LESSONS = [
  {
    name: 'weigh',
    puzzle: () => mobile([beam(0, 3)], [
      weight(0, 4, 0, -3, false, FOUR),
      weight(1, 6, 0, 2, true, SIX),
      weight(2, 3, 0, 1, true, THREE),
    ]),
    hint: 2,
    point: 1,
    text: 'Each beam pivots at its middle, and <b>weight × distance</b> must match on both sides. The left is <b>4 × 3 = 12</b>. Hang the <b>6</b> so the beam rests level: drag it onto a hook, or tap it and then tap a hook.',
    done: (place) => at(place[1], 0, 2),
    praise: 'Level: <b>6 × 2 = 12</b>, the same as 4 × 3.',
    why(moved) {
      if (moved.id === 2) return { text: 'That’s the 3; it comes next. Start with the <b>6</b>.', back: true };
      const d = moved.at.d;
      if (d < 0) return { text: 'That hangs the 6 on the left with the 4, so the left gets heavier still. It belongs on the <b>right</b>.' };
      const x = 6 * d;
      return { text: `<b>6 × ${d} = ${x}</b>, but the left is 4 × 3 = 12. Try a ${x > 12 ? 'closer' : 'farther'} hook.` };
    },
  },
  {
    name: 'add',
    puzzle: () => mobile([beam(0, 3)], [
      weight(0, 4, 0, -3, false, FOUR),
      weight(1, 6, 0, 2, false, SIX),
      weight(2, 3, 0, -1, false, RIVET),
      weight(3, 3, 0, 1, true, THREE),
    ]),
    fly: [2],
    hint: 2,
    point: 3,
    text: 'A 3 is now riveted at 1 on the left, so the left is <b>4 × 3 + 3 × 1 = 15</b> and the right only <b>6 × 2 = 12</b>. Hang the other <b>3</b> to make the right 15 too.',
    done: (place) => at(place[3], 0, 1),
    praise: 'Level: <b>12 + 3 × 1 = 15</b> on both sides.',
    why(moved) {
      const d = moved.at.d;
      if (d < 0) return { text: 'That adds to the left, which is already the heavier side. The 3 goes on the <b>right</b>.' };
      const x = 3 * d;
      return { text: `<b>3 × ${d} = ${x}</b> makes the right 12 + ${x} = ${12 + x}, but the left is 15. Try a closer hook.` };
    },
  },
  {
    name: 'sum',
    puzzle: () => mobile([beam(0, 3), beam(1, 2, 0, 2)], [
      weight(0, 2, 1, -1, false, RIVET),
      weight(1, 2, 1, 1, false, THREE),
      weight(2, 4, 0, -2, true, FOUR),
    ]),
    hint: 1,
    point: 2,
    text: 'A beam hanging from a hook weighs <b>everything below it</b>: 2 + 2 = 4, the Σ on its wire. It hangs at 2, so the top beam’s right is <b>4 × 2 = 8</b>. Hang the <b>4</b> so the top beam balances it.',
    done: (place) => at(place[2], 0, -2),
    praise: 'Balanced: <b>4 × 2 = 8</b> against Σ 4 × 2 = 8.',
    why(moved) {
      if (moved.at.beam === 1) return { text: 'On the hanging beam, the 4 tips it, and makes it weigh Σ 8. Put the 4 on the <b>top</b> beam.' };
      const d = moved.at.d;
      if (d > 0) return { text: 'That’s the side the hanging beam is on, so the right gets heavier. The 4 goes on the <b>left</b>.' };
      const x = 4 * -d;
      return { text: `<b>4 × ${-d} = ${x}</b>, but the right is Σ 4 × 2 = 8. Try a ${x > 8 ? 'closer' : 'farther'} hook.` };
    },
  },
  {
    // Only when the game is running with held mobiles (liveTilt off).
    name: 'release',
    reuse: true,
    held: true,
    hint: 1,
    point: 'release',
    text: 'Sometimes the mobile is <b>held level</b> until you let go, so you work it out first. This one balances: press <b>Release</b> (Space).',
    done: () => false, // finished by a successful release
    praise: 'It stays level. Well judged.',
  },
  {
    name: 'takeback',
    reuse: true,
    hint: 1,
    point: 2,
    text: 'In the real thing, hang <b>every</b> loose weight before the candle burns down. Changed your mind? <b>Tap a hung weight</b> to take it back: try it on the 4.',
    done: (place) => !place[2],
    praise: 'That’s everything. The first mobile is coming down.',
    why: () => null,
  },
];

/** The lessons to run: the held one only for a game played with held mobiles. */
export const lessonsFor = (liveTilt) => LESSONS.filter((l) => l.name !== 'release' || !liveTilt);

