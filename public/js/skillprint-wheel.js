/* Standalone copy of the SKILLPRINT WHEEL section of skillprint.js, so a page
   can draw the wheel without loading the whole legacy bundle (whose page-level
   controllers would otherwise run against React-owned markup). Keep in sync
   with the section between the START/END markers in skillprint.js. */
/* === SKILLPRINT WHEEL: START === */
/* Builds the Human x Game ontology map. Only runs where the wheel exists; the
   surface toggle is handled by the shared theme controller above.

   WHAT THIS IS, because it constrains every line below.

   Skillprint rates ~700 games on a fixed vocabulary of features. Correlating
   those ratings across the corpus gives a distance between every pair of
   features; hierarchical clustering turns those distances into a tree; the tree
   is wrapped around a circle. So the picture is a measurement, not a diagram:

     RADIUS IS DISTANCE. Two terms whose elbow joins near the rim co-occur
     strongly across real games. Two that only meet near the centre barely
     relate. The heights in LINKAGE are the real merge heights, rescaled to
     0-1 against the root, and nothing may round them off or re-space them.

   An earlier version of this page laid the same vocabulary out as seven
   semantic branches - Genre, Cognition, Traits and so on. It read well and it
   silently discarded the correlations, which are the only reason the ontology
   is worth anything. The six clusters below are the k=6 cut of the real tree
   and they deliberately CROSS-CUT Skillprint's own feature categories: a mood,
   a genre and a cognitive skill landing in one cluster is the finding. Do not
   "tidy" a cluster by regrouping it semantically.

   Skillprint's own category for each term is kept as a facet on the leaf and
   shown beside the cluster in the tooltip, so both readings survive.

   WHAT THE INK MEANS. The tree above is fixed - it is the same for everybody,
   and it is what makes the drawing comparable at all. What varies from person
   to person is only OPACITY: a line at 100 is fully opaque, a line at 0 is
   fully transparent, and everything between scales linearly. Every line is
   white, so opacity is the only variable in the drawing and two prints can be
   read against each other by eye. Nothing in here may encode a score as colour,
   width or radius - the moment a second channel carries the value, the two
   prints stop being comparable.

   Opacity is therefore never used for emphasis. Hover thickens a line and
   brightens its label; it does not brighten the line, because that would
   overwrite the one number the drawing exists to show. */
(() => {
  /* The prototype guards on its page class. On the marketing site the same
     component is one section of a longer page, so the guard is the container
     itself: it carries .ontology-root, which is also what the re-scoped
     stylesheet rules match. */
  const page = document.querySelector('.page--ontology-wheel, .ontology-root');
  if (!page) return;

  /* --------------------------------------------------------------------------
     The reconstructed tree. Generated from the source dendrogram, not authored:
     87 leaves in the plot's own leaf order, 86 merges, real heights.
     -------------------------------------------------------------------------- */

  const DATA = {
    startAngle: 93.052, step: 4.10345,
    explainer:
      "These six groups are a cut of the correlation tree, not a taxonomy: they cross-cut Skillprint’s own Skill, Mood, Goal and Genre categories, which is the finding.",
    clusters: [
      {key: "core", size: 70, name: "General play",
       description: "The dense middle of the vocabulary: 70 features that co-occur across most of the rated corpus rather than marking out one kind of game."},
      {key: "puzzle", size: 7, name: "Quiet reasoning",
       description: "Puzzle play and the unhurried thinking that travels with it - a mood, a trait, a genre, three skills and a goal in one group."},
      {key: "reflex", size: 5, name: "Reflex play",
       description: "Short-session arcade play and the sustained attention and timing it demands."},
      {key: "rewards", size: 2, name: "Progress systems",
       description: "Achievements and customization move together: the collect-and-personalise loop."},
      {key: "openplay", size: 2, name: "No-pressure rules",
       description: "Unlimited time and unlimited tries - games that take failure pressure off the table."},
      {key: "levels", size: 1, name: "Level structure",
       description: "A singleton. Level-based structure correlates with nothing else strongly enough to join a cluster."},
    ],
    terms: [
      "Relax", "Creativity", "Puzzle", "Visualization", "Logic", "Deduction", "Solve", "Achievements",
      "Customization", "Multiple levels", "Unlimited time", "Unlimited tries", "Daily login rewards",
      "Friend invites", "Leaderboards", "Events", "Competitive", "Multiplayer", "Obtain", "Grit",
      /* Title Case on the three that overlap the skill taxonomy - Perceptual
         Speed, Pattern Matching, Task Switching - because PORTAL_SKILLS spells
         them that way and both spellings render inside one viewport on
         Profile: the wheel said "Perceptual speed" while the chips beside it
         said "Perceptual Speed", which reads as two taxonomies rather than
         one. Indices are untouched; only the casing moves. */
      "Remove", "Fighting", "Action", "Perceptual Speed", "Collaborate", "Chat", "Lucky spin/scratch",
      "Guilds/clans", "Awe", "Social assists", "Sports", "Card", "Trading card game", "Idle",
      "Hidden object", "Find", "Memory", "Kids", "Merge", "Bullet hell", "Action (skill)", "Racing",
      "Spatial", "Sandbox", "MMO", "Math", "Board", "Psychological", "Local multiplayer", "AR",
      "Relaxing", "Verbal", "Knowledge", "Word", "Party", "Synchronize", "Attention", "Avoid",
      "Survival", "Tournaments", "Shooter", "Action-adventure", "RPG", "Empathy", "Lifestyle",
      "Choose", "Auto battle", "Missions", "Indie", "Curiosity", "Adventure", "Pattern Matching",
      "Match-3", "Configure", "Joy", "Clicker", "Task Switching", "Optimize", "Simulation", "Create",
      "Planning", "Strategy", "Arcade", "Hyper-casual", "Focus", "Timing", "Reach",
    ],
    facet: [
      "Mood", "Trait", "Genre", "Skill", "Skill", "Skill", "Goal", "Mechanic", "Mechanic", "Mechanic",
      "Mechanic", "Mechanic", "Mechanic", "Social", "Social", "Mechanic", "Social", "Social",
      "Goal", "Trait", "Goal", "Genre", "Genre", "Skill", "Goal", "Social", "Mechanic", "Social",
      "Mood", "Social", "Genre", "Genre", "Genre", "Genre", "Genre", "Goal", "Skill", "Genre",
      "Genre", "Genre", "Skill", "Genre", "Skill", "Genre", "Genre", "Skill", "Genre", "Genre",
      "Social", "Mechanic", "Genre", "Skill", "Skill", "Genre", "Genre", "Goal", "Skill", "Goal",
      "Genre", "Social", "Genre", "Genre", "Genre", "Trait", "Genre", "Goal", "Mechanic", "Mechanic",
      "Genre", "Trait", "Genre", "Skill", "Genre", "Goal", "Mood", "Genre", "Skill", "Goal",
      "Genre", "Goal", "Skill", "Genre", "Genre", "Genre", "Mood", "Skill", "Goal",
    ],
    leafCluster: [
      "puzzle", "puzzle", "puzzle", "puzzle", "puzzle", "puzzle", "puzzle", "rewards", "rewards",
      "levels", "openplay", "openplay", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "reflex", "reflex", "reflex",
      "reflex", "reflex",
    ],
    linkage: [
      [5, 6, 0.38297],
      [4, 87, 0.45019],
      [3, 88, 0.59776],
      [2, 89, 0.62822],
      [1, 90, 0.70426],
      [0, 91, 0.7916],
      [7, 8, 0.65523],
      [10, 11, 0.65115],
      [9, 94, 0.79498],
      [93, 95, 0.82622],
      [13, 14, 0.56569],
      [16, 17, 0.383],
      [15, 98, 0.58196],
      [97, 99, 0.64291],
      [12, 100, 0.68702],
      [19, 20, 0.61321],
      [18, 102, 0.64293],
      [21, 22, 0.43207],
      [24, 25, 0.38991],
      [28, 29, 0.35027],
      [27, 106, 0.38302],
      [31, 32, 0.21914],
      [34, 35, 0.18625],
      [40, 41, 0.17894],
      [45, 46, 0.17135],
      [49, 50, 0.17132],
      [48, 112, 0.17895],
      [47, 113, 0.17894],
      [111, 114, 0.18627],
      [44, 115, 0.20008],
      [43, 116, 0.21299],
      [42, 117, 0.21915],
      [110, 118, 0.23671],
      [39, 119, 0.24228],
      [38, 120, 0.24772],
      [37, 121, 0.25303],
      [36, 122, 0.27331],
      [109, 123, 0.28291],
      [52, 53, 0.08951],
      [51, 125, 0.15498],
      [54, 55, 0.25826],
      [126, 127, 0.29218],
      [124, 128, 0.32255],
      [33, 129, 0.33473],
      [108, 130, 0.35408],
      [30, 131, 0.38302],
      [107, 132, 0.40336],
      [26, 133, 0.42273],
      [105, 134, 0.45022],
      [59, 60, 0.31838],
      [58, 136, 0.38302],
      [57, 137, 0.40666],
      [56, 138, 0.46481],
      [135, 139, 0.47615],
      [23, 140, 0.51385],
      [104, 141, 0.53917],
      [61, 62, 0.42587],
      [64, 65, 0.36517],
      [63, 144, 0.41636],
      [66, 67, 0.48992],
      [145, 146, 0.519],
      [143, 147, 0.57274],
      [142, 148, 0.58656],
      [69, 70, 0.49534],
      [68, 150, 0.51383],
      [72, 73, 0.33867],
      [71, 152, 0.45316],
      [74, 75, 0.5086],
      [153, 154, 0.55136],
      [151, 155, 0.58425],
      [76, 77, 0.6],
      [156, 157, 0.63245],
      [149, 158, 0.64501],
      [103, 159, 0.71184],
      [101, 160, 0.72666],
      [78, 79, 0.5465],
      [80, 81, 0.63874],
      [162, 163, 0.75188],
      [161, 164, 0.77117],
      [82, 83, 0.57037],
      [85, 86, 0.58194],
      [84, 167, 0.6593],
      [166, 168, 0.79161],
      [165, 169, 0.88694],
      [96, 170, 0.96195],
      [92, 171, 1.0],
    ],
    linkCluster: [
      "puzzle", "puzzle", "puzzle", "puzzle", "puzzle", "puzzle", "rewards", "openplay", null,
      null, "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "core", "core", "core", "core", "core", "core", "core", "core",
      "core", "core", "core", "reflex", "reflex", "reflex", "reflex", null, null, null,
    ],
  };

  /* --------------------------------------------------------------------------
     The people.

     Two worked examples, frozen as literal arrays in DATA.terms order. They are
     illustrative, not measured: generated once by scoring every feature on its
     cophenetic distance from a handful of anchor skills, then frozen here so the
     page has no model in it. Real integration replaces PEOPLE with scored
     profiles from the API and nothing else on this page changes.

     They are deliberately opposed. Ada peaks in the quiet-reasoning arc and goes
     faint across the social and reflex runs; Kai does the reverse. Mean absolute
     difference between the two is 28 points across 87 skills, which is what
     makes the two drawings read as two different people rather than two renders
     of the same one.

     `role` describes what the drawing shows and nothing more. It is NOT an
     archetype: Skillprint assigns no such label, and a phrase in this slot that
     sounded like a class - "Reasoning profile" was the first attempt - reads as
     a model output to anyone who does not already know the data is invented.
     Each one names the group it is actually highest in, which is checkable
     against the scores below: Ada's top cluster is Quiet reasoning at 81%, Kai's
     is Reflex play at 88% with Social his strongest category at 80%. If an
     archetype taxonomy ever does exist, it belongs here as its own field
     alongside the scores, not as free text in a heading.
     -------------------------------------------------------------------------- */

  const PEOPLE = [
    {
      key: "ada",
      name: "Ada",
      role: "Strong in quiet reasoning",
      note: "Deduction, structure and language carry this print. The social and reflex runs stay faint.",
      scores: [
        62, 68, 74, 76, 97, 93, 96, 8, 24, 33, 27, 30,
        47, 47, 37, 43, 14, 29, 49, 44, 44, 45, 37, 51,
        58, 60, 65, 64, 68, 66, 64, 65, 62, 67, 67, 72,
        88, 74, 74, 69, 68, 75, 66, 73, 71, 79, 80, 75,
        71, 72, 66, 85, 85, 97, 70, 75, 62, 56, 57, 61,
        58, 48, 55, 51, 47, 52, 54, 58, 56, 52, 48, 51,
        51, 50, 55, 50, 50, 82, 49, 45, 90, 97, 35, 29,
        22, 9, 20,
      ],
    },
    {
      key: "kai",
      name: "Kai",
      role: "Strong in reflex and social",
      note: "Timing, competition and company carry this print. The quiet-reasoning arc all but disappears.",
      scores: [
        21, 11, 12, 14, 6, 5, 5, 90, 66, 48, 50, 52,
        55, 78, 84, 76, 97, 88, 46, 50, 50, 76, 95, 79,
        72, 74, 49, 73, 50, 74, 68, 44, 45, 45, 51, 52,
        34, 46, 49, 71, 80, 72, 52, 45, 66, 44, 43, 47,
        69, 50, 41, 44, 43, 33, 63, 70, 74, 72, 68, 81,
        73, 51, 52, 51, 56, 49, 51, 49, 53, 55, 47, 48,
        54, 50, 48, 47, 66, 47, 47, 46, 42, 12, 88, 79,
        94, 97, 84,
      ],
    },
  ];

  /* --------------------------------------------------------------------------
     Geometry. A square viewBox for the disc, plus a band underneath for the key.
     The key lives inside the drawing rather than beside it so that the exported
     image explains itself: a Skillprint dropped into a deck arrives with its own
     legend attached and needs no caption.

     Radius is still a linear function of merge height - the tree is unchanged.
     What the reader is now asked to read is the ink, not the radius.
     -------------------------------------------------------------------------- */

  const NS = 'http://www.w3.org/2000/svg';
  const SIZE = 1000;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_LEAF = 330;   /* height 0: where the terms hang        */
  const R_ROOT = 92;    /* height 1: the last merge, at the root */
  const R_LABEL = 342;
  const LABEL_BOX = 176;   /* the term plus its figure, for the pointer target */

  const KEY_TOP = SIZE;         /* the key band starts where the disc ends */
  const VIEW_H = 1084;          /* disc, plus just enough band for the key */

  /* Score is drawn twice, on two channels that agree: a line at 0 is fully
     transparent and 1px, a line at 100 is fully opaque and 4px, and both scale
     linearly in between. Redundant encoding on purpose - the faint end of a
     pure-opacity scale is exactly where a reader loses the line, and the extra
     weight there is what keeps it findable.

     These two are the only place the range is stated. The key under the disc
     scales itself from them, so widening the range here widens the wedge to
     match and the drawing cannot drift out of step with its own legend. */
  const LINE_MIN = 1;
  const LINE_MAX = 4;
  /* The blank dial carries no score, so it gets one weight for every line - the
     midpoint of the range, which reads as the map at rest rather than as a
     person who happens to be average at everything. */
  const PLAIN_LINE_W = 2;

  /* The dial with nobody on it. Not a person, so it lives outside PEOPLE: it has
     no scores, no rank, no strongest skill, and nothing about it varies. The
     name and role here are the export's header - the centre of the disc is
     branded with the mark and the word instead. */
  const BASE = {
    key: 'base', file: 'dial',
    name: 'The Skillprint wheel',
    role: '87 features · six correlation groups',
  };
  const widthFor = value => LINE_MIN + (LINE_MAX - LINE_MIN) * (value / 100);

  const INK = '#FFFFFF';

  const N = DATA.terms.length;
  const MERGES = DATA.linkage.length;

  const fixed = value => Number(value.toFixed(2));
  const radiusFor = height => R_LEAF - (R_LEAF - R_ROOT) * height;

  function polar(radius, degrees) {
    const angle = (degrees - 90) * Math.PI / 180;
    return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)];
  }

  /* Children are always ordered by leaf index and the tree's leaf order never
     wraps past the seam, so an elbow's arc always runs in the increasing
     direction and only needs the large-arc flag. */
  function arcPath(radius, from, to) {
    const [x0, y0] = polar(radius, from);
    const [x1, y1] = polar(radius, to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${fixed(x0)} ${fixed(y0)} A ${fixed(radius)} ${fixed(radius)} 0 ${large} 1 ${fixed(x1)} ${fixed(y1)}`;
  }

  function stemPath(angle, from, to) {
    const [x0, y0] = polar(from, angle);
    const [x1, y1] = polar(to, angle);
    return `M ${fixed(x0)} ${fixed(y0)} L ${fixed(x1)} ${fixed(y1)}`;
  }

  /* ---- The tree, laid out once and shared by every print ------------------- */

  const angleOf = new Array(N + MERGES);
  const heightOf = new Array(N + MERGES);
  const parentOf = new Array(N + MERGES).fill(-1);
  const sizeOf = new Array(N + MERGES).fill(1);

  for (let i = 0; i < N; i++) {
    angleOf[i] = DATA.startAngle + i * DATA.step;
    heightOf[i] = 0;
  }
  DATA.linkage.forEach(([a, b, height], index) => {
    const id = N + index;
    angleOf[id] = (angleOf[a] + angleOf[b]) / 2;
    heightOf[id] = height;
    parentOf[a] = id;
    parentOf[b] = id;
    sizeOf[id] = sizeOf[a] + sizeOf[b];
  });

  /* A leaf's line carries that person's score for that skill. An inner line is
     shared by everything above it, so it carries the mean of the scores beneath
     it - which is why a strong region of the tree stays bright for several rings
     inward and a weak one fades early. Max would light the whole spine from one
     good score; the mean is the honest aggregate and is what makes the inner
     rings differ between two people at all. */
  function inkOf(scores) {
    const total = new Array(N + MERGES).fill(0);
    for (let i = 0; i < N; i++) total[i] = scores[i];
    DATA.linkage.forEach(([a, b], index) => {
      const id = N + index;
      total[id] = total[a] * sizeOf[a] + total[b] * sizeOf[b];
      total[id] /= sizeOf[id];
    });
    return total;
  }

  function clusterOf(key) { return DATA.clusters.find(entry => entry.key === key) || null; }

  /* 1st, 2nd, 3rd, 4th - and 11th/12th/13th, which is the case a bare lookup on
     the last digit gets wrong. */
  function ordinal(n) {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) return `${n}th`;
    return n + ({1: 'st', 2: 'nd', 3: 'rd'}[n % 10] || 'th');
  }

  /* ---- Fonts for the exported image --------------------------------------- */

  /* The rasteriser draws the serialised SVG in isolation: it cannot reach the
     page's stylesheet or its @font-face rules, so an export that does not carry
     its own fonts silently comes out in Times. Both faces are fetched once,
     base64'd in chunks - a single String.fromCharCode.apply over a 170KB buffer
     overflows the argument stack - and cached for the life of the page. */
  let fontsPromise = null;

  function embeddedFonts() {
    if (fontsPromise) return fontsPromise;
    const encode = buffer => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
      }
      return btoa(binary);
    };
    const load = path => fetch(path).then(r => {
      if (!r.ok) throw new Error(path);
      return r.arrayBuffer();
    }).then(encode);
    fontsPromise = Promise.all([
      /* '../' matters: every portal screen lives in skillprint-portal/, so a document-relative
         path here resolved to skillprint-portal/assets/fonts/... and 404'd. The failure is
         swallowed by the .catch below, so the PNG export silently came out in a fallback face
         instead of Geist rather than reporting anything. */
      load('../assets/fonts/geist/Geist-Variable.ttf'),
      load('../assets/fonts/geist-mono/GeistMono-Variable.ttf'),
    ]).then(([ui, mono]) => `
      @font-face{font-family:"SP UI";src:url(data:font/ttf;base64,${ui}) format("truetype");font-weight:100 900}
      @font-face{font-family:"SP Mono";src:url(data:font/ttf;base64,${mono}) format("truetype");font-weight:100 900}
    `).catch(() => '');
    return fontsPromise;
  }

  /* ---- The mark for the exported image ------------------------------------- */

  /* Read out of the page, not fetched.

     This was a fetch of the logo file named by the nav's own <img>, which worked
     everywhere it was tested and failed for real: fetch() is blocked outright
     for file:// documents in some browsers, so anyone opening the page from
     Finder got the word "Skillprint" set in type - the fallback - and no mark.
     The failure was invisible because the fallback looks deliberate.

     So the mark is inlined in the markup at 0x0, next to the icon sprite, and
     read straight off the DOM. No network, no promise that can reject, and it
     works from a file:// page. Each page carries its own variant, so the
     prototype's violet mark and the site's green one both come out right without
     this file knowing either filename.

     It goes into the export as a nested <svg> rather than having its paths
     pasted in: a nested svg brings its own viewBox, so the mark cannot be
     distorted by the drawing's units. */
  function inlinedSvg(id) {
    const source = document.getElementById(id);
    if (!source) return null;
    const box = (source.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    if (box.length !== 4 || !box[2] || !box[3]) return null;
    return {
      inner: source.innerHTML,
      viewBox: source.getAttribute('viewBox'),
      ratio: box[2] / box[3],
    };
  }

  /* ---- One print ----------------------------------------------------------- */

  const tooltip = document.getElementById('tooltip');
  /* Where there is no hover there is no mouseenter, and the leaf readout was
     reachable by neither: `pointer-events: none` keeps the bubble out of the
     way of a mouse, its placement is `clientX + 14, clientY + 14` so on a phone
     it lands directly under the thumb, and at z-index 50 it sits under the
     topbar. 174 tap targets per print, and tapping one traced the arc and told
     the reader nothing about the term. Same condition the peek's sheet uses. */
  const COARSE = window.matchMedia('(hover: none)');

  function buildSkillprint(root) {
    /* Two things get drawn by this one function. A person's print, inked from
       their scores - and the blank dial, which is the same tree with nobody on
       it: one weight, one opacity, no figures, no key, because there is nothing
       to key. It exists to be the thing the prints below it are compared against,
       so it has to be the same drawing or the comparison is worthless. */
    const plain = root.dataset.skillprint === BASE.key;
    /* A print used as a still figure elsewhere on the site: same drawing, no key
       band and no pointer targets, so it sits in a page layout as artwork rather
       than as an instrument. Square, because the key band is what made it tall. */
    const compact = root.hasAttribute('data-sp-compact');
    const person = plain ? BASE : PEOPLE.find(entry => entry.key === root.dataset.skillprint);
    if (!person) return;

    const svg = root.querySelector('[data-sp-wheel]');
    if (!svg) return;

    const scores = person.scores;
    const ink = plain ? null : inkOf(scores);
    const opacityOf = id => (plain ? 1 : fixed(ink[id] / 100));
    const strokeOf = id => (plain ? PLAIN_LINE_W : fixed(widthFor(ink[id])));
    const linkOwner = new Array(N + MERGES).fill(null);
    const labelOf = new Array(N).fill(null);
    let lockedLeaf = null;
    let lockedCluster = null;
    /* The hit rect currently locked, so its aria-pressed can be cleared when
       the lock moves. The leaves are operable now (role=button), and a toggle
       that never reports its state is a control a screen reader cannot read. */
    let lockedHit = null;

    /* No key band on the blank dial, so it is square. */
    const viewH = (plain || compact) ? SIZE : VIEW_H;
    svg.setAttribute('viewBox', `0 0 ${SIZE} ${viewH}`);
    /* And the box has to agree with the drawing. `.skillprint__wheel` carries
       `aspect-ratio: 1000 / 1084`, which is the inked print's shape - so the
       square blank dial was laid out in a taller box and letterboxed: measured
       at 390 in ?state=first, 560 x 607 with 23.5px of dead band above and
       below. Stated per root rather than by changing the shared rule, because
       the shared rule is right for the print. The zoom controller below
       overwrites both of these together once it knows the real content box. */
    svg.style.aspectRatio = `${SIZE} / ${viewH}`;

    function el(name, attrs = {}, parent = svg) {
      const node = document.createElementNS(NS, name);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      parent.appendChild(node);
      return node;
    }

    /* ---- The distance axis ------------------------------------------------ */

    /* Quarters of the tree's full height, unlabelled. They used to carry a
       0-100% scale for the radius, which is a different quantity from the one
       every leaf now prints beside its own name - two percentages in one
       drawing, measuring different things, a hand-span apart. The rings stay as
       quiet scaffolding for judging where branches meet; the only number in the
       picture is the score. */
    const axis = el('g', {class: 'ontology-axis', 'aria-hidden': 'true'});
    [0.25, 0.5, 0.75, 1].forEach(fraction => {
      /* Class names are written as plain literals, never built with a ternary or
         a template string: the site stylesheet is generated by pruning every rule
         the markup cannot match, and that pruner reads literal `class:` values
         and classList calls out of this file. A computed class name is invisible
         to it and its rule is silently dropped from the marketing build. */
      const ring = el('circle', {
        cx: CX, cy: CY, r: fixed(radiusFor(fraction)), class: 'ring'
      }, axis);
      if (fraction === 1) ring.classList.add('ring--full');
    });

    /* ---- The tree --------------------------------------------------------- */

    /* Two channels, two jobs. COLOUR says which correlation group a line belongs
       to and is identical for every person - it is a property of the map, not of
       the reader. OPACITY says this person's score and is the only thing that
       changes between two prints. Neither may take the other's job.

       Colour stays data rather than markup: the group carries data-cluster and
       the stylesheet publishes --item for that key, so no hex appears in here.
       Opacity is a presentation attribute, because an exported image is
       serialised markup with no stylesheet attached and the score has to travel
       with the element. */
    const tree = el('g', {class: 'ontology-tree'});
    const groups = new Map();
    DATA.clusters.forEach(cluster => {
      groups.set(cluster.key, el('g', {'data-cluster': cluster.key, class: 'cluster-group'}, tree));
    });
    /* Above the six-cluster cut there is no group to belong to, so those links
       fall back to the neutral border tone. */
    const aboveCut = el('g', {class: 'cluster-group cluster-group--above-cut'}, tree);
    const groupFor = key => (key && groups.get(key)) || aboveCut;

    DATA.linkage.forEach(([a, b], index) => {
      const id = N + index;
      const radius = radiusFor(heightOf[id]);
      const target = groupFor(DATA.linkCluster[index]);
      const arc = el('path', {
        d: arcPath(radius, angleOf[a], angleOf[b]), class: 'link link--arc',
        'stroke-opacity': opacityOf(id), 'stroke-width': strokeOf(id)
      }, target);
      if (index === MERGES - 1) arc.classList.add('link--root');
      const stemA = el('path', {
        d: stemPath(angleOf[a], radiusFor(heightOf[a]), radius), class: 'link link--stem',
        'stroke-opacity': opacityOf(a), 'stroke-width': strokeOf(a)
      }, target);
      const stemB = el('path', {
        d: stemPath(angleOf[b], radiusFor(heightOf[b]), radius), class: 'link link--stem',
        'stroke-opacity': opacityOf(b), 'stroke-width': strokeOf(b)
      }, target);
      linkOwner[id] = [arc, stemA, stemB];
    });

    /* ---- The terms -------------------------------------------------------- */

    DATA.terms.forEach((term, index) => {
      const target = groupFor(DATA.leafCluster[index]);
      const angle = angleOf[index];
      const [x, y] = polar(R_LABEL, angle);
      const normalised = ((angle % 360) + 360) % 360;
      const rightSide = normalised < 180;
      const rotation = rightSide ? angle - 90 : angle + 90;
      const transform = `rotate(${fixed(rotation)} ${fixed(x)} ${fixed(y)})`;
      const band = DATA.step * Math.PI * R_LABEL / 180;

      const text = el('text', {
        x: fixed(x), y: fixed(y), transform,
        'text-anchor': rightSide ? 'start' : 'end',
        'dominant-baseline': 'middle',
        class: 'leaf-label'
      }, target);
      /* The figure always sits on the inside, against the disc, so all 87 of
         them line up on one radius and read as a ring of numbers instead of
         drifting in and out with the length of each term.

         Which span comes first is not cosmetic. Labels on the right are anchored
         at their start and run outward, so their FIRST glyph is the innermost;
         labels on the left are anchored at their end, so their LAST glyph is.
         Putting the figure first on the right and last on the left is what puts
         it nearest the centre on both sides.

         The gap is dx rather than a space in the text: SVG collapses and trims
         whitespace, so a padding space is at the mercy of where in the run it
         lands. Both spans go through el() as well, which is not a style
         preference - the site stylesheet is pruned against a scan of this file
         that reads `class:` in an attribute object, className and classList and
         nothing else, so a setAttribute('class', ...) here would be invisible to
         it and the rule for that class would be dropped from the marketing
         build. */
      if (plain) {
        el('tspan', {}, text).textContent = term;
      } else if (rightSide) {
        el('tspan', {class: 'leaf-value'}, text).textContent = `${scores[index]}%`;
        el('tspan', {dx: 5}, text).textContent = term;
      } else {
        el('tspan', {}, text).textContent = term;
        el('tspan', {class: 'leaf-value', dx: 5}, text).textContent = `${scores[index]}%`;
      }
      labelOf[index] = text;

      if (compact) return;

      const hit = el('rect', {
        x: fixed(rightSide ? x - 6 : x - LABEL_BOX + 6),
        y: fixed(y - band / 2),
        width: LABEL_BOX, height: fixed(band),
        transform, class: 'leaf-hit', tabindex: '0',
        /* role=button, not role=img. These 174 rects are tab stops that lock a
           leaf when clicked, so announcing them as images told a screen-reader
           reader they were looking at pictures and gave them nothing to press;
           Enter did nothing and Space - the key a reader reaches for - scrolled
           the page 860px instead, because nothing was handling it. */
        role: 'button', 'aria-pressed': 'false',
        'aria-label': leafDescription(index)
      }, target);

      const show = event => {
        readLeaf(index);
        if (event) showTooltip(event, index);
      };
      const hide = () => {
        if (lockedLeaf === null) clearLeaf();
        else readLeaf(lockedLeaf);
        hideTooltip();
      };
      hit.addEventListener('mouseenter', show);
      hit.addEventListener('mousemove', moveTooltip);
      hit.addEventListener('mouseleave', hide);
      hit.addEventListener('focus', () => show(null));
      hit.addEventListener('blur', hide);
      const toggleLock = () => {
        if (lockedHit && lockedHit !== hit) lockedHit.setAttribute('aria-pressed', 'false');
        lockedLeaf = lockedLeaf === index ? null : index;
        const on = lockedLeaf === index;
        hit.setAttribute('aria-pressed', String(on));
        lockedHit = on ? hit : null;
        if (lockedLeaf === null) clearLeaf(); else readLeaf(lockedLeaf);
      };
      hit.addEventListener('click', event => {
        event.stopPropagation();
        toggleLock();
        /* The tap IS the hover here. Locked shows the readout, unlocking hides
           it, so one control does both and a second tap on the same term puts
           the sheet away. Placed by the stylesheet rather than by moveTooltip -
           passing no event is what keeps it off the thumb. */
        if (COARSE.matches) {
          if (lockedLeaf === index) showTooltip(null, index);
          else hideTooltip();
        }
      });
      /* The keyboard half of the same control. Space has to be prevented or
         the page scrolls under the reader instead of locking the leaf - which
         is what it did, 860px at a time. An SVG <rect> gets none of this for
         free the way a <button> would. */
      hit.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
        event.preventDefault();
        event.stopPropagation();
        toggleLock();
      });
    });

    /* ---- The centre ------------------------------------------------------- */

    const centre = el('g', {class: 'ontology-centre', 'aria-hidden': 'true'});
    el('circle', {cx: CX, cy: CY, r: R_ROOT - 8, class: 'centre-disc'}, centre);

    if (plain) {
      /* The blank dial is branded rather than named: the mark, then the word.
         A person's print puts their own name here instead, which is the one
         difference a reader needs between "the dial" and "someone on it". */
      const icon = inlinedSvg('sp-brand-icon');
      const ICON = 34;
      if (icon) {
        const node = el('svg', {
          x: fixed(CX - ICON * icon.ratio / 2), y: fixed(CY - 34),
          width: fixed(ICON * icon.ratio), height: ICON, viewBox: icon.viewBox
        }, centre);
        node.innerHTML = icon.inner;
      }
      const word = el('text', {x: CX, y: CY + 22, 'text-anchor': 'middle', class: 'centre-title'}, centre);
      word.textContent = 'Skillprint';
    } else {
      const centreTitle = el('text', {x: CX, y: CY - 2, 'text-anchor': 'middle', class: 'centre-title'}, centre);
      centreTitle.textContent = person.name;
      const centreCopy = el('text', {x: CX, y: CY + 20, 'text-anchor': 'middle', class: 'centre-copy'}, centre);
      centreCopy.textContent = 'Skillprint';
    }

    /* ---- The key ---------------------------------------------------------- */

    /* One line, transparent at one end and solid at the other, drawn in the same
       ink as the disc above it. A single continuous ramp says "this is a scale"
       in a way six discrete swatches do not - and the left end being invisible
       is the lesson, so the 0% label carries it.

       The gradient id is suffixed with the person's key: two prints on one page
       means two <defs>, and a duplicated id would silently point both ramps at
       whichever one the document happened to parse first. */
    /* Nothing to key on the blank dial - one weight, one opacity, no scale. */
    const key = (plain || compact) ? null : el('g', {class: 'ontology-key', 'aria-hidden': 'true'});
    const rampId = `sp-ramp-${person.key}`;
    if (!plain && !compact) drawKey();

    function drawKey() {
    const RAMP_X1 = 380;
    const RAMP_X2 = 620;
    const RAMP_Y = KEY_TOP + 36;

    const defs = el('defs', {}, key);
    /* userSpaceOnUse, not the default objectBoundingBox. The ramp is a
       horizontal line, so its bounding box is zero pixels tall, and a gradient
       in bounding-box units is specified NOT to render when either dimension of
       that box is empty - the line simply disappears. Absolute coordinates side-
       step the empty box entirely. */
    const grad = el('linearGradient', {
      id: rampId, gradientUnits: 'userSpaceOnUse',
      x1: RAMP_X1, y1: RAMP_Y, x2: RAMP_X2, y2: RAMP_Y
    }, defs);
    el('stop', {offset: '0', 'stop-color': INK, 'stop-opacity': '0'}, grad);
    el('stop', {offset: '1', 'stop-color': INK, 'stop-opacity': '1'}, grad);

    /* A wedge, not a line, because the drawing says the score on two channels
       and the key has to show both: it thickens left to right in the same 1:4
       ratio the lines use, while the gradient takes it from clear to solid.
       Scaled up 3x so the ratio is legible at this size - the proportion is the
       honest part, not the absolute width, and the multiplier drops as the range
       widens so the band keeps the height it was tuned to rather than growing
       every time the lines get heavier.

       Both ends are semicircular caps rather than cut square, so the shape
       matches the round-capped lines it is describing. A fill cannot borrow
       stroke-linecap, so the caps are arcs in the path itself: radius is half
       the thickness at that end, and both sweep the same way because one runs
       down the right side and the other back up the left. */
    const T1 = LINE_MIN * 3;
    const T2 = LINE_MAX * 3;
    el('path', {
      class: 'key-ramp', fill: `url(#${rampId})`,
      d: `M ${RAMP_X1} ${RAMP_Y - T1 / 2} L ${RAMP_X2} ${RAMP_Y - T2 / 2} `
       + `A ${T2 / 2} ${T2 / 2} 0 0 1 ${RAMP_X2} ${RAMP_Y + T2 / 2} `
       + `L ${RAMP_X1} ${RAMP_Y + T1 / 2} `
       + `A ${T1 / 2} ${T1 / 2} 0 0 1 ${RAMP_X1} ${RAMP_Y - T1 / 2} Z`
    }, key);

    const zero = el('text', {
      x: RAMP_X1 - 14, y: RAMP_Y, 'text-anchor': 'end',
      'dominant-baseline': 'middle', class: 'key-value'
    }, key);
    zero.textContent = '0%';

    const full = el('text', {
      x: RAMP_X2 + 14, y: RAMP_Y, 'text-anchor': 'start',
      'dominant-baseline': 'middle', class: 'key-value'
    }, key);
    full.textContent = '100%';

    const keyFoot = el('text', {
      x: CX, y: KEY_TOP + 68, 'text-anchor': 'middle', class: 'key-foot'
    }, key);
    keyFoot.textContent = 'Thicker and more opaque, higher score';
    }

    /* ---- Reading a skill --------------------------------------------------- */

    function leafDescription(index) {
      const cluster = clusterOf(DATA.leafCluster[index]);
      const where = `${DATA.facet[index]} category, ${cluster ? cluster.name : 'unclustered'} group.`;
      if (plain) return `${DATA.terms[index]}. ${where}`;
      return `${DATA.terms[index]}: ${scores[index]}% for ${person.name}. ${where}`;
    }

    /* Hovering emphasises the line's width and its label, never its opacity:
       opacity is the reading, so a hover that brightened it would overwrite the
       one number the drawing exists to show. */
    function tracePath(index, on) {
      let node = index;
      while (parentOf[node] >= 0) {
        const owner = linkOwner[parentOf[node]];
        if (owner) owner.forEach(part => part.classList.toggle('is-path', on));
        node = parentOf[node];
      }
    }

    let traced = null;

    function readLeaf(index) {
      if (traced !== null && traced !== index) {
        tracePath(traced, false);
        if (labelOf[traced]) labelOf[traced].classList.remove('is-hovered');
      }
      traced = index;
      tracePath(index, true);
      if (labelOf[index]) labelOf[index].classList.add('is-hovered');
      /* The rank is the one thing the card can say that the label under the
         pointer and the tooltip beside it cannot: 74% means little until you
         know it is this person's ninth strongest of eighty-seven. Without it
         the card was a third copy of the same three facts. */
      const cluster = clusterOf(DATA.leafCluster[index]);
      const where = `${DATA.facet[index]} · ${cluster ? cluster.name : 'Unclustered'}`;
      if (plain) {
        /* No score on the dial, so the card reads the term and where it sits.
           The figure slot stays empty rather than showing a placeholder. */
        setReadout('term', DATA.terms[index], '', where, DATA.leafCluster[index]);
        return;
      }
      const rank = rankOf[index];
      setReadout('skill', DATA.terms[index], `${scores[index]}%`,
        `${where} · ${ordinal(rank)} of ${N}`, DATA.leafCluster[index]);
    }

    function clearLeaf() {
      if (traced !== null) {
        tracePath(traced, false);
        if (labelOf[traced]) labelOf[traced].classList.remove('is-hovered');
        traced = null;
      }
      /* Idle is the note on its own. The name is already on the card head, in
         the middle of the disc and on the export, and the average is already a
         tile in the panel above - so an idle readout that repeated both was
         three restatements holding a card open at full height for nothing. */
      setReadout('idle', '', '', plain ? DATA.explainer : person.note, null);
    }

    /* ---- Isolating one correlation group ----------------------------------- */

    /* Reading one group at a time is back, but it can no longer work the way it
       did. It used to dim the rest of the tree with opacity, and opacity now
       carries the score - so does width. Colour is the one channel left that
       says nothing about the reading, so isolation drains it: the chosen group
       keeps its accent, everything else falls to grey at exactly the same
       opacity and weight it had before. Nothing about any score moves. */
    function applyClusterState(key) {
      groups.forEach((node, clusterKey) => {
        node.classList.toggle('is-faded', key !== null && clusterKey !== key);
      });
      aboveCut.classList.toggle('is-faded', key !== null);
      svg.classList.toggle('is-isolated', key !== null);
      const host = strengthHost || clusterHost;
      if (host) {
        [...host.children].forEach(row => {
          row.classList.toggle('is-active', row.dataset.cluster === key);
          row.setAttribute('aria-pressed', String(lockedCluster === row.dataset.cluster));
        });
      }
    }

    function restoreClusterState() {
      applyClusterState(lockedCluster);
      if (plain) {
        const cluster = clusterOf(lockedCluster);
        if (cluster) setReadout('term', cluster.name, '', cluster.description, lockedCluster);
        else clearLeaf();
      }
    }

    const readCard = root.querySelector('[data-sp-read]');
    const readTitle = root.querySelector('[data-sp-read-title]');
    const readScore = root.querySelector('[data-sp-read-score]');
    const readNote = root.querySelector('[data-sp-read-note]');

    function setReadout(state, title, score, note, clusterKey) {
      if (readTitle) readTitle.textContent = title;
      if (readScore) readScore.textContent = score;
      if (readNote) readNote.textContent = note;
      if (!readCard) return;
      /* The state drives which rows the card shows at all, so an idle card
         collapses to its note instead of holding empty space open. */
      readCard.dataset.read = state;
      /* The rule at the top of the card takes the group's accent while a skill
         is being read, so the card is tied to the arc the pointer is on. */
      if (clusterKey) readCard.dataset.cluster = clusterKey;
      else delete readCard.dataset.cluster;
    }

    function showTooltip(event, index) {
      if (!tooltip) return;
      tooltip.replaceChildren();
      const strong = document.createElement('strong');
      strong.textContent = DATA.terms[index];
      const value = document.createElement('span');
      value.className = 'ontology-tooltip__score';
      value.textContent = plain ? '' : `${scores[index]}%`;
      /* No "<name> has 97% of this skill" line under the figure. The print is
         already titled with whose it is, so restating it in every tooltip is
         just the number said twice. */
      const facet = document.createElement('span');
      facet.className = 'ontology-tooltip__facet';
      facet.textContent = `Skillprint category · ${DATA.facet[index]}`;
      if (plain) {
        const group = document.createElement('span');
        const cluster = clusterOf(DATA.leafCluster[index]);
        group.textContent = cluster ? cluster.name : 'Joins no cluster';
        tooltip.append(strong, group, facet);
      } else {
        tooltip.append(strong, value, facet);
      }
      tooltip.classList.add('is-visible');
      if (event) moveTooltip(event);
    }

    /* ---- Per-person figures ------------------------------------------------ */

    /* Figures, readout, group strengths - all of them are readings of a person,
       so the blank dial skips them entirely and keeps only its export. */
    const overall = plain ? 0
      : Math.round(scores.reduce((sum, value) => sum + value, 0) / N);
    const ranked = plain ? [] : scores
      .map((value, index) => ({value, index}))
      .sort((a, b) => b.value - a.value);

    /* Strongest is 1st. Ties take the same rank, so two skills at 97 are both
       joint first rather than one of them being arbitrarily second. */
    const rankOf = new Array(N).fill(1);
    ranked.forEach((entry, position) => {
      rankOf[entry.index] = position > 0 && entry.value === ranked[position - 1].value
        ? rankOf[ranked[position - 1].index]
        : position + 1;
    });

    const metric = name => root.querySelector(`[data-sp-metric="${name}"]`);
    const setMetric = (name, value) => { const node = metric(name); if (node) node.textContent = value; };
    if (!plain) {
      setMetric('overall', `${overall}%`);
      setMetric('top', DATA.terms[ranked[0].index]);
      setMetric('low', DATA.terms[ranked[ranked.length - 1].index]);
      setMetric('span', `${ranked[ranked.length - 1].value}-${ranked[0].value}%`);
    }

    /* Strength per correlation group: the same six groups the tree was cut into,
       averaged for this person, so the side of the card answers "where is this
       person strong" without the reader having to eyeball the disc. */
    /* The correlation-group key, for the dial. A person's card shows the same six
       groups as average strengths instead - a number - because for them the
       question is "how much", not "which". Here there is no score, so the key is
       the group's own size and it doubles as the isolation control the original
       ontology section had. */
    const clusterHost = plain ? root.querySelector('[data-sp-clusters]') : null;
    if (clusterHost) {
      clusterHost.replaceChildren(...DATA.clusters.map(cluster => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ui-tag';
        button.dataset.cluster = cluster.key;
        button.setAttribute('aria-pressed', 'false');
        const name = document.createElement('span');
        name.textContent = cluster.name;
        const count = document.createElement('span');
        count.className = 'ontology-legend__count';
        count.textContent = cluster.size;
        button.append(name, count);
        button.addEventListener('mouseenter', () => previewCluster(cluster.key));
        button.addEventListener('mouseleave', restoreClusterState);
        button.addEventListener('focus', () => previewCluster(cluster.key));
        button.addEventListener('blur', restoreClusterState);
        button.addEventListener('click', event => {
          event.stopPropagation();
          lockedCluster = lockedCluster === cluster.key ? null : cluster.key;
          applyClusterState(lockedCluster);
        });
        return button;
      }));
    }

    /* Hovering a group on the dial also names it in the reading card, which is
       where the original section explained what each cut of the tree meant. */
    function previewCluster(key) {
      applyClusterState(key);
      const cluster = clusterOf(key);
      if (cluster) setReadout('term', cluster.name, '', cluster.description, key);
    }

    const strengthHost = plain ? null : root.querySelector('[data-sp-strength]');
    if (strengthHost) {
      strengthHost.replaceChildren(...DATA.clusters.map(cluster => {
        const members = [];
        DATA.leafCluster.forEach((key, index) => { if (key === cluster.key) members.push(scores[index]); });
        const mean = Math.round(members.reduce((sum, value) => sum + value, 0) / members.length);
        /* A button, not a div: this row isolates a group in the drawing, so it
           has to be reachable and pressable from the keyboard like any other
           control, and carry its locked state in aria-pressed. */
        const row = document.createElement('button');
        row.type = 'button';
        row.setAttribute('aria-pressed', 'false');
        row.addEventListener('mouseenter', () => applyClusterState(cluster.key));
        row.addEventListener('mouseleave', restoreClusterState);
        row.addEventListener('focus', () => applyClusterState(cluster.key));
        row.addEventListener('blur', restoreClusterState);
        row.addEventListener('click', event => {
          event.stopPropagation();
          lockedCluster = lockedCluster === cluster.key ? null : cluster.key;
          applyClusterState(lockedCluster);
        });
        row.className = 'sp-strength';
        /* The row carries the group's key so the dot in front of its name takes
           the same accent the group's lines take in the disc. That is the whole
           colour key - the drawing names its own groups, so a separate swatch
           card would only repeat it. */
        row.dataset.cluster = cluster.key;
        const name = document.createElement('span');
        name.className = 'sp-strength__name';
        name.textContent = cluster.name;
        const track = document.createElement('span');
        track.className = 'sp-strength__track';
        const fill = document.createElement('span');
        fill.className = 'sp-strength__fill';
        fill.style.width = `${mean}%`;
        fill.style.opacity = String(Math.max(0.08, mean / 100));
        track.appendChild(fill);
        const value = document.createElement('span');
        value.className = 'sp-strength__value';
        value.textContent = `${mean}%`;
        row.append(name, track, value);
        return row;
      }));
    }

    /* ---- Export ------------------------------------------------------------ */

    /* The on-page drawing is styled by the stylesheet; the exported one cannot
       be, so the export resolves every rule it needs to literal values, reads
       them off the live nodes, and writes them into a <style> block of its own.
       Anything read here has to exist in the DOM at the time - which it does,
       because the export runs from a click on a fully drawn print. */
    function exportStyles() {
      const read = (selector, props) => {
        const node = svg.querySelector(selector);
        if (!node) return '';
        const cs = getComputedStyle(node);
        const body = props.map(p => `${p}:${cs.getPropertyValue(p)}`).join(';');
        return `${selector}{${body}}`;
      };
      /* The group accents live in the stylesheet as --item, which the exported
         file cannot see. One rule per group, resolved off a real line inside
         that group, keeps the six colours without ever naming a hex in here. */
      const accents = [...DATA.clusters.map(cluster => `[data-cluster="${cluster.key}"]`),
                       '.cluster-group--above-cut']
        .map(selector => {
          const node = svg.querySelector(`${selector} .link`);
          return node ? `${selector} .link{stroke:${getComputedStyle(node).stroke}}` : '';
        })
        .filter(Boolean).join('');

      return [
        read('.leaf-label', ['fill', 'font-family', 'font-size', 'font-weight', 'letter-spacing']),
        read('.leaf-value', ['fill', 'font-weight', 'opacity']),
        read('.ring', ['stroke', 'stroke-width', 'opacity', 'fill']),
        read('.centre-disc', ['fill', 'stroke', 'stroke-width']),
        read('.centre-title', ['fill', 'font-family', 'font-size', 'font-weight', 'letter-spacing']),
        read('.centre-copy', ['fill', 'font-family', 'font-size', 'letter-spacing', 'text-transform']),
        read('.key-value', ['fill', 'font-size', 'font-weight', 'letter-spacing']),
        read('.key-foot', ['fill', 'font-size', 'letter-spacing']),
        '.ring--full{stroke-dasharray:2 4}',
        '.link{fill:none;stroke-linecap:round;stroke-linejoin:round}',
        accents,
      ].filter(Boolean).join('');
    }

    const PAD = 64;
    const TITLE_BAND = 132;
    /* Deeper than PAD, because the band under the drawing now carries the call
       to action rather than just being margin. */
    const FOOT_BAND = 104;
    const CTA_LABEL = 'Create your own Skillprint at';
    const CTA_URL = 'portal.skillprint.co';

    function exportSvg(fontCss, logo) {
      const clone = svg.cloneNode(true);
      /* The hit targets are pointer furniture and the traced state is whatever
         the pointer happened to be over; neither belongs in a still image. */
      clone.querySelectorAll('.leaf-hit').forEach(node => node.remove());
      clone.querySelectorAll('.is-path').forEach(node => node.classList.remove('is-path'));
      clone.querySelectorAll('.is-hovered').forEach(node => node.classList.remove('is-hovered'));
      /* A group left isolated on screen must not be baked into the file: the
         export is the whole print, not whatever was being read at the time. */
      clone.classList.remove('is-isolated');
      clone.querySelectorAll('.is-faded').forEach(node => node.classList.remove('is-faded'));

      const width = SIZE + PAD * 2;
      const height = viewH + TITLE_BAND + FOOT_BAND;
      const plate = getComputedStyle(svg.closest('.ontology-visual') || svg).backgroundColor;

      const body = Array.from(clone.childNodes).map(node => node.outerHTML || '').join('');
      /* Read through a guard, not straight off querySelector. The blank dial has
         no key, so .key-foot is absent there and getComputedStyle(null) throws -
         which failed the export for that one wheel while both prints exported
         fine. Anything sampled off the drawing has to tolerate the drawing not
         having it. */
      const paint = (selector, prop, fallback) => {
        const node = svg.querySelector(selector);
        return node ? getComputedStyle(node).getPropertyValue(prop) : fallback;
      };
      const strong = paint('.centre-title', 'fill', '#e3e5eb');
      const muted = paint('.key-foot', 'fill', paint('.leaf-label', 'fill', '#aab0bd'));

      return `<svg xmlns="${NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
        + `<style>${fontCss}${exportStyles()}`
        + `.x-name{fill:${strong};font-family:"SP UI",sans-serif;font-size:44px;font-weight:500;letter-spacing:-0.03em}`
        + `.x-role{fill:${muted};font-family:"SP Mono",monospace;font-size:17px;letter-spacing:0.11em;text-transform:uppercase}`
        + `.x-mark{fill:${muted};font-family:"SP Mono",monospace;font-size:17px;letter-spacing:0.11em;text-transform:uppercase}`
        /* The font-family the page resolves names local files the exported file
           cannot reach, so families are assigned here from the two embedded
           faces instead of being read off the live nodes. Mono is the default;
           everything set in the UI face has to be named on this line. */
        + `.x-cta{fill:${muted};font-size:20px;letter-spacing:-0.01em}`
        + `.x-cta-url{fill:${strong};font-weight:600}`
        + `text{font-family:"SP Mono",monospace}`
        + `.centre-title,.x-name,.key-value,.key-foot,.x-cta{font-family:"SP UI",sans-serif}</style>`
        + `<rect width="${width}" height="${height}" fill="${plate}"/>`
        + `<text class="x-name" x="${PAD}" y="${PAD + 46}">${person.name}</text>`
        + `<text class="x-role" x="${PAD}" y="${PAD + 82}">${person.role}</text>`
        + mark(logo, width)
        + `<g transform="translate(${PAD} ${TITLE_BAND})">${body}</g>`
        /* One line, centred under the drawing: the label muted, the address
           bright, so the eye lands on where to go rather than on the verb. Two
           tspans inside one centred <text>, so the pair centres as a unit
           however long either half is. */
        + `<text class="x-cta" x="${width / 2}" y="${height - 38}" text-anchor="middle">`
        + `${CTA_LABEL} <tspan class="x-cta-url">${CTA_URL}</tspan></text>`
        + `</svg>`;
    }

    /* The real mark when it loaded, the word set in the UI face when it did not.
       A download that quietly loses its branding is worse than one that falls
       back to type, and the fetch can fail on a file:// page or an offline tab. */
    function mark(logo, width) {
      /* Sized against the name opposite it rather than to a comfortable minimum.
         At 34 it was technically present and practically invisible - about three
         per cent of the image height, which reads as a smudge once the PNG is
         scaled to fit a slide. This pairs it with the 44px name and centres it
         on that name's cap height so the two read as one header line. */
      const MARK_H = 54;
      const NAME_CAP_CENTRE = PAD + 30;
      if (!logo) {
        return `<text class="x-mark" x="${width - PAD}" y="${PAD + 44}" text-anchor="end">Skillprint</text>`;
      }
      const w = MARK_H * logo.ratio;
      return `<svg x="${fixed(width - PAD - w)}" y="${fixed(NAME_CAP_CENTRE - MARK_H / 2)}"`
        + ` width="${fixed(w)}" height="${MARK_H}" viewBox="${logo.viewBox}">${logo.inner}</svg>`;
    }

    const downloadButton = root.querySelector('[data-sp-download]');
    if (downloadButton) {
      downloadButton.addEventListener('click', async event => {
        event.stopPropagation();
        const label = downloadButton.querySelector('[data-sp-download-label]');
        const original = label ? label.textContent : '';
        if (label) label.textContent = 'Preparing';
        downloadButton.disabled = true;
        try {
          const fontCss = await embeddedFonts();
          const markup = exportSvg(fontCss, inlinedSvg('sp-brand-source'));
          const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
          const image = new Image();
          await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(new Error('render'));
            image.src = url;
          });
          /* Three times the drawing's own units: a Skillprint lands on a slide
             about a third of a metre wide, and 3x keeps the 10px term labels
             crisp when it gets there. */
          const scale = 3;
          const canvas = document.createElement('canvas');
          canvas.width = (SIZE + PAD * 2) * scale;
          canvas.height = (viewH + TITLE_BAND + FOOT_BAND) * scale;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          if (!blob) throw new Error('encode');
          const href = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = href;
          /* Stamped, because every export used to be skillprint-<name>.png and a
             browser will not overwrite: the second download lands as
             "... (1).png" and the original sits there looking current. Opening
             the stale one and concluding the export is broken is a trap the
             filename should not set. */
          const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
          anchor.download = `skillprint-${person.file || person.key}-${stamp}.png`;
          anchor.click();
          URL.revokeObjectURL(href);
          if (label) label.textContent = 'Downloaded';
          setTimeout(() => { if (label) label.textContent = original; }, 1800);
        } catch (error) {
          /* Logged, not just shown. A silent catch here is what let a broken
             logo ship looking deliberate; the button says it failed and the
             console says why. */
          console.error('Skillprint export failed', error);
          if (label) label.textContent = 'Download failed';
          setTimeout(() => { if (label) label.textContent = original; }, 2400);
        } finally {
          downloadButton.disabled = false;
        }
      });
    }

    /* ---- Wiring ------------------------------------------------------------ */

    /* No plain guard here. It was added when the dial was a non-interactive
       plate; the dial now traces terms and isolates groups like the original
       ontology section did, so Reset has to clear its state too - without it the
       button was inert and a locked group could not be let go of. */
    /* Assigned by the zoom controller below, which is built before the first
       resetView() call at the foot of this function. Left as a no-op where
       there is no stage to zoom - the compact artwork on Home and the embed. */
    let zoomOut = null;

    function resetView() {
      lockedLeaf = null;
      lockedCluster = null;
      if (lockedHit) { lockedHit.setAttribute('aria-pressed', 'false'); lockedHit = null; }
      clearLeaf();
      applyClusterState(null);
    }

    /* The zoom is NOT cleared by resetView(). That function is also wired to a
       document-level click and to Escape, so folding the magnification into it
       meant a tap anywhere on the page threw the pinch away and the reader got
       one term per gesture - which, with the readout sheet sitting over the
       drawing, made the explore loop impossible to complete. Clearing a leaf
       lock and clearing the magnification are two different intentions; only
       the three places that mean the second one call this. */
    function resetViewAndZoom() {
      resetView();
      if (zoomOut) zoomOut();
    }

    /* Fit, or terms. Below 900px the drawing fits its stage and the radiating
       labels come off, because at that width each one is about 4px of texture
       rather than a word. This switches to the full-size drawing in a sideways
       scroller for a reader who does want to read them, and back again. The
       state sits on .ontology-visual because that is the element the
       stylesheet keys the two views off; above the breakpoint the button is
       display:none and neither view applies. */
    const termsButton = root.querySelector('[data-sp-terms]');
    if (termsButton) {
      /* On the ontology page the button sits in the plate's own head, inside
         .ontology-visual. On the profile the print's bar is a sibling of the
         figure, so the plate has to be found from the root instead. */
      const visual = termsButton.closest('.ontology-visual')
        || root.querySelector('.ontology-visual');
      const termsLabel = termsButton.querySelector('[data-sp-terms-label]');
      termsButton.addEventListener('click', event => {
        event.stopPropagation();
        if (!visual) return;
        const on = visual.getAttribute('data-terms') !== 'on';
        visual.setAttribute('data-terms', on ? 'on' : 'off');
        termsButton.setAttribute('aria-pressed', String(on));
        if (termsLabel) termsLabel.textContent = on ? 'Fit to screen' : 'Read terms';
        /* Open the terms view at the middle of the disc rather than its left
           edge: the centre is where the reading starts, and landing on the
           rim's blank margin looks like the drawing failed to load. */
        const stage = visual.querySelector('.ontology-visual__stage');
        if (stage) {
          stage.scrollLeft = on ? Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2) : 0;
        }
      });
    }

    /* --- pinch to zoom -----------------------------------------------------
       The drawing is 87 terms around a ring, and the arc band gives each of
       them about 24 user units - so no single resting size on a phone is both
       whole and readable. That was answered before by making the drawing wider
       than the screen (560px pinned inside a ~296px stage) and scrolling it
       sideways: the reader got legible terms and never saw the shape, and
       landed on the blank left margin of the rim, which reads as a drawing
       that failed to load.

       Two states instead of one layout. At rest the whole wheel is on screen;
       a pinch magnifies whatever is under the fingers. Measured at 390 the fit
       state is 364px wide against 296px of scrolling drawing before, and the
       figure is 213px shorter.

       Implemented on the viewBox, not on a transform and not on the container.
       There is no CSS-only per-element pinch - `touch-action` governs the
       document's visual viewport - so (a) is not available at all. Between a
       transform and the viewBox: the export path serialises the root's CHILD
       NODES into its own 1128x1320 space, so a `<g transform>` wrapper would
       be baked into every downloaded PNG, while the root's own viewBox is
       never read. Both were checked by exporting at rest and at a zoomed,
       panned state - byte-identical PNGs. The viewBox also costs a repaint
       rather than a reflow, cannot be caught by the layer-promotion trap that
       makes transforms blur mid-pinch, and clips for free against the SVG's
       own viewport.

       Not gated on a media query. Measured, the desktop Profile wheel draws
       its terms at 4.5px at 1280 and 5.7px at 1440 - worse than the phone - so
       a trackpad pinch and the keyboard get the same controller. */
    const stage = root.querySelector('.ontology-visual__stage');
    /* Home's rail figure and the embed card are `data-sp-compact`: artwork,
       with the hit rects and the key band skipped at build time. There is
       nothing on them to zoom into, and neither has a stage. */
    if (stage && !compact) (() => {
      const MAX_ZOOM = 4;
      const declared = { x: 0, y: 0, w: SIZE, h: viewH };
      let fitBox = null;
      let view = null;

      /* The drawing overhangs its declared box: the widest leaf labels reach
         about 12 units past it on every side, and an SVG root clips at its
         viewport, so those words were being shaved on screen. Fit to what is
         actually drawn, not to what was declared.

         Lazily, and never cached from a zero: at ?state=complete the blank
         dial's root is [hidden], and getBBox on an unrendered tree answers
         with zeros. Falling back to the declared box means the wheel is merely
         un-zoomed until it has been laid out once, rather than collapsed. */
      const measureFit = () => {
        if (fitBox) return fitBox;
        let box = null;
        try { box = svg.getBBox(); } catch (error) { box = null; }
        if (!box || !box.width || !box.height) return declared;
        const PAD = 2;
        const x0 = Math.min(0, box.x) - PAD;
        const y0 = Math.min(0, box.y) - PAD;
        const x1 = Math.max(SIZE, box.x + box.width) + PAD;
        const y1 = Math.max(viewH, box.y + box.height) + PAD;
        fitBox = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
        svg.style.aspectRatio = `${fitBox.w} / ${fitBox.h}`;
        return fitBox;
      };

      const r3 = n => Math.round(n * 1000) / 1000;

      const setView = next => {
        const fit = measureFit();
        const ratio = fit.h / fit.w;
        /* Never below fit: there is nothing outside the drawing to show. */
        const w = Math.min(fit.w, Math.max(fit.w / MAX_ZOOM, next.w));
        const h = w * ratio;
        /* Clamped so a pan cannot walk the view off the drawing. */
        const x = Math.min(fit.x + fit.w - w, Math.max(fit.x, next.x));
        const y = Math.min(fit.y + fit.h - h, Math.max(fit.y, next.y));
        view = { x, y, w, h };
        svg.setAttribute('viewBox', `${r3(x)} ${r3(y)} ${r3(w)} ${r3(h)}`);
        const zoomed = w < fit.w - 0.5;
        /* The attribute is what flips the stage from `pan-y` to `none`: one
           finger scrolls the page while the wheel is whole, and pans the wheel
           once it is not. */
        stage.setAttribute('data-zoomed', zoomed ? 'true' : 'false');
        if (hint) hint.hidden = false;
      };

      const resetZoom = () => {
        const fit = measureFit();
        setView({ x: fit.x, y: fit.y, w: fit.w, h: fit.h });
      };

      const current = () => view || Object.assign({}, measureFit());

      /* Client coordinates into the drawing's own units, through the box that
         is on screen right now. */
      const toUser = (clientX, clientY) => {
        const rect = svg.getBoundingClientRect();
        const v = current();
        if (!rect.width || !rect.height) return { x: v.x + v.w / 2, y: v.y + v.h / 2 };
        return {
          x: v.x + (clientX - rect.left) / rect.width * v.w,
          y: v.y + (clientY - rect.top) / rect.height * v.h
        };
      };

      /* About the point between the fingers, not about the centre. Zooming
         from the centre is actively wrong on this drawing: the leaves sit on a
         ring at radius 342 and the hub is empty, so at 1.8x centred there is
         no leaf on screen at all. */
      const zoomAt = (factor, clientX, clientY) => {
        const v = current();
        const u = toUser(clientX, clientY);
        const fx = (u.x - v.x) / v.w;
        const fy = (u.y - v.y) / v.h;
        const w = v.w / factor;
        setView({ x: u.x - fx * w, y: u.y - fy * (w * (v.h / v.w)), w });
      };

      /* --- the hint ------------------------------------------------------
         One quiet line under the plate rather than a control pair or a
         one-time coach mark. The bar above already carries three buttons at
         390 and had to be allowed to wrap; a dismissable hint is gone by the
         second visit, which is exactly when a reader has scores worth
         exploring. Inserted here rather than written into the markup so it can
         only appear where the controller actually runs.

         Outside .ontology-visual deliberately. That element pins its own dark
         token block as literals - --ui-muted included - so a caption inside it
         would come out grey-400 on navy-950 in both themes and read as part of
         the drawing rather than as instruction. */
      let hint = null;
      const visual = stage.closest('.ontology-visual');
      if (visual && visual.parentNode) {
        hint = document.createElement('p');
        hint.className = 'ontology-zoom-hint';
        hint.hidden = true;
        hint.textContent = 'Pinch or scroll to zoom · double-tap to fit';
        visual.parentNode.insertBefore(hint, visual.nextSibling);
      }

      /* --- gestures ------------------------------------------------------ */
      const points = new Map();
      let pinchStart = 0;
      let pinchW = 0;
      let panFrom = null;
      let moved = false;
      let lastTap = 0;

      const spread = () => {
        const [a, b] = [...points.values()];
        return Math.hypot(a.x - b.x, a.y - b.y);
      };
      const midpoint = () => {
        const [a, b] = [...points.values()];
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      };

      stage.addEventListener('pointerdown', event => {
        points.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (points.size === 2) {
          pinchStart = spread();
          pinchW = current().w;
          panFrom = null;
          moved = false;
        } else if (points.size === 1 && view && view.w < measureFit().w - 0.5) {
          panFrom = { x: event.clientX, y: event.clientY, view: current() };
          moved = false;
        }
        try { stage.setPointerCapture(event.pointerId); } catch (error) { /* capture refused */ }
      });

      stage.addEventListener('pointermove', event => {
        if (!points.has(event.pointerId)) return;
        points.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (points.size === 2 && pinchStart > 0) {
          const now = spread();
          if (!now) return;
          const mid = midpoint();
          const v = current();
          const target = pinchW * (pinchStart / now);
          /* Scale about the midpoint by re-deriving the box each frame from
             the gesture's own start width, so a pinch that goes out and back
             lands where it began instead of drifting. */
          const u = toUser(mid.x, mid.y);
          const fx = (u.x - v.x) / v.w;
          const fy = (u.y - v.y) / v.h;
          setView({ x: u.x - fx * target, y: u.y - fy * (target * (v.h / v.w)), w: target });
          moved = true;
        } else if (points.size === 1 && panFrom) {
          const rect = svg.getBoundingClientRect();
          if (!rect.width) return;
          const scale = panFrom.view.w / rect.width;
          setView({
            x: panFrom.view.x - (event.clientX - panFrom.x) * scale,
            y: panFrom.view.y - (event.clientY - panFrom.y) * scale,
            w: panFrom.view.w
          });
          if (Math.hypot(event.clientX - panFrom.x, event.clientY - panFrom.y) > 6) moved = true;
        }
      });

      const endPointer = event => {
        points.delete(event.pointerId);
        if (points.size < 2) { pinchStart = 0; }
        if (points.size === 0) {
          panFrom = null;
          /* A pinch or a pan ends in a click on whatever was under the finger,
             and every leaf is a button that locks a term. Swallow the one that
             belongs to the gesture. */
          if (moved) {
            const swallow = e => { e.stopPropagation(); e.preventDefault(); };
            stage.addEventListener('click', swallow, { capture: true, once: true });
            window.setTimeout(() => stage.removeEventListener('click', swallow, true), 0);
            moved = false;
            return;
          }
          /* Double tap resets, and only while zoomed. Zoom-in on double tap is
             deliberately absent: the 87 leaves own the single tap, and waiting
             300ms to find out whether a second one is coming would put that
             delay on every term. */
          const now = event.timeStamp || Date.now();
          if (view && view.w < measureFit().w - 0.5 && now - lastTap < 300) {
            resetZoom();
            if (root.sp && root.sp.reset) root.sp.reset();
            lastTap = 0;
            return;
          }
          lastTap = now;
        }
      };
      stage.addEventListener('pointerup', endPointer);
      stage.addEventListener('pointercancel', endPointer);

      /* A trackpad pinch arrives as a wheel event with ctrlKey set; a plain
         wheel is the reader scrolling the page and is left alone. */
      stage.addEventListener('wheel', event => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        zoomAt(Math.exp(-event.deltaY / 220), event.clientX, event.clientY);
      }, { passive: false });

      /* --- keyboard ------------------------------------------------------ */
      stage.setAttribute('tabindex', '0');
      stage.setAttribute('role', 'group');
      stage.setAttribute('aria-label', 'Skillprint wheel, zoomable');
      stage.addEventListener('keydown', event => {
        const rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const v = current();
        if (event.key === '+' || event.key === '=') { zoomAt(1.35, cx, cy); }
        else if (event.key === '-' || event.key === '_') { zoomAt(1 / 1.35, cx, cy); }
        else if (event.key === '0') { resetZoom(); }
        else if (event.key === 'ArrowLeft') { setView({ x: v.x - v.w * 0.08, y: v.y, w: v.w }); }
        else if (event.key === 'ArrowRight') { setView({ x: v.x + v.w * 0.08, y: v.y, w: v.w }); }
        else if (event.key === 'ArrowUp') { setView({ x: v.x, y: v.y - v.h * 0.08, w: v.w }); }
        else if (event.key === 'ArrowDown') { setView({ x: v.x, y: v.y + v.h * 0.08, w: v.w }); }
        else return;
        event.preventDefault();
      });

      /* Tabbing walks 87 leaves. While zoomed most of them are off the box, so
         the focus ring would leave the screen and the tab order would read as
         broken. Bring the focused one into view instead.

         KEYBOARD ONLY, and this is the whole point of the flag. A `.leaf-hit`
         carries tabindex="0", so a THUMB focuses one too - and the handler then
         re-centred the view on that leaf while the finger was still down.
         Measured at 3.5x: the view jumped 159 units, 54% of the visible width,
         the tap selected nothing, and the term that slid under the finger on
         the way was a different one. It affected 27% of tappable leaf area at
         390 and 49% at 1440, concentrated on exactly the peripheral labels a
         reader pinches in to read. A leaf's hit rect is LABEL_BOX long - 176
         units - so its bbox centre is up to 88 units from the end the reader
         actually touched, which is why the jump is large even for a leaf that
         is nearly on screen. */
      let usingKeyboard = false;
      document.addEventListener('pointerdown', () => { usingKeyboard = false; }, true);
      document.addEventListener('keydown', event => {
        if (event.key === 'Tab' || event.key.indexOf('Arrow') === 0) usingKeyboard = true;
      }, true);

      svg.addEventListener('focusin', event => {
        if (!usingKeyboard) return;
        if (!view || view.w >= measureFit().w - 0.5) return;
        const hit = event.target.closest ? event.target.closest('.leaf-hit') : null;
        if (!hit || !hit.getBBox) return;
        let b = null;
        try { b = hit.getBBox(); } catch (error) { return; }
        /* The minimum move that brings the leaf inside, not a re-centre. A
           176-unit rect centred in a 290-unit view fills most of it and throws
           everything else off screen; nudging is what keeps the reader's place. */
        let x = view.x;
        let y = view.y;
        if (b.x < view.x) x = b.x;
        else if (b.x + b.width > view.x + view.w) x = b.x + b.width - view.w;
        if (b.y < view.y) y = b.y;
        else if (b.y + b.height > view.y + view.h) y = b.y + b.height - view.h;
        if (x === view.x && y === view.y) return;
        setView({ x, y, w: view.w });
      });

      /* A zoomed crop must not become the printed figure, and no @media print
         rule can restore a viewBox - it is an attribute, not a property. */
      const beforePrint = () => resetZoom();
      window.addEventListener('beforeprint', beforePrint);
      if (window.matchMedia) {
        const mql = window.matchMedia('print');
        if (mql.addEventListener) mql.addEventListener('change', e => { if (e.matches) beforePrint(); });
      }

      /* A stage that changes width has a different fit box. */
      if (typeof ResizeObserver === 'function') {
        let lastW = stage.clientWidth;
        new ResizeObserver(() => {
          if (Math.abs(stage.clientWidth - lastW) < 2) return;
          lastW = stage.clientWidth;
          fitBox = null;
          resetZoom();
        }).observe(stage);
      }

      zoomOut = resetZoom;
      resetZoom();
    })();

    const resetButton = root.querySelector('[data-sp-reset]');
    if (resetButton) {
      resetButton.addEventListener('click', event => {
        event.stopPropagation();
        hideTooltip();
        resetViewAndZoom();
      });
    }

    root.addEventListener('click', event => event.stopPropagation());

    root.sp = { reset: resetView, resetAll: resetViewAndZoom };

    resetView();
  }

  /* ---- Shared tooltip placement -------------------------------------------- */

  function moveTooltip(event) {
    if (!tooltip) return;
    /* A bubble placed at the cursor is meaningless where there is no cursor,
       and the inline `left`/`top` it writes outrank the sheet's own geometry -
       measured, a tap's synthesised mousemove left the sheet 378px wide at
       left 12 and stretched from y 295 to the foot of the screen, because the
       inline `top` beat the rule's `top: auto` while its `bottom: 0` still
       applied. Nothing to place on a touch device; the stylesheet owns it. */
    if (COARSE.matches) return;
    const offset = 14;
    const width = tooltip.offsetWidth || 200;
    const height = tooltip.offsetHeight || 96;
    const left = Math.min(event.clientX + offset, window.innerWidth - width - 12);
    const top = Math.min(event.clientY + offset, window.innerHeight - height - 12);
    tooltip.style.left = `${Math.max(12, left)}px`;
    tooltip.style.top = `${Math.max(12, top)}px`;
  }

  function hideTooltip() { if (tooltip) tooltip.classList.remove('is-visible'); }

  /* Every root drawn so far, for the document-level reset handlers below.
     Hoisted out of the hydrate call so those handlers can see it. */
  let prints = [];

  /* Draw every wheel root on the page that has not been drawn yet. A caller
     that wants a root redrawn (React re-mounting the figure, say) deletes
     `root.sp` first; a root that already carries it is left exactly as it is,
     so a second hydrate call cannot strip a finished drawing. */
  window.skillprintHydrateWheel = () => {
    prints = [...document.querySelectorAll('[data-skillprint]')];
    prints.forEach(root => {
        if (root.sp) { return; }
        const svg = root.querySelector('[data-sp-wheel]');
        if (svg) {
            [...svg.children].forEach(c => { if(c.tagName.toLowerCase() !== 'desc') svg.removeChild(c) });
        }
        buildSkillprint(root);
    });
  };
  window.skillprintHydrateWheel();

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    hideTooltip();
    prints.forEach(root => { if (root.sp) root.sp.reset(); });
  });
  document.addEventListener('click', () => {
    hideTooltip();
    prints.forEach(root => { if (root.sp) root.sp.reset(); });
  });
})();
/* === SKILLPRINT WHEEL: END === */
