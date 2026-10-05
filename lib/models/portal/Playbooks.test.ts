import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlaybookDetail, normalizePlaybookSummary } from './Playbooks';

const assignedWire = {
  slug: 'coach-warm-up-abc123',
  title: 'Warm-up',
  source: 'assigned',
  pillar: 'cognition',
  assignmentId: '41',
  assignedByName: 'Dana Whitfield',
  note: 'Before Tuesday.',
  dueAt: '2026-10-09T23:59:59.999999-07:00',
  status: 'in_progress',
  dismissedAt: null,
  progress: { totalGames: 2, playedGames: 1, percent: 50 },
  games: [],
  targetSkills: [],
} as const;

test('an assigned source survives normalising instead of becoming authored', () => {
  assert.equal(normalizePlaybookSummary({ ...assignedWire } as any).source, 'assigned');
});

test('the flat assignment fields are gathered into `assignment`', () => {
  const detail = normalizePlaybookDetail({ ...assignedWire } as any);
  assert.deepEqual(detail.assignment, {
    assignmentId: '41',
    assignedByName: 'Dana Whitfield',
    note: 'Before Tuesday.',
    dueAt: '2026-10-09T23:59:59.999999-07:00',
    status: 'in_progress',
    dismissedAt: null,
  });
});

test('authored and generated playbooks carry no assignment', () => {
  assert.equal(normalizePlaybookDetail({ slug: 'deep-focus', source: 'authored' } as any).assignment, undefined);
  assert.equal(normalizePlaybookDetail({ slug: 'cognition-memory' } as any).source, 'generated');
  assert.equal(normalizePlaybookDetail({ slug: 'cognition-memory' } as any).assignment, undefined);
});

test('stray assignment fields on a non-assigned playbook are ignored', () => {
  const detail = normalizePlaybookDetail({ slug: 'deep-focus', source: 'authored', assignmentId: '9' } as any);
  assert.equal(detail.assignment, undefined);
});
