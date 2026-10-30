import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'node:os';
import {
  buildPreGameBriefing,
  generateRealtimeWhisper,
  saveUserLesson,
  getUserLessons,
  rateCoachTip,
} from './coachBridge';

test('buildPreGameBriefing loads LLM Island personas, playbooks, and thoughts for hextris', () => {
  const briefing = buildPreGameBriefing('hextris-475aff99-6346-4ea4-b432-dc8aa51f2178', {
    sessionsPlayed: 3,
    bestScore: 1420,
    lastScore: 980,
    lastFlow: 76,
    targetMood: 'Focus',
    profileSkills: {
      focus: 82,
      speed: 74,
      memory: 61,
    },
  });

  assert.equal(briefing.gameSlug, 'hextris');
  assert.ok(briefing.availableCoaches.length >= 2, 'Expected multiple AI coaches');
  assert.ok(briefing.selectedCoach.name.length > 0);
  assert.ok(briefing.profileAnalysis.includes('3 runs logged'));
  assert.ok(briefing.coachGreeting.length > 10);
  assert.ok(briefing.tips.length > 0, 'Expected playbook tips from AI coach');
});

test('generateRealtimeWhisper returns contextual tips for opening, adjustment, milestone, and ask triggers', () => {
  const opening = generateRealtimeWhisper({
    gameSlug: '2048',
    coachId: 'hana',
    trigger: 'opening',
    elapsedSeconds: 5,
  });
  assert.equal(opening.coach.name, 'Hana');
  assert.ok(opening.tip.text.length > 10);

  const adjustment = generateRealtimeWhisper({
    gameSlug: 'hextris',
    coachId: 'island',
    trigger: 'adjustment',
    adjustmentName: 'speedModifier',
    adjustmentValue: 1.2,
  });
  assert.ok(adjustment.tip.text.includes('speedModifier'));

  const askTrap = generateRealtimeWhisper({
    gameSlug: 'gummy-blocks',
    coachId: 'hana',
    trigger: 'ask',
    question: 'What trap should I avoid right now?',
  });
  assert.equal(askTrap.tip.kind, 'avoid');
  assert.ok(askTrap.tip.text.length > 5);
});

test('saveUserLesson persists to player profile and queues tip in AI agent coach.json inbox', () => {
  const tmpStateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-island-coach-test-'));
  const prevEnv = process.env.LLM_ISLAND_STATE_DIR;
  process.env.LLM_ISLAND_STATE_DIR = tmpStateDir;

  try {
    // Seed a mock hana persona directory
    const hanaDir = path.join(tmpStateDir, 'personas', 'hana');
    fs.mkdirSync(hanaDir, { recursive: true });
    fs.writeFileSync(
      path.join(hanaDir, 'persona.json'),
      JSON.stringify({
        id: 'hana',
        name: 'Hana',
        kind: 'agent',
        archetype: 'scholar',
        label: 'The Scholar',
        temperament: 'Methodical and patient.',
        look: { hair: '#2a1b4e', skin: '#f2c6a0', top: '#ff7eb6', bottom: '#2b3a55', shoes: '#f7d060' },
      }),
      'utf-8'
    );
    fs.writeFileSync(
      path.join(hanaDir, 'memory.json'),
      JSON.stringify({
        about: { games_played: { hextris: 2 } },
        games: { hextris: { note: 'Rotate early when color bars spawn.' } },
        lessons: [],
      }),
      'utf-8'
    );

    const saved = saveUserLesson({
      userId: 'user-test-42',
      userName: 'Alex',
      gameSlug: 'hextris',
      gameTitle: 'Hextris',
      kind: 'works',
      text: 'Keep the center three edges open for red and blue chains',
      shareTo: 'hana',
      score: 1850,
    });

    assert.equal(saved.userId, 'user-test-42');
    assert.equal(saved.gameSlug, 'hextris');
    assert.equal(saved.kind, 'works');
    assert.ok(saved.attributions.some((a) => a.personaId === 'hana'));

    // Verify Hana's coach.json received the queued pre_session tip
    const hanaCoachPath = path.join(hanaDir, 'coach.json');
    assert.ok(fs.existsSync(hanaCoachPath), 'Expected hana/coach.json to be created');
    const hanaCoach = JSON.parse(fs.readFileSync(hanaCoachPath, 'utf-8'));
    assert.equal(hanaCoach.tips.length, 1);
    assert.equal(hanaCoach.tips[0].game, 'hextris');
    assert.equal(hanaCoach.tips[0].kind, 'works');
    assert.equal(hanaCoach.tips[0].status, 'queued');
    assert.equal(hanaCoach.tips[0].mode, 'pre_session');

    // Verify player's own persona memory & playbook were created
    const playerPlaybookPath = path.join(
      tmpStateDir,
      'personas',
      'player-user-test-42',
      'playbooks',
      'hextris.json'
    );
    assert.ok(fs.existsSync(playerPlaybookPath), 'Expected player playbook to be created');

    // Simulate Hana adopting and validating the tip in LLM Island
    hanaCoach.tips[0].status = 'validated';
    hanaCoach.tips[0].delivery = { score_delta: 320 };
    fs.writeFileSync(hanaCoachPath, JSON.stringify(hanaCoach, null, 2), 'utf-8');

    const lessons = getUserLessons({ userId: 'user-test-42', gameSlug: 'hextris' });
    assert.equal(lessons.length, 1);
    const hanaAttr = lessons[0].attributions.find((a) => a.personaId === 'hana');
    assert.ok(hanaAttr);
    assert.equal(hanaAttr?.status, 'validated');
    assert.equal(hanaAttr?.scoreDelta, 320);

    // Rate a coach tip
    const rated = rateCoachTip({
      tipText: 'Keep the center three edges open for red and blue chains',
      fromId: 'hana',
      gameSlug: 'hextris',
      helped: true,
      scoreDelta: 190,
    });
    assert.equal(rated.ok, true);
  } finally {
    if (prevEnv === undefined) {
      delete process.env.LLM_ISLAND_STATE_DIR;
    } else {
      process.env.LLM_ISLAND_STATE_DIR = prevEnv;
    }
    fs.rmSync(tmpStateDir, { recursive: true, force: true });
  }
});
