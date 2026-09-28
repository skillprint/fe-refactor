/**
 * Sign in with Google, resolved by the backend (SKI-264).
 *
 * The portal keeps a player's identity as an opaque `userId` in localStorage
 * and trades it, with the site's public API key, for a token. That makes the
 * `userId` a credential, so it must never be the Google `sub`, which is not
 * secret. Instead Google's ID token (the `credential` from its sign-in
 * button) goes to `POST /api/portal/auth/google/`, sent as this browser's
 * current guest. The backend verifies it and answers with the account the
 * Google sign-in means: this guest, an account linked on another device, or
 * a new one. The browser then adopts that account's `internalId`.
 */
import { LogLevel, SkillprintClient } from '../../../app/lib/skillprintSdk';
import { getApiBaseUrl } from '../../../app/utils/cookieUtils';
import { portalFetch } from './portalFetch';
import { forgetToken, sharedToken } from './sharedToken';

export interface GoogleSignInResult {
  outcome: 'linked' | 'signed_in' | 'created';
  token: string;
  expiry: string | null;
  userId: number;
  internalId: string;
  email: string | null;
  firstName: string;
}

/** The guest this browser is now, creating one if it has never played. */
async function currentGuestToken(): Promise<string> {
  let guestId = localStorage.getItem('userId');
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem('userId', guestId);
  }
  const client = new SkillprintClient({
    apiKey: process.env.NEXT_PUBLIC_API_KEY || 'test-api-key',
    baseUrl: getApiBaseUrl(),
    logger: (msg, level) => {
      if (level === LogLevel.ERROR) console.error(`[Skillprint SDK] ${msg}`);
    },
  });
  const identity = `guest:${guestId}`;
  const token = await sharedToken(identity, () => client.createOrGetUserToken(guestId as string));
  if (!token) {
    forgetToken(identity);
    throw new Error('Could not start a guest session.');
  }
  return token;
}

export async function signInWithGoogle(credential: string): Promise<GoogleSignInResult> {
  const guestToken = await currentGuestToken();
  return portalFetch<GoogleSignInResult>('/auth/google/', guestToken, {
    method: 'POST',
    body: JSON.stringify({ idToken: credential }),
  });
}

/**
 * The picture in a Google ID token, for display only. The token is verified by
 * the backend; nothing here is trusted for identity.
 */
export function googlePicture(credential: string): string | undefined {
  try {
    const payload = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=')));
    return typeof claims.picture === 'string' ? claims.picture : undefined;
  } catch {
    return undefined;
  }
}
