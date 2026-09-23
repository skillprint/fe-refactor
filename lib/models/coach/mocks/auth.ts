/**
 * Mock coach credentials (SKI-213), retired with the rest by SKI-252.
 *
 * Rewritten against the real endpoints once they shipped (marketplace PR #71).
 * The first version of this file collapsed every set-password failure into one
 * message and made success send the coach back to sign in; the real API
 * distinguishes five failures and signs the coach straight in. A mock that is
 * kinder than the API it stands for is how a screen ships untested, so this
 * one now refuses in all the ways staging does.
 *
 * Deliberately not "any password works" either. There is one sign-in account
 * and a fixed set of link tokens, one per outcome, listed on the screens while
 * mocks are on so each branch can be reached by hand.
 */
import { CoachAuthError } from '../authErrors';
import type { CoachSession } from '../coachAuth';

export const MOCK_COACH_EMAIL = 'coach@northgate.edu';
/**
 * An organisation admin who also coaches — the account that can reach the
 * invite screen (SKI-256). Two accounts rather than one so the admin-only
 * surface can be seen from both sides without editing a fixture.
 */
export const MOCK_ADMIN_EMAIL = 'admin@northgate.edu';
export const MOCK_COACH_PASSWORD = 'playvs';

const MOCK_ACCOUNTS: Record<string, string> = {
  [MOCK_COACH_EMAIL]: 'Dana Whitfield',
  [MOCK_ADMIN_EMAIL]: 'Morgan Reyes',
};

/**
 * One token per set-password outcome. Invites are UUIDs and resets are
 * `r.<uid>.<token>`, the shapes the real endpoint tells them apart by.
 */
export const MOCK_LINK_TOKENS = {
  invite: '6f1c2a3e-8b4d-4c5e-9f60-1a2b3c4d5e6f',
  inviteExpired: '7a2d3b4f-9c5e-4d6f-a071-2b3c4d5e6f70',
  inviteUsed: '8b3e4c50-ad6f-4e70-b182-3c4d5e6f7081',
  inviteForwarded: '9c4f5d61-be70-4f81-c293-4d5e6f708192',
  reset: 'r.Mzk.cxn7k2-mock-reset',
} as const;

const LATENCY_MS = 420;
const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

/** Knox's default TTL on this backend is ten hours. */
const expiry = () => new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString();

export async function mockCoachLogin(email: string, password: string): Promise<CoachSession> {
  await wait();

  const address = email.trim().toLowerCase();
  if (!(address in MOCK_ACCOUNTS) || password !== MOCK_COACH_PASSWORD) {
    // The login serializer's shape, and the same message for a wrong address
    // and a wrong password: which one was wrong is not for an anonymous caller.
    throw new CoachAuthError('credentials_invalid', ['Unable to log in with provided credentials.'], 400);
  }

  return {
    token: 'mock-coach-token',
    expiry: expiry(),
    email: address,
    displayName: MOCK_ACCOUNTS[address],
  };
}

// ── forgot password ──────────────────────────────────────────────────────────

let resetRequests = 0;

export async function mockRequestPasswordReset(email: string): Promise<void> {
  await wait();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    throw new CoachAuthError('invalid_email', ['Enter a valid email address.'], 400);
  }

  // The real limit is 5 an hour per IP. Reproduced so the throttled branch of
  // the screen is reachable; it resets on reload, which the real one does not.
  resetRequests += 1;
  if (resetRequests > 5) {
    throw new CoachAuthError(
      'throttled',
      ['Request was throttled. Expected available in 3600 seconds.'],
      429,
    );
  }
  // Resolves for any address, account or not — see requestPasswordReset.
}

// ── set password ─────────────────────────────────────────────────────────────

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Django's four validators, close enough to produce the same messages. */
function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 8) {
    problems.push('This password is too short. It must contain at least 8 characters.');
  }
  if (['password', 'password1', '12345678', 'qwertyuiop', 'letmein1'].includes(password.toLowerCase())) {
    problems.push('This password is too common.');
  }
  if (/^\d+$/.test(password)) problems.push('This password is entirely numeric.');
  return problems;
}

export async function mockSetPassword(
  token: string,
  password: string,
): Promise<CoachSession & { via: 'invite' | 'reset' }> {
  await wait();

  if (!token) throw new CoachAuthError('token_invalid', ['This link is missing its token.'], 400);
  if (!password) throw new CoachAuthError('password_invalid', ['Choose a password.'], 400);

  const isReset = token.startsWith('r.');

  if (isReset) {
    if (token !== MOCK_LINK_TOKENS.reset) {
      throw new CoachAuthError(
        'reset_invalid',
        ['This reset link has expired or has already been used. Request a new one.'],
        400,
      );
    }
  } else {
    if (!UUID.test(token)) throw new CoachAuthError('token_invalid', ["This link isn't valid."], 400);

    // State is checked before the password, as the real view does: a dead
    // link should say it is dead, not complain about the password first.
    if (token === MOCK_LINK_TOKENS.inviteUsed) {
      throw new CoachAuthError(
        'invite_already_accepted',
        ['This invitation has already been used. Sign in instead.'],
        400,
      );
    }
    if (token === MOCK_LINK_TOKENS.inviteExpired) {
      throw new CoachAuthError(
        'invite_expired',
        ['This invitation has expired. Ask the person who invited you to send a new one.'],
        400,
      );
    }
    if (token === MOCK_LINK_TOKENS.inviteForwarded) {
      throw new CoachAuthError(
        'invite_email_mismatch',
        ['The email address of the user redeeming the invite must match the address where the invite was sent.'],
        400,
      );
    }
    if (token !== MOCK_LINK_TOKENS.invite) {
      throw new CoachAuthError('token_invalid', ["This link isn't valid."], 400);
    }
  }

  const problems = passwordProblems(password);
  if (problems.length) throw new CoachAuthError('password_invalid', problems, 400);

  // Success signs the coach in, exactly as the real endpoint does.
  return {
    token: 'mock-coach-token',
    expiry: expiry(),
    email: isReset ? MOCK_COACH_EMAIL : 'new.coach@northgate.edu',
    displayName: isReset ? 'Dana Whitfield' : 'new.coach@northgate.edu',
    via: isReset ? 'reset' : 'invite',
  };
}
