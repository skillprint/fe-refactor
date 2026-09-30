/**
 * When to offer the email prompt (SKI-265), remembered per player on this
 * device.
 *
 * * "Not now" hides it for 14 days.
 * * A player who says they are under 16 is not asked again: email is for 16
 *   and over in v1 (SKI-261), and nothing about them is sent to the server.
 *
 * Keys carry the player's `userId` so a shared device asks each player once.
 */
const SNOOZE_DAYS = 14;

const snoozeKey = (userId: string) => `email_prompt_snoozed_until:${userId}`;
const youngKey = (userId: string) => `email_prompt_under_16:${userId}`;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode: the prompt just comes back next time.
  }
}

export function isPromptHidden(userId: string | null): boolean {
  if (!userId) return true;
  if (read(youngKey(userId))) return true;
  const until = Number(read(snoozeKey(userId)) || 0);
  return until > Date.now();
}

export function snoozePrompt(userId: string | null) {
  if (userId) write(snoozeKey(userId), String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
}

export function markUnder16(userId: string | null) {
  if (userId) write(youngKey(userId), '1');
}
