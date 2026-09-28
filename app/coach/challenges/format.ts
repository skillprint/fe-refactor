import type { CoachChallenge } from '@/lib/models/coach';
import { dimensionLabel } from '../components/ui';

/** "10 sessions each", "+4 points of Reaction time". */
export function challengeGoal(c: CoachChallenge): string {
  if (c.kind === 'Skill') return `+${c.goal} points of ${dimensionLabel(c.dimension ?? '')}`;
  return `${c.goal} ${c.metric === 'Minutes' ? 'minutes' : 'sessions'} each`;
}
