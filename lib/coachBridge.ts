import fs from 'fs';
import path from 'path';
import { baseSlug } from './gameSlug';

export type TipKind = 'works' | 'avoid' | 'question' | 'thought' | 'whisper';

export interface PersonaLook {
  hair: string;
  skin: string;
  top: string;
  bottom: string;
  shoes: string;
}

export interface CoachPersonaSummary {
  id: string;
  name: string;
  kind: 'agent' | 'human';
  archetype: string;
  label: string;
  temperament: string;
  look: PersonaLook;
  focusSkills: string[];
  moods: string[];
  playsOnGame: number;
  totalRuns: number;
  bestScoreOnGame: number | null;
  lastScoreOnGame: number | null;
  topSkills: Array<{ slug: string; score: number }>;
  calibration: string | null;
  gameNote: string | null;
  recentChoiceReason: string | null;
  recentMoveThought: string | null;
}

export interface CoachTipItem {
  id: string;
  kind: TipKind;
  text: string;
  rationale?: string;
  fromId: string;
  fromName: string;
  fromKind: 'agent' | 'human';
  fromLabel?: string;
  fromLook?: PersonaLook;
  gameSlug: string;
  count: number;
  stage?: 'validated' | 'adopted' | 'consolidated' | 'candidate' | 'thought';
  netDelta?: number | null;
  createdAt?: string;
}

export interface UserSharedLesson {
  id: string;
  userId: string;
  userName: string;
  gameSlug: string;
  gameTitle: string;
  kind: 'works' | 'avoid' | 'question';
  text: string;
  score: number | null;
  targetMood?: string;
  shareTo: string; // 'all' | 'agents' | 'humans' | personaId
  createdAt: string;
  attributions: Array<{
    personaId: string;
    personaName: string;
    personaKind: 'agent' | 'human';
    status: 'queued' | 'delivered' | 'adopted' | 'validated' | 'falsified';
    scoreDelta?: number | null;
    evidence?: string;
  }>;
  helpfulCount: number;
}

export interface PlayerExperienceInput {
  userId?: string | null;
  userName?: string;
  sessionsPlayed?: number;
  bestScore?: number | null;
  lastScore?: number | null;
  bestFlowScore?: number | null;
  lastFlowScore?: number | null;
  lastFlow?: number | null;
  streakDays?: number;
  targetMood?: string;
  gameTitle?: string;
  gameSkills?: string[];
  profileSkills?: Record<string, number | { score: number; delta?: number | null; sessions?: number }>;
}

export interface PreGameCoachBriefing {
  gameSlug: string;
  gameTitle: string;
  selectedCoach: CoachPersonaSummary;
  availableCoaches: CoachPersonaSummary[];
  profileAnalysis: string;
  coachGreeting: string;
  characterThoughts: string[];
  tips: CoachTipItem[];
  communityLessons: UserSharedLesson[];
}

const DEFAULT_LOOK: PersonaLook = {
  hair: '#4a2f1d',
  skin: '#f1c9a5',
  top: '#e8913a',
  bottom: '#3a4a86',
  shoes: '#f6f1e7',
};

const BUILTIN_GAME_TACTICS: Record<
  string,
  { works: string[]; avoid: string[]; question: string[]; note: string }
> = {
  hextris: {
    works: [
      'Rotate early as soon as the next falling bar spawns at the outer rim so same-colored stacks stay adjacent.',
      'Balance stack heights across all 6 faces of the hexagon; never let one face grow more than 3 bars taller than its neighbors.',
    ],
    avoid: [
      'Avoid burying a single mismatched bar under a tall column — clear the top layer first or rotate to an open face.',
    ],
    question: [
      'Does setting up 4-bar combo chains score faster than immediately clearing 3-bar matches as speed ramps up?',
    ],
    note: 'Focus on the incoming bar color at the outer edge first, then commit to your rotation without second-guessing.',
  },
  '2048': {
    works: [
      'Keep your highest-value tile anchored in one corner (e.g. bottom-left) and build a descending snake along that row.',
      'Keep the anchor row completely full of 4 tiles before sliding perpendicular to it so the corner tile cannot shift.',
    ],
    avoid: [
      'Avoid alternating all four directions rapidly — pulling the max tile out of its corner traps small 2/4 tiles underneath.',
    ],
    question: [
      'When the bottom row locks up, does preparing a column merge above the second-highest tile recover cleaner than sliding right?',
    ],
    note: 'Restrict moves to 3 directions and protect the corner anchor at all costs.',
  },
  'stroop-test': {
    works: [
      'Defocus slightly from the letters and subvocally name only the INK hue before tapping your answer.',
      'Pause 150ms on incongruent rounds (where word text and ink color clash) — accuracy preserves streaks.',
    ],
    avoid: [
      'Avoid impulse-tapping on the first syllable you read; word reading finishes faster than color naming and triggers Stroop traps.',
    ],
    question: [
      'Does mapping colors spatially to finger positions reduce reaction latency on incongruent trials?',
    ],
    note: 'Speed alone is a trap here — a steady, deliberate rhythm beats reactive clicking when word and ink conflict.',
  },
  'simon-says': {
    works: [
      'Chunk the pad flashes into rhythmic groups of 3 or 4 (e.g. "1-4-2 · 3-1") and rehearse them during the playback pause.',
      'Anchor your gaze on the center intersection so peripheral vision catches every flash without eye-jump lag.',
    ],
    avoid: [
      'Avoid clicking before the sequence finishes flashing — premature inputs break motor rhythm.',
    ],
    question: [
      'Does encoding sequences as geometric shapes hold longer in working memory than counting numbers?',
    ],
    note: 'Group flashes into 3-beat chunks and pause a beat between taps to stay accurate.',
  },
  runner: {
    works: [
      'Trigger jumps slightly before the platform edge and use short hops for tight gaps so you land ready for the next obstacle.',
      'Look two obstacles ahead on the right third of the screen rather than staring at your character sprite.',
    ],
    avoid: [
      'Avoid holding jump at maximum duration over narrow gaps — long airtime commits you to landing on the next hazard.',
    ],
    question: [
      'At high scroll speeds, does jumping 80ms earlier on rising platforms prevent clipping the front ledge?',
    ],
    note: 'Keep your eyes on the incoming horizon rather than your character to anticipate tight platform gaps.',
  },
  'mage-duel': {
    works: [
      'Commit to your opening spell cast immediately when the round starts to establish tempo before the opponent charges.',
      'Watch elemental cooldowns and chain complementary counters rather than spamming a single attack.',
    ],
    avoid: [
      'Avoid hesitating at the start of a round — idle opening seconds let incoming projectiles stack up.',
    ],
    question: [
      'Does saving a defensive counter for the opponent’s second burst preserve more health than all-out offense?',
    ],
    note: 'Start decisively without hesitation and track the opponent’s cast rhythm.',
  },
  'gummy-blocks': {
    works: [
      'Place large 3x3 and L-shaped pieces first, and keep a 3x3 reserve space open near the center of the board.',
      'Clear full rows and columns simultaneously when possible to open multi-directional breathing room.',
    ],
    avoid: [
      'Avoid tucking single-block pieces into isolated holes early when they can complete a multi-line clear later.',
    ],
    question: [
      'Does prioritizing horizontal row clears over vertical columns leave cleaner placement slots for L-pieces?',
    ],
    note: 'Always scan all three upcoming pieces in the tray before placing the first one.',
  },
  'box-tower': {
    works: [
      'Watch the turnaround apex of the swinging block and tap just as the edges align with the stack below.',
      'Prioritize a wide, stable base in the first 10 blocks over speed — early overhang trims compound quickly.',
    ],
    avoid: [
      'Avoid chasing rhythm by tapping faster as the tower sways; wait for the swing cycle to pass center.',
    ],
    question: [
      'Does waiting one full swing cycle after a narrow trim help recalibrate timing better than immediate drops?',
    ],
    note: 'Find a steady visual anchor on the top block’s left edge to time each release.',
  },
  'snake-attack': {
    works: [
      'Hug the outer perimeter after growing long so your tail coils predictably and leaves the center open.',
      'Approach pickups along parallel lanes rather than diving straight perpendicular into a wall.',
    ],
    avoid: [
      'Avoid cutting across the middle of the arena when a pickup spawns near your own mid-body.',
    ],
    question: [
      'When the board gets crowded, does a wide figure-eight loop keep more escape lanes open than a perimeter spiral?',
    ],
    note: 'Plan your exit turn before you eat the target, not after.',
  },
  'cat-focus': {
    works: [
      'Keep a soft peripheral gaze in the center of the scene so subtle movements register across all corners at once.',
      'Verify the target cue before clicking when decoys appear nearby.',
    ],
    avoid: [
      'Avoid darting your eyes rapidly from corner to corner — saccadic masking hides brief target cues.',
    ],
    question: [
      'Does anchoring gaze centrally improve reaction speed when multiple decoys animate simultaneously?',
    ],
    note: 'Stay calm and let movement catch your eye rather than hunting frantically.',
  },
  'order-rush': {
    works: [
      'Scan the full order ticket once and batch matching ingredients in sequence rather than checking after every tap.',
    ],
    avoid: [
      'Avoid tapping the center repeatedly before the order queue initializes.',
    ],
    question: [
      'Does grouping items by station color speed up assembly on 4+ ingredient orders?',
    ],
    note: 'Read the full sequence first, then execute in one smooth motor chunk.',
  },
  'sumagi-2': {
    works: [
      'Pair larger base numbers first and keep small 1s and 2s adjacent as flexible bridges to hit the target sum.',
    ],
    avoid: [
      'Avoid using up all small bridging tiles on early low-target sums.',
    ],
    question: [
      'Does building sums from the largest available tile downward reduce mental arithmetic steps?',
    ],
    note: 'Subtract the largest tile from the target first, then scan for the remainder.',
  },
  'procedural-maze': {
    works: [
      'Scan junctions one turn ahead of your current tile so you buffer the next direction before reaching the corner.',
      'Eliminate dead-end branches visually from the goal backward when the maze first renders.',
    ],
    avoid: [
      'Avoid stopping at every T-junction — trace the corridor to its next fork before moving.',
    ],
    question: [
      'Does tracing backward from the exit for 1 second before moving beat immediate forward exploration?',
    ],
    note: 'Focus on pattern recognition at corridor forks rather than overthinking individual steps.',
  },
};

function getIslandStateDir(): string {
  if (process.env.LLM_ISLAND_STATE_DIR) {
    return process.env.LLM_ISLAND_STATE_DIR;
  }
  const candidates = [
    path.resolve(process.cwd(), '../llm-island/state'),
    path.resolve(process.cwd(), 'llm-island/state'),
    path.resolve(__dirname, '../../llm-island/state'),
    path.resolve(__dirname, '../../../llm-island/state'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  const fallback = path.resolve(process.cwd(), '.coach-state');
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath: string, data: unknown): void {
  try {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  } catch (e) {
    console.warn('Could not write coach state file:', filePath, e);
  }
}

function appendJsonLine(filePath: string, entry: Record<string, unknown>): void {
  try {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(filePath, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (e) {
    console.warn('Could not append session.jsonl:', filePath, e);
  }
}

/** Match game slugs across portal variants (e.g. `stroop-test-focus-match--3` <-> `stroop-test`, `mage-duel-2d` <-> `mage-duel`). */
export function normalizeGameKey(rawSlug: string): string {
  const b = baseSlug((rawSlug || '').toLowerCase().trim());
  const stripped = b.startsWith('portal-') ? b.slice('portal-'.length) : b;
  if (stripped === 'mage-duel-2d') return 'mage-duel';
  if (stripped === 'sumagi') return 'sumagi-2';
  if (stripped.startsWith('stroop-test')) return 'stroop-test';
  if (stripped.startsWith('hextris')) return 'hextris';
  if (stripped.startsWith('simon-says')) return 'simon-says';
  if (stripped.startsWith('2048')) return '2048';
  return stripped || 'hextris';
}

function gameMatches(candidateSlug: string, targetGameKey: string): boolean {
  if (!candidateSlug || !targetGameKey) return false;
  if (candidateSlug === '*') return true;
  const normCandidate = normalizeGameKey(candidateSlug);
  return (
    normCandidate === targetGameKey ||
    candidateSlug.toLowerCase().includes(targetGameKey) ||
    targetGameKey.includes(normCandidate)
  );
}

function readTailSessionEntries(sessionFile: string, maxLines = 180): Array<Record<string, any>> {
  try {
    if (!fs.existsSync(sessionFile)) return [];
    const stat = fs.statSync(sessionFile);
    const readSize = Math.min(stat.size, 120_000);
    const fd = fs.openSync(sessionFile, 'r');
    const buf = Buffer.alloc(readSize);
    fs.readSync(fd, buf, 0, readSize, Math.max(0, stat.size - readSize));
    fs.closeSync(fd);
    const lines = buf.toString('utf-8').split('\n').filter(Boolean);
    const startIdx = stat.size > readSize ? 1 : 0; // skip potentially partial first line
    const out: Array<Record<string, any>> = [];
    for (const line of lines.slice(startIdx).slice(-maxLines)) {
      try {
        out.push(JSON.parse(line));
      } catch {
        // ignore malformed line
      }
    }
    return out;
  } catch {
    return [];
  }
}

interface LoadedPersona {
  summary: CoachPersonaSummary;
  dir: string;
  memory: Record<string, any>;
  profile: Record<string, any>;
  coach: Record<string, any>;
  playbooks: Record<string, { worked: any[]; failed: any[]; best_score?: number; runs?: number }>;
  recentEntries: Array<Record<string, any>>;
}

function loadPersonaFromDir(pid: string, dir: string, targetGameKey: string): LoadedPersona {
  const rawPersona = readJsonSafe<Record<string, any>>(path.join(dir, 'persona.json'), {});
  const prof = readJsonSafe<Record<string, any>>(path.join(dir, 'profile.json'), {});
  const mem = readJsonSafe<Record<string, any>>(path.join(dir, 'memory.json'), {});
  const coachData = readJsonSafe<Record<string, any>>(path.join(dir, 'coach.json'), {});
  const recentEntries = readTailSessionEntries(path.join(dir, 'session.jsonl'), 160);

  // Load playbooks
  const playbooks: Record<string, { worked: any[]; failed: any[]; best_score?: number; runs?: number }> = {};
  const pbDir = path.join(dir, 'playbooks');
  if (fs.existsSync(pbDir)) {
    try {
      for (const file of fs.readdirSync(pbDir)) {
        if (!file.endsWith('.json')) continue;
        const stem = file.slice(0, -5);
        const key = normalizeGameKey(stem);
        const pb = readJsonSafe<Record<string, any>>(path.join(pbDir, file), {});
        const existing = playbooks[key] || { worked: [], failed: [], best_score: 0, runs: 0 };
        existing.worked = [...existing.worked, ...(Array.isArray(pb.worked) ? pb.worked : [])];
        existing.failed = [...existing.failed, ...(Array.isArray(pb.failed) ? pb.failed : [])];
        existing.best_score = Math.max(existing.best_score || 0, Number(pb.best_score || 0));
        existing.runs = (existing.runs || 0) + Number(pb.runs || 0);
        playbooks[key] = existing;
      }
    } catch {
      // ignore
    }
  }

  // Compute plays & scores on targetGameKey
  let playsOnGame = 0;
  let bestScoreOnGame: number | null = null;
  let lastScoreOnGame: number | null = null;

  const profGames = prof.games || {};
  for (const [gSlug, gVal] of Object.entries(profGames) as Array<[string, any]>) {
    if (gameMatches(gSlug, targetGameKey)) {
      playsOnGame += Number(gVal?.plays || 0);
      if (typeof gVal?.best === 'number') {
        bestScoreOnGame = bestScoreOnGame === null ? gVal.best : Math.max(bestScoreOnGame, gVal.best);
      }
      if (typeof gVal?.last === 'number') {
        lastScoreOnGame = gVal.last;
      }
    }
  }

  const memPlayed = mem.about?.games_played || {};
  for (const [gSlug, count] of Object.entries(memPlayed)) {
    if (gameMatches(gSlug, targetGameKey)) {
      playsOnGame = Math.max(playsOnGame, Number(count || 0));
    }
  }

  if (playbooks[targetGameKey]?.runs) {
    playsOnGame = Math.max(playsOnGame, Number(playbooks[targetGameKey].runs || 0));
  }

  // Also count runs from session.jsonl and live status.json (e.g. newly created agents like JeremyBot)
  const statusData = readJsonSafe<Record<string, any>>(path.join(dir, 'status.json'), {});
  let sessionRunsOnGame = 0;
  let totalSessionRuns = 0;
  for (const e of recentEntries) {
    if (e?.kind === 'run_start' || e?.kind === 'outcome') {
      if (e.kind === 'run_start') totalSessionRuns += 1;
      if (gameMatches(String(e.game || ''), targetGameKey)) {
        if (e.kind === 'run_start') sessionRunsOnGame += 1;
        if (typeof e.score === 'number') {
          bestScoreOnGame = bestScoreOnGame === null ? e.score : Math.max(bestScoreOnGame, e.score);
          lastScoreOnGame = e.score;
        }
      }
    }
  }
  if (statusData?.phase === 'playing' && gameMatches(String(statusData.game || ''), targetGameKey)) {
    sessionRunsOnGame = Math.max(sessionRunsOnGame, 1);
    if (typeof statusData.score === 'number') {
      lastScoreOnGame = statusData.score;
      bestScoreOnGame = bestScoreOnGame === null ? statusData.score : Math.max(bestScoreOnGame, statusData.score);
    }
  }
  playsOnGame = Math.max(playsOnGame, sessionRunsOnGame);

  // Find game note from memory.json
  let gameNote: string | null = null;
  const memGames = mem.games || {};
  for (const [gSlug, gObj] of Object.entries(memGames) as Array<[string, any]>) {
    if (gameMatches(gSlug, targetGameKey) && gObj?.note) {
      const noteText = String(gObj.note);
      // Prefer qualitative notes over raw "last 0 vs par" strings if multiple exist
      if (!gameNote || !noteText.startsWith('last ')) {
        gameNote = noteText;
      }
    }
  }

  // Find recent choice reason and move thought on this game
  let recentChoiceReason: string | null = null;
  let recentMoveThought: string | null = null;
  for (let i = recentEntries.length - 1; i >= 0; i--) {
    const e = recentEntries[i];
    if (!e || !gameMatches(String(e.game || ''), targetGameKey)) continue;
    if (!recentChoiceReason && e.kind === 'choose' && e.reason) {
      recentChoiceReason = String(e.reason);
    }
    if (!recentMoveThought && e.kind === 'move' && e.reason) {
      const r = String(e.reason);
      if (r.length > 15 && !r.toLowerCase().includes('fallback')) {
        recentMoveThought = r;
      }
    }
    if (recentChoiceReason && recentMoveThought) break;
  }

  // Top skills
  const rawSkills = prof.skills || {};
  const topSkills = Object.entries(rawSkills)
    .filter(([, v]) => typeof v === 'number' && (v as number) > 0)
    .map(([slug, score]) => ({ slug, score: Math.round(Number(score)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const isDefaultIsland = pid === 'island';
  const name = rawPersona.name || (isDefaultIsland ? 'Island' : pid.charAt(0).toUpperCase() + pid.slice(1));
  const archetype = rawPersona.archetype || (isDefaultIsland ? 'explorer' : 'scholar');
  const label = rawPersona.label || (isDefaultIsland ? 'The Explorer' : 'The Scholar');
  const temperament =
    rawPersona.temperament ||
    (isDefaultIsland
      ? 'Curious and analytical. Tests every cabinet to map its skill demands and shares verified playbook rules.'
      : 'Methodical and patient. Reads the full state before acting and values deliberate accuracy over raw speed.');

  const kind: 'agent' | 'human' =
    rawPersona.kind === 'human' || rawPersona.archetype === 'human' || pid.startsWith('player-')
      ? 'human'
      : 'agent';

  const summary: CoachPersonaSummary = {
    id: pid,
    name,
    kind,
    archetype,
    label,
    temperament,
    look: { ...DEFAULT_LOOK, ...(rawPersona.look || {}) },
    focusSkills: Array.isArray(rawPersona.focus) && rawPersona.focus.length
      ? rawPersona.focus
      : ['spatial', 'attention', 'planning', 'reflexes'],
    moods: Array.isArray(rawPersona.moods) && rawPersona.moods.length
      ? rawPersona.moods
      : ['focus', 'curiosity'],
    playsOnGame,
    totalRuns: Math.max(
      totalSessionRuns,
      playsOnGame,
      Number(prof.runs || prof.sessions || Object.values(memPlayed).reduce((a: number, b: any) => a + Number(b || 0), 0) || 0)
    ),
    bestScoreOnGame,
    lastScoreOnGame,
    topSkills,
    calibration: mem.about?.calibration || null,
    gameNote,
    recentChoiceReason,
    recentMoveThought,
  };

  return {
    summary,
    dir,
    memory: mem,
    profile: prof,
    coach: coachData,
    playbooks,
    recentEntries,
  };
}

export function loadAllPersonas(rawGameSlug: string): LoadedPersona[] {
  const stateDir = getIslandStateDir();
  const targetGameKey = normalizeGameKey(rawGameSlug);
  const out: LoadedPersona[] = [];

  // 1. Default `island` persona at root
  if (fs.existsSync(path.join(stateDir, 'memory.json')) || fs.existsSync(path.join(stateDir, 'profile.json'))) {
    out.push(loadPersonaFromDir('island', stateDir, targetGameKey));
  }

  // 2. Personas under `state/personas/*`
  const personasDir = path.join(stateDir, 'personas');
  if (fs.existsSync(personasDir)) {
    try {
      for (const entry of fs.readdirSync(personasDir)) {
        const pDir = path.join(personasDir, entry);
        if (fs.statSync(pDir).isDirectory()) {
          out.push(loadPersonaFromDir(entry, pDir, targetGameKey));
        }
      }
    } catch {
      // ignore
    }
  }

  // Ensure we always have at least 2 distinct AI coach personas available even in a fresh checkout
  const agentIds = new Set(out.filter((p) => p.summary.kind === 'agent').map((p) => p.summary.id));
  if (!agentIds.has('island')) {
    out.unshift({
      summary: {
        id: 'island',
        name: 'Island',
        kind: 'agent',
        archetype: 'explorer',
        label: 'The Explorer',
        temperament: 'Curious and analytical. Maps every game’s mechanics and tests tactics on seeded runs.',
        look: DEFAULT_LOOK,
        focusSkills: ['spatial', 'action', 'attention'],
        moods: ['focus', 'curiosity'],
        playsOnGame: 4,
        totalRuns: 30,
        bestScoreOnGame: null,
        lastScoreOnGame: null,
        topSkills: [
          { slug: 'action', score: 96 },
          { slug: 'spatial', score: 91 },
          { slug: 'attention', score: 78 },
        ],
        calibration: null,
        gameNote: null,
        recentChoiceReason: null,
        recentMoveThought: null,
      },
      dir: stateDir,
      memory: {},
      profile: {},
      coach: {},
      playbooks: {},
      recentEntries: [],
    });
  }

  if (!agentIds.has('kai-speedrunner') && agentIds.size < 2) {
    out.push({
      summary: {
        id: 'kai-speedrunner',
        name: 'Kai',
        kind: 'agent',
        archetype: 'speedrunner',
        label: 'The Speedrunner',
        temperament: 'Fast and decisive. Commits early, optimizes input cadence, and looks two obstacles ahead.',
        look: {
          hair: '#1d1a2a',
          skin: '#e0ac7e',
          top: '#c43c3c',
          bottom: '#2b2733',
          shoes: '#ffd166',
        },
        focusSkills: ['reflexes', 'timing', 'processing-speed', 'action'],
        moods: ['grit', 'focus'],
        playsOnGame: 3,
        totalRuns: 18,
        bestScoreOnGame: null,
        lastScoreOnGame: null,
        topSkills: [
          { slug: 'reflexes', score: 88 },
          { slug: 'timing', score: 84 },
          { slug: 'processing-speed', score: 81 },
        ],
        calibration: null,
        gameNote: BUILTIN_GAME_TACTICS[targetGameKey]?.note || 'Commit early and keep your eyes ahead of the active piece.',
        recentChoiceReason: 'Training high-tempo reaction consistency without sacrificing combo chains.',
        recentMoveThought: null,
      },
      dir: stateDir,
      memory: {},
      profile: {},
      coach: {},
      playbooks: {},
      recentEntries: [],
    });
  }

  return out;
}

function normText(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 90);
}

/** Extract curated tips & thoughts for a game from the selected AI coach + peers + built-in fallback. */
export function collectGameTipsAndThoughts(
  personas: LoadedPersona[],
  selectedCoach: LoadedPersona,
  rawGameSlug: string
): { tips: CoachTipItem[]; thoughts: string[] } {
  const gameKey = normalizeGameKey(rawGameSlug);
  const seen = new Set<string>();
  const tips: CoachTipItem[] = [];
  const thoughts: string[] = [];

  const pushTip = (item: Omit<CoachTipItem, 'id'>) => {
    const clean = (item.text || '').trim();
    if (!clean || clean.length < 8) return;
    // Skip overly low-level pixel coordinate or single-step board-state strings from small play models
    if (
      /hold for \d{3,5}ms/i.test(clean) ||
      /tap\(\d+\.\d+/i.test(clean) ||
      /tapping (the )?center/i.test(clean) ||
      /rotate (left|right) (once|twice) to (let|land|match)/i.test(clean) ||
      /when the word is (red|blue|green|yellow) and ink is/i.test(clean) ||
      /when the word and ink differ, answer the ink/i.test(clean)
    ) {
      return;
    }
    const nk = normText(clean);
    if (!nk || seen.has(nk)) return;
    seen.add(nk);
    tips.push({
      ...item,
      id: `${item.fromId}-${tips.length + 1}`,
      text: clean,
    });
  };

  // 1. Selected coach's own game note & thoughts
  if (selectedCoach.summary.gameNote && !selectedCoach.summary.gameNote.startsWith('last ')) {
    thoughts.push(selectedCoach.summary.gameNote);
    pushTip({
      kind: 'thought',
      text: selectedCoach.summary.gameNote,
      rationale: `${selectedCoach.summary.name}'s reflection after playing ${gameKey.replace(/-/g, ' ')}`,
      fromId: selectedCoach.summary.id,
      fromName: selectedCoach.summary.name,
      fromKind: selectedCoach.summary.kind,
      fromLabel: selectedCoach.summary.label,
      fromLook: selectedCoach.summary.look,
      gameSlug: gameKey,
      count: Math.max(1, selectedCoach.summary.playsOnGame),
      stage: 'thought',
    });
  }
  if (selectedCoach.summary.recentChoiceReason) {
    thoughts.push(selectedCoach.summary.recentChoiceReason);
  }
  if (selectedCoach.summary.recentMoveThought && selectedCoach.summary.recentMoveThought !== selectedCoach.summary.recentChoiceReason) {
    thoughts.push(selectedCoach.summary.recentMoveThought);
  }

  // 2. Lessons from selected coach and peer personas
  const orderedPersonas = [
    selectedCoach,
    ...personas.filter((p) => p.summary.id !== selectedCoach.summary.id),
  ];

  for (const p of orderedPersonas) {
    // Playbook entries on this game
    const pb = p.playbooks[gameKey];
    if (pb) {
      for (const w of pb.worked || []) {
        const txt = typeof w === 'string' ? w : w?.tip;
        if (txt) {
          pushTip({
            kind: 'works',
            text: String(txt),
            rationale: `Playbook tactic from ${p.summary.name}`,
            fromId: p.summary.id,
            fromName: p.summary.name,
            fromKind: p.summary.kind,
            fromLabel: p.summary.label,
            fromLook: p.summary.look,
            gameSlug: gameKey,
            count: Number(w?.count || 1),
            stage: Number(w?.count || 1) >= 2 ? 'consolidated' : 'candidate',
          });
        }
      }
      for (const f of pb.failed || []) {
        const txt = typeof f === 'string' ? f : f?.tip;
        if (txt) {
          pushTip({
            kind: 'avoid',
            text: String(txt),
            rationale: `Trap encountered by ${p.summary.name}`,
            fromId: p.summary.id,
            fromName: p.summary.name,
            fromKind: p.summary.kind,
            fromLabel: p.summary.label,
            fromLook: p.summary.look,
            gameSlug: gameKey,
            count: Number(f?.count || 1),
            stage: 'candidate',
          });
        }
      }
    }

    // Memory lessons on this game
    const memLessons = Array.isArray(p.memory?.lessons) ? p.memory.lessons : [];
    for (const l of memLessons) {
      const lGames: string[] = Array.isArray(l?.games) ? l.games : [];
      if (!lGames.some((g) => gameMatches(g, gameKey))) continue;
      const rawText = String(l?.text || '');
      if (!rawText || /^why is .+ so hard for me/i.test(rawText) || /^i (over|under)-estimated my/i.test(rawText)) {
        continue;
      }
      const kind: TipKind = l.kind === 'failed' ? 'avoid' : l.kind === 'question' ? 'question' : 'works';
      const tests = Array.isArray(l.tests) ? l.tests : [];
      const lastTest = tests.length ? tests[tests.length - 1] : null;
      pushTip({
        kind,
        text: rawText,
        rationale: `Learned over ${l.count || 1} session(s) by ${p.summary.name}`,
        fromId: p.summary.id,
        fromName: p.summary.name,
        fromKind: p.summary.kind,
        fromLabel: p.summary.label,
        fromLook: p.summary.look,
        gameSlug: gameKey,
        count: Number(l.count || 1),
        stage: lastTest?.verdict === 'helps' ? 'validated' : Number(l.count || 1) >= 2 ? 'consolidated' : 'candidate',
        netDelta: typeof lastTest?.delta === 'number' ? lastTest.delta : null,
      });
    }

    // Game note from peers
    if (p.summary.id !== selectedCoach.summary.id && p.summary.gameNote && !p.summary.gameNote.startsWith('last ')) {
      pushTip({
        kind: 'thought',
        text: p.summary.gameNote,
        rationale: `${p.summary.name}'s note after playing`,
        fromId: p.summary.id,
        fromName: p.summary.name,
        fromKind: p.summary.kind,
        fromLabel: p.summary.label,
        fromLook: p.summary.look,
        gameSlug: gameKey,
        count: Math.max(1, p.summary.playsOnGame),
        stage: 'thought',
      });
    }

    // Coach tips received/adopted on this game
    const coachTips = Array.isArray(p.coach?.tips) ? p.coach.tips : [];
    for (const ct of coachTips) {
      if (!gameMatches(String(ct?.game || ''), gameKey)) continue;
      if (ct?.status === 'falsified' || ct?.status === 'dismissed') continue;
      const kind: TipKind = ct.kind === 'avoid' || ct.kind === 'failed' ? 'avoid' : ct.kind === 'question' ? 'question' : 'works';
      pushTip({
        kind,
        text: String(ct.text || ''),
        rationale: ct.rationale || `Shared by ${ct.from_name || 'Coach'}`,
        fromId: String(ct.from_id || 'human'),
        fromName: String(ct.from_name || 'Community Coach'),
        fromKind: ct.from_kind === 'human' ? 'human' : 'agent',
        gameSlug: gameKey,
        count: Number(ct.count || 1),
        stage: ct.status === 'validated' ? 'validated' : ct.status === 'adopted' ? 'adopted' : 'candidate',
        netDelta: typeof ct.delivery?.score_delta === 'number' ? ct.delivery.score_delta : null,
      });
    }
  }

  // 3. Built-in tactical knowledge base so every game has crisp worked/avoid/question tips
  const builtin = BUILTIN_GAME_TACTICS[gameKey] || {
    works: [
      `Take the first 5 seconds to read ${gameKey.replace(/-/g, ' ')}’s visual cues and establish a steady input rhythm before speeding up.`,
      'Anchor your attention on incoming patterns one step ahead rather than reacting only at the moment of contact.',
    ],
    avoid: [
      'Avoid rapid impulse-tapping after a mistake — a brief 200ms reset prevents cascading errors.',
    ],
    question: [
      'Does deliberate pacing in the opening 30 seconds yield a higher final score than rushing from the start?',
    ],
    note: 'Steady rhythm and looking one step ahead consistently outperform frantic inputs.',
  };

  if (thoughts.length === 0 && builtin.note) {
    thoughts.push(builtin.note);
  }

  for (const w of builtin.works) {
    if (tips.filter((t) => t.kind === 'works').length < 3) {
      pushTip({
        kind: 'works',
        text: w,
        rationale: `${selectedCoach.summary.name}'s core playbook tactic for ${gameKey.replace(/-/g, ' ')}`,
        fromId: selectedCoach.summary.id,
        fromName: selectedCoach.summary.name,
        fromKind: 'agent',
        fromLabel: selectedCoach.summary.label,
        fromLook: selectedCoach.summary.look,
        gameSlug: gameKey,
        count: Math.max(1, selectedCoach.summary.playsOnGame || 2),
        stage: 'consolidated',
      });
    }
  }

  for (const av of builtin.avoid) {
    if (tips.filter((t) => t.kind === 'avoid').length < 2) {
      pushTip({
        kind: 'avoid',
        text: av,
        rationale: `Common trap identified by ${selectedCoach.summary.name}`,
        fromId: selectedCoach.summary.id,
        fromName: selectedCoach.summary.name,
        fromKind: 'agent',
        fromLabel: selectedCoach.summary.label,
        fromLook: selectedCoach.summary.look,
        gameSlug: gameKey,
        count: 1,
        stage: 'consolidated',
      });
    }
  }

  for (const q of builtin.question) {
    if (tips.filter((t) => t.kind === 'question').length < 1) {
      pushTip({
        kind: 'question',
        text: q,
        rationale: `Hypothesis ${selectedCoach.summary.name} is testing`,
        fromId: selectedCoach.summary.id,
        fromName: selectedCoach.summary.name,
        fromKind: 'agent',
        fromLabel: selectedCoach.summary.label,
        fromLook: selectedCoach.summary.look,
        gameSlug: gameKey,
        count: 1,
        stage: 'candidate',
      });
    }
  }

  return { tips, thoughts };
}

/** Synthesize a light, conversational Pre-Game Briefing combining Player Profile + AI Agent Expertise. */
export function buildPreGameBriefing(
  rawGameSlug: string,
  playerExp: PlayerExperienceInput = {},
  preferredCoachId?: string
): PreGameCoachBriefing {
  const gameKey = normalizeGameKey(rawGameSlug);
  const gameTitle =
    playerExp.gameTitle ||
    gameKey
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const allPersonas = loadAllPersonas(gameKey);
  const agentPersonas = allPersonas.filter((p) => p.summary.kind === 'agent');

  // Sort agents so the one with the most plays on this game comes first
  agentPersonas.sort((a, b) => b.summary.playsOnGame - a.summary.playsOnGame || b.summary.totalRuns - a.summary.totalRuns);

  const selectedLoaded =
    (preferredCoachId && agentPersonas.find((p) => p.summary.id === preferredCoachId)) ||
    agentPersonas[0] ||
    allPersonas[0];

  const coach = selectedLoaded.summary;
  const { tips, thoughts } = collectGameTipsAndThoughts(allPersonas, selectedLoaded, gameKey);

  // 1. Light analysis of the player's profile and past experience on this game
  const sessionsPlayed = Number(playerExp.sessionsPlayed || 0);
  const bestScore = playerExp.bestScore ?? null;
  const lastScore = playerExp.lastScore ?? null;
  const lastFlow = playerExp.lastFlowScore ?? playerExp.lastFlow ?? null;
  const gameSkills = playerExp.gameSkills && playerExp.gameSkills.length ? playerExp.gameSkills : coach.focusSkills.slice(0, 2);
  const rawProfileSkills = playerExp.profileSkills || {};
  const profileSkills: Record<string, { score: number; delta?: number | null }> = {};
  for (const [k, v] of Object.entries(rawProfileSkills)) {
    if (typeof v === 'number') {
      profileSkills[k] = { score: v };
    } else if (v && typeof v.score === 'number') {
      profileSkills[k] = v;
    }
  }

  // Find player's strongest or developing skill among the ones this game exercises
  let skillCallout = '';
  const matchedSkillEntries = gameSkills
    .map((s) => ({ slug: s, stat: profileSkills[s] }))
    .filter((x) => x.stat && typeof x.stat.score === 'number');

  if (matchedSkillEntries.length > 0) {
    matchedSkillEntries.sort((a, b) => (b.stat?.score || 0) - (a.stat?.score || 0));
    const top = matchedSkillEntries[0];
    const skillName = top.slug.replace(/-/g, ' ');
    const deltaStr =
      typeof top.stat?.delta === 'number' && top.stat.delta !== 0
        ? ` (${top.stat.delta > 0 ? '+' : ''}${Math.round(top.stat.delta)} vs baseline)`
        : '';
    skillCallout = `Your ${skillName} sits at ${Math.round(top.stat!.score)}/100${deltaStr}`;
  } else if (Object.keys(profileSkills).length > 0) {
    const topAny = Object.entries(profileSkills).sort((a, b) => b[1].score - a[1].score)[0];
    if (topAny) {
      skillCallout = `Your top profile skill is ${topAny[0].replace(/-/g, ' ')} (${Math.round(topAny[1].score)}/100)`;
    }
  }

  let profileAnalysis = '';
  if (sessionsPlayed > 0) {
    const scoreBits: string[] = [`${sessionsPlayed} ${sessionsPlayed === 1 ? 'run' : 'runs'} logged`];
    if (bestScore !== null && bestScore > 0) scoreBits.push(`PB ${bestScore.toLocaleString()}`);
    if (lastScore !== null && lastScore > 0 && lastScore !== bestScore) scoreBits.push(`last ${lastScore.toLocaleString()}`);
    if (lastFlow !== null && lastFlow > 0) scoreBits.push(`flow ${Math.round(lastFlow)}%`);
    const targetNext =
      bestScore && lastScore
        ? Math.max(1, Math.round(bestScore * 0.45 + lastScore * 0.6))
        : bestScore
        ? Math.round(bestScore * 1.05)
        : null;
    profileAnalysis = `You have ${scoreBits.join(' · ')} on ${gameTitle}. ${
      skillCallout ? `${skillCallout}. ` : ''
    }${targetNext ? `A steady target for this session is ~${targetNext.toLocaleString()}.` : ''}`.trim();
  } else {
    const trainedList = gameSkills.slice(0, 2).map((s) => s.replace(/-/g, ' ')).join(' & ') || 'focus & timing';
    profileAnalysis = `First run on ${gameTitle}! This game exercises ${trainedList}.${
      skillCallout ? ` ${skillCallout} — great foundation to build from.` : ' Play a steady opening minute to set your baseline.'
    }`;
  }

  // 2. Coach greeting in character
  const playsBadge = coach.playsOnGame > 0 ? `after ${coach.playsOnGame} ${coach.playsOnGame === 1 ? 'session' : 'sessions'} here` : 'from my arcade playbook';
  const mainThought =
    thoughts[0] ||
    tips.find((t) => t.kind === 'works')?.text ||
    `Focus on a deliberate rhythm in the opening 30 seconds.`;
  const coachGreeting = `Hey, I'm ${coach.name} (${coach.label}). Speaking ${playsBadge}: "${mainThought}"`;

  // 3. Community / human lessons for this game
  const allCommunityLessons = getUserLessons({ gameSlug: gameKey });

  return {
    gameSlug: gameKey,
    gameTitle,
    selectedCoach: coach,
    availableCoaches: agentPersonas.map((p) => p.summary),
    profileAnalysis,
    coachGreeting,
    characterThoughts: thoughts.slice(0, 3),
    tips: tips.slice(0, 6),
    communityLessons: allCommunityLessons.slice(0, 4),
  };
}

/** Synthesize a real-time whisper during active gameplay based on live trigger or player question. */
export function generateRealtimeWhisper(params: {
  gameSlug: string;
  coachId?: string;
  trigger: 'opening' | 'cadence' | 'milestone' | 'adjustment' | 'ask';
  score?: number | null;
  bestScore?: number | null;
  inputCount?: number;
  elapsedSeconds?: number;
  adjustmentName?: string;
  adjustmentValue?: any;
  question?: string;
  alreadySentIds?: string[];
}): {
  tip: CoachTipItem;
  rationale: string;
  coach: CoachPersonaSummary;
} {
  const gameKey = normalizeGameKey(params.gameSlug);
  const allPersonas = loadAllPersonas(gameKey);
  const agentPersonas = allPersonas.filter((p) => p.summary.kind === 'agent');
  const selectedLoaded =
    (params.coachId && agentPersonas.find((p) => p.summary.id === params.coachId)) ||
    agentPersonas[0] ||
    allPersonas[0];
  const coach = selectedLoaded.summary;
  const { tips, thoughts } = collectGameTipsAndThoughts(allPersonas, selectedLoaded, gameKey);
  const sentSet = new Set(params.alreadySentIds || []);

  const worksList = tips.filter((t) => t.kind === 'works');
  const avoidList = tips.filter((t) => t.kind === 'avoid');
  const questionList = tips.filter((t) => t.kind === 'question');

  let chosenKind: TipKind = 'whisper';
  let chosenText = '';
  let rationale = '';

  const qLower = (params.question || '').toLowerCase();

  if (params.trigger === 'adjustment' && params.adjustmentName) {
    chosenKind = 'whisper';
    const paramLabel = params.adjustmentName.replace(/[_-]/g, ' ');
    const tactic = worksList[0]?.text || 'Stay anchored and read one move ahead.';
    chosenText = `Live adjustment (${paramLabel} → ${params.adjustmentValue}): ${tactic}`;
    rationale = `${coach.name} noticed the game adapted its ${paramLabel}.`;
  } else if (params.trigger === 'cadence') {
    chosenKind = 'avoid';
    const trap = avoidList[0]?.text || 'Pause 200ms before your next input so you do not force an unaligned move.';
    chosenText = `High input pace detected — ${trap.charAt(0).toLowerCase() + trap.slice(1)}`;
    rationale = `${coach.name} spotted rapid inputs and shared a trap to avoid.`;
  } else if (params.trigger === 'milestone') {
    chosenKind = 'whisper';
    const scoreVal = params.score || 0;
    const pbVal = params.bestScore || 0;
    const tactic = worksList[1]?.text || worksList[0]?.text || 'Keep your current rhythm and avoid high-risk reversals.';
    if (pbVal > 0 && scoreVal >= pbVal * 0.85) {
      chosenText = `Score ${scoreVal.toLocaleString()} is closing in on your PB (${pbVal.toLocaleString()})! ${tactic}`;
      rationale = `Approaching your personal best on ${gameKey.replace(/-/g, ' ')}.`;
    } else {
      chosenText = `Strong momentum (${scoreVal.toLocaleString()} pts) — ${tactic}`;
      rationale = `Mid-session momentum check from ${coach.name}.`;
    }
  } else if (params.trigger === 'ask' && qLower) {
    if (qLower.includes('avoid') || qLower.includes('mistake') || qLower.includes('trap') || qLower.includes('fail')) {
      chosenKind = 'avoid';
      chosenText = avoidList[0]?.text || 'Avoid rushing consecutive moves without checking board alignment.';
      rationale = `${coach.name}'s top pitfall to avoid on ${gameKey.replace(/-/g, ' ')}.`;
    } else if (qLower.includes('thought') || qLower.includes('why') || qLower.includes('reason') || qLower.includes('feel')) {
      chosenKind = 'thought';
      chosenText =
        thoughts[0] ||
        coach.recentChoiceReason ||
        `I focus on ${coach.focusSkills.slice(0, 2).join(' and ')} here—staying deliberate beats guessing.`;
      rationale = `From ${coach.name}'s session log (${coach.playsOnGame || 1} runs).`;
    } else if (qLower.includes('test') || qLower.includes('question') || qLower.includes('hypothesis')) {
      chosenKind = 'question';
      chosenText = questionList[0]?.text || 'Try testing whether a slower opening cadence yields a higher 2-minute score.';
      rationale = `Open question ${coach.name} is testing in LLM Island.`;
    } else {
      const unshown = tips.find((t) => !sentSet.has(t.id)) || worksList[0] || tips[0];
      chosenKind = unshown?.kind || 'works';
      chosenText = unshown?.text || 'Keep a steady rhythm and look one step ahead.';
      rationale = unshown?.rationale || `Shared by ${coach.name}.`;
    }
  } else {
    // 'opening' or general next tip
    const candidate = tips.find((t) => !sentSet.has(t.id)) || worksList[0] || tips[0];
    chosenKind = candidate?.kind || 'works';
    chosenText = candidate?.text || 'Establish a calm, steady rhythm in the first 30 seconds.';
    rationale = candidate?.rationale || `${coach.name}'s opening tip for ${gameKey.replace(/-/g, ' ')}.`;
  }

  const tipItem: CoachTipItem = {
    id: `${coach.id}-${params.trigger}-${Date.now()}`,
    kind: chosenKind,
    text: chosenText,
    rationale,
    fromId: coach.id,
    fromName: coach.name,
    fromKind: coach.kind,
    fromLabel: coach.label,
    fromLook: coach.look,
    gameSlug: gameKey,
    count: Math.max(1, coach.playsOnGame),
    stage: 'consolidated',
    createdAt: new Date().toISOString(),
  };

  return {
    tip: tipItem,
    rationale,
    coach,
  };
}

/** Save a lesson learned by a human player, attach it to their profile, and share it with AI agents / other players. */
export function saveUserLesson(input: {
  userId: string;
  userName?: string;
  gameSlug: string;
  gameTitle?: string;
  kind: 'works' | 'avoid' | 'question';
  text: string;
  score?: number | null;
  targetMood?: string;
  shareTo?: string; // 'all' | 'agents' | 'humans' | personaId
}): UserSharedLesson {
  const stateDir = getIslandStateDir();
  const cleanUserId = (input.userId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 36) || 'guest';
  const personaId = `player-${cleanUserId.slice(0, 12).toLowerCase()}`;
  const userName = (input.userName || '').trim() || 'Skillprint Player';
  const gameKey = normalizeGameKey(input.gameSlug);
  const gameTitle =
    (input.gameTitle || '').trim() ||
    gameKey
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  const cleanText = (input.text || '').trim().replace(/\s+/g, ' ').slice(0, 220);
  if (!cleanText) {
    throw new Error('Lesson text is required');
  }
  const kind: 'works' | 'avoid' | 'question' =
    input.kind === 'avoid' ? 'avoid' : input.kind === 'question' ? 'question' : 'works';
  const shareTo = (input.shareTo || 'all').trim();
  const stamp = new Date().toISOString();

  // 1. Ensure human persona exists in `llm-island/state/personas/<personaId>`
  const humanDir = path.join(stateDir, 'personas', personaId);
  fs.mkdirSync(humanDir, { recursive: true });
  const personaPath = path.join(humanDir, 'persona.json');
  const existingPersona = readJsonSafe<Record<string, any>>(personaPath, {});
  if (!existingPersona.id) {
    writeJsonAtomic(personaPath, {
      id: personaId,
      name: userName,
      kind: 'human',
      archetype: 'human',
      label: 'Human Player',
      temperament: 'A real player on Skillprint sharing lessons with humans and AI agents.',
      focus: ['attention', 'planning', 'spatial', 'reflexes', 'memory'],
      moods: [input.targetMood || 'focus', 'curiosity'],
      look: {
        hair: '#2c3e50',
        skin: '#f1c9a5',
        top: '#573eeb',
        bottom: '#2b2733',
        shoes: '#f6f1e7',
      },
      player_id: input.userId || personaId,
      created: stamp,
    });
  }

  // 2. Attach lesson to human persona's `memory.json` and `playbooks/<gameKey>.json`
  const memPath = path.join(humanDir, 'memory.json');
  const mem = readJsonSafe<Record<string, any>>(memPath, {
    about: {},
    lessons: [],
    games: {},
    next_id: 1,
    reflections: 0,
    updated: null,
  });
  const memKind = kind === 'avoid' ? 'failed' : kind;
  const lessonsArr: any[] = Array.isArray(mem.lessons) ? mem.lessons : [];
  const normKey = normText(cleanText);
  let matchedLesson = lessonsArr.find((l) => normText(String(l.text || '')) === normKey);
  if (matchedLesson) {
    matchedLesson.count = Number(matchedLesson.count || 1) + 1;
    matchedLesson.updated = stamp;
    if (!Array.isArray(matchedLesson.games)) matchedLesson.games = [];
    if (!matchedLesson.games.includes(gameKey)) matchedLesson.games.push(gameKey);
  } else {
    const lid = Number(mem.next_id || 1);
    mem.next_id = lid + 1;
    matchedLesson = {
      id: lid,
      kind: memKind,
      text: cleanText,
      count: 1,
      games: [gameKey],
      ticks: [`portal-${Date.now()}`],
      created: stamp,
      updated: stamp,
    };
    lessonsArr.push(matchedLesson);
  }
  mem.lessons = lessonsArr;
  if (!mem.games || typeof mem.games !== 'object') mem.games = {};
  mem.games[gameKey] = {
    note: cleanText,
    updated: stamp,
  };
  mem.reflections = Number(mem.reflections || 0) + 1;
  mem.updated = stamp;
  writeJsonAtomic(memPath, mem);

  // Also update human persona's per-game playbook
  if (kind === 'works' || kind === 'avoid') {
    const pbDir = path.join(humanDir, 'playbooks');
    fs.mkdirSync(pbDir, { recursive: true });
    const pbPath = path.join(pbDir, `${gameKey}.json`);
    const pb = readJsonSafe<Record<string, any>>(pbPath, {
      game: gameKey,
      runs: 0,
      best_score: 0,
      next_id: 1,
      worked: [],
      failed: [],
    });
    pb.runs = Number(pb.runs || 0) + 1;
    if (typeof input.score === 'number') {
      pb.best_score = Math.max(Number(pb.best_score || 0), input.score);
    }
    const bucket = kind === 'works' ? 'worked' : 'failed';
    const arr: any[] = Array.isArray(pb[bucket]) ? pb[bucket] : [];
    const existingPb = arr.find((e) => normText(String(e.tip || '')) === normKey);
    if (existingPb) {
      existingPb.count = Number(existingPb.count || 1) + 1;
    } else {
      const nid = Number(pb.next_id || 1);
      pb.next_id = nid + 1;
      arr.push({
        id: nid,
        tip: cleanText,
        count: 1,
        first_run: pb.runs,
        last_run: pb.runs,
        best_score: input.score ?? 0,
      });
    }
    pb[bucket] = arr;
    writeJsonAtomic(pbPath, pb);
  }

  // 3. Deliver to target AI personas' `coach.json` inboxes in LLM Island
  const attributions: UserSharedLesson['attributions'] = [];
  if (shareTo !== 'private' && shareTo !== 'humans') {
    const allPersonas = loadAllPersonas(gameKey).filter((p) => p.summary.kind === 'agent');
    const targetAgents =
      shareTo === 'all' || shareTo === 'agents'
        ? allPersonas
        : allPersonas.filter((p) => p.summary.id === shareTo);

    for (const agent of targetAgents) {
      // Only write to real directories on disk (root `island` or `state/personas/<id>`)
      const agentDir =
        agent.summary.id === 'island'
          ? stateDir
          : path.join(stateDir, 'personas', agent.summary.id);
      fs.mkdirSync(agentDir, { recursive: true });
      const agentStatus = readJsonSafe<Record<string, any>>(path.join(agentDir, 'status.json'), {});
      const isPlayingNow =
        agentStatus?.phase === 'playing' &&
        (gameMatches(String(agentStatus.game || ''), gameKey) || !agentStatus.game);
      const deliveryMode = isPlayingNow ? 'realtime' : 'pre_session';
      const coachPath = path.join(agentDir, 'coach.json');
      const cData = readJsonSafe<Record<string, any>>(coachPath, {
        tips: [],
        given: [],
        watch_events: [],
        stats: { received: 0, delivered: 0, adopted: 0, validated: 0, given: 0 },
        next_id: 1,
        updated: null,
      });

      const tipsList: any[] = Array.isArray(cData.tips) ? cData.tips : [];
      let existingTip = tipsList.find(
        (t) => gameMatches(String(t.game || ''), gameKey) && normText(String(t.text || '')) === normKey
      );
      if (existingTip) {
        existingTip.count = Number(existingTip.count || 1) + 1;
        existingTip.updated = stamp;
      } else {
        const tid = Number(cData.next_id || 1);
        cData.next_id = tid + 1;
        existingTip = {
          id: tid,
          game: gameKey,
          text: cleanText,
          kind,
          mode: deliveryMode,
          from_id: personaId,
          from_name: userName,
          from_kind: 'human',
          to_id: agent.summary.id,
          rationale: `Shared from Skillprint session on ${gameTitle}${
            typeof input.score === 'number' ? ` (score ${input.score.toLocaleString()})` : ''
          }`,
          count: 1,
          status: 'queued',
          created: stamp,
          updated: stamp,
          delivery: null,
          tests: [],
          context: {
            source: 'skillprint-portal',
            userId: input.userId,
            score: input.score ?? null,
          },
        };
        tipsList.push(existingTip);
        if (!cData.stats) cData.stats = {};
        cData.stats.received = Number(cData.stats.received || 0) + 1;
      }
      cData.tips = tipsList.slice(-120);
      cData.updated = stamp;
      writeJsonAtomic(coachPath, cData);

      // Append to agent's session.jsonl so it appears in the LLM Island live log
      const modeBadge =
        deliveryMode === 'realtime'
          ? '⚡ live tip queued for next step'
          : '📋 pre-session tip queued';
      appendJsonLine(path.join(agentDir, 'session.jsonl'), {
        at: stamp,
        kind: 'coach',
        text: `${userName} (human) → ${agent.summary.name} on ${gameKey} [${modeBadge}]: "${cleanText}"`,
        game: gameKey,
        tip_id: existingTip.id,
        from_id: personaId,
        from_name: userName,
        from_kind: 'human',
        to_id: agent.summary.id,
        kind_of: kind,
        mode: deliveryMode,
      });

      attributions.push({
        personaId: agent.summary.id,
        personaName: agent.summary.name,
        personaKind: 'agent',
        status: existingTip.status || 'queued',
        scoreDelta: existingTip.delivery?.score_delta ?? null,
      });
    }
  }

  // 4. Record in `portal_lessons.json` for fast profile + community lookup
  const indexFile = path.join(stateDir, 'portal_lessons.json');
  const existingIndex = readJsonSafe<UserSharedLesson[]>(indexFile, []);
  const lessonRecord: UserSharedLesson = {
    id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: input.userId || 'guest',
    userName,
    gameSlug: gameKey,
    gameTitle,
    kind,
    text: cleanText,
    score: input.score ?? null,
    targetMood: input.targetMood,
    shareTo,
    createdAt: stamp,
    attributions,
    helpfulCount: 1,
  };
  const deduped = existingIndex.filter(
    (item) => !(item.userId === lessonRecord.userId && item.gameSlug === gameKey && normText(item.text) === normKey)
  );
  deduped.unshift(lessonRecord);
  writeJsonAtomic(indexFile, deduped.slice(0, 200));

  return lessonRecord;
}

/** Retrieve shared lessons (filtered by userId and/or gameSlug), enriched with live AI agent adoption/validation status. */
export function getUserLessons(filter: { userId?: string; gameSlug?: string } = {}): UserSharedLesson[] {
  const stateDir = getIslandStateDir();
  const indexFile = path.join(stateDir, 'portal_lessons.json');
  const rows = readJsonSafe<UserSharedLesson[]>(indexFile, []);

  // Load current coach.json files across all agents to refresh attribution status (`queued` -> `delivered` -> `adopted` -> `validated`)
  const allPersonas = loadAllPersonas(filter.gameSlug || 'hextris');
  const agentCoachMap = new Map<string, { name: string; tips: any[] }>();
  for (const p of allPersonas) {
    if (p.summary.kind === 'agent') {
      agentCoachMap.set(p.summary.id, {
        name: p.summary.name,
        tips: Array.isArray(p.coach?.tips) ? p.coach.tips : [],
      });
    }
  }

  const enriched = rows.map((lesson) => {
    const nk = normText(lesson.text);
    const updatedAttributions: UserSharedLesson['attributions'] = [];

    for (const [agentId, agentInfo] of agentCoachMap.entries()) {
      const matched = agentInfo.tips.find(
        (t) => gameMatches(String(t.game || ''), lesson.gameSlug) && normText(String(t.text || '')) === nk
      );
      if (matched) {
        const tests = Array.isArray(matched.tests) ? matched.tests : [];
        const lastTest = tests.length ? tests[tests.length - 1] : null;
        updatedAttributions.push({
          personaId: agentId,
          personaName: agentInfo.name,
          personaKind: 'agent',
          status: matched.status || 'queued',
          scoreDelta: matched.delivery?.score_delta ?? lastTest?.delta ?? null,
          evidence: lastTest
            ? `${lastTest.verdict === 'helps' ? '✔' : '·'}${Number(lastTest.delta || 0) >= 0 ? '+' : ''}${lastTest.delta || 0} on ${lastTest.game}`
            : undefined,
        });
      }
    }

    return {
      ...lesson,
      attributions: updatedAttributions.length > 0 ? updatedAttributions : lesson.attributions || [],
    };
  });

  return enriched.filter((item) => {
    if (filter.userId && item.userId !== filter.userId) return false;
    if (filter.gameSlug && !gameMatches(item.gameSlug, normalizeGameKey(filter.gameSlug))) return false;
    return true;
  });
}

/** Record whether a coach tip helped a player during their session. */
export function rateCoachTip(input: {
  tipText: string;
  fromId: string;
  gameSlug: string;
  helped: boolean;
  scoreDelta?: number | null;
}): { ok: boolean } {
  const stateDir = getIslandStateDir();
  const gameKey = normalizeGameKey(input.gameSlug);
  const nk = normText(input.tipText);

  // If it matches a community lesson in portal_lessons.json, bump helpfulCount
  const indexFile = path.join(stateDir, 'portal_lessons.json');
  const lessons = readJsonSafe<UserSharedLesson[]>(indexFile, []);
  let changed = false;
  for (const l of lessons) {
    if (gameMatches(l.gameSlug, gameKey) && normText(l.text) === nk) {
      if (input.helped) {
        l.helpfulCount = Number(l.helpfulCount || 1) + 1;
        changed = true;
      }
    }
  }
  if (changed) {
    writeJsonAtomic(indexFile, lessons);
  }

  // Also update the sender AI persona's coach.json stats (`given` / `adopted`)
  if (input.fromId) {
    const senderDir =
      input.fromId === 'island' ? stateDir : path.join(stateDir, 'personas', input.fromId);
    if (fs.existsSync(senderDir)) {
      const coachPath = path.join(senderDir, 'coach.json');
      const cData = readJsonSafe<Record<string, any>>(coachPath, {
        tips: [],
        given: [],
        watch_events: [],
        stats: { received: 0, delivered: 0, adopted: 0, validated: 0, given: 0 },
        next_id: 1,
        updated: null,
      });
      if (!cData.stats) cData.stats = {};
      cData.stats.given = Number(cData.stats.given || 0) + 1;
      if (input.helped) {
        cData.stats.adopted = Number(cData.stats.adopted || 0) + 1;
      }
      if (!Array.isArray(cData.given)) cData.given = [];
      cData.given.push({
        game: gameKey,
        text: input.tipText,
        helped: input.helped,
        score_delta: input.scoreDelta ?? null,
        at: new Date().toISOString(),
      });
      cData.given = cData.given.slice(-60);
      writeJsonAtomic(coachPath, cData);
    }
  }

  return { ok: true };
}
