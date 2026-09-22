/**
 * Mock coach credentials (SKI-213), retired alongside the rest by SKI-252.
 *
 * Deliberately not "any password works". A sign-in screen that cannot fail
 * teaches nothing, and the error path is the one a real coach hits first — a
 * typo'd password on a phone keyboard. So there is one known account and
 * everything else is rejected the way the API rejects it.
 */
import { CoachApiError } from '../coachFetch';
import type { CoachSession } from '../coachAuth';

/** The sandbox account. Printed on the sign-in screen while mocks are on. */
export const MOCK_COACH_EMAIL = 'coach@northgate.edu';
export const MOCK_COACH_PASSWORD = 'playvs';

const LATENCY_MS = 420;

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

export async function mockCoachLogin(email: string, password: string): Promise<CoachSession> {
  await wait();

  const normalised = email.trim().toLowerCase();
  if (normalised !== MOCK_COACH_EMAIL || password !== MOCK_COACH_PASSWORD) {
    // Same message for a wrong address and a wrong password: which of the two
    // was wrong is not something an anonymous caller should be able to learn.
    throw new CoachApiError(400, 'Those credentials were not recognised.', {
      errors: 'Unable to log in with provided credentials.',
    });
  }

  return {
    token: 'mock-coach-token',
    // Eight hours, so the expiry branch in readCoachSession is exercised by
    // something other than a hand-edited localStorage entry.
    expiry: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    email: MOCK_COACH_EMAIL,
    displayName: 'Dana Whitfield',
  };
}

export async function mockRequestPasswordReset(_email: string): Promise<void> {
  await wait();
  // Resolves for any address, including ones with no account — see the note on
  // requestPasswordReset. Nothing is sent; the screen says what would happen.
}

export async function mockSetPassword(token: string, password: string): Promise<void> {
  await wait();

  if (!token) {
    throw new CoachApiError(400, 'This link is missing its token.', {
      token: ['This field is required.'],
    });
  }
  // The one token the fixtures accept, so the invalid-link branch is reachable.
  if (token !== 'mock-invite-token') {
    throw new CoachApiError(400, 'This link has expired or has already been used.', {
      token: ['Invalid or expired token.'],
    });
  }
  if (password.length < 8) {
    throw new CoachApiError(400, 'That password is too short.', {
      password: ['Must be at least 8 characters.'],
    });
  }
}
