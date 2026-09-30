/**
 * Refusals from the coach credential endpoints, as the API names them (SKI-213).
 *
 * The backend gives every refusal a code on purpose: the set-password screen
 * shows a different next step for each (marketplace PR #71). An expired invite
 * needs a new one from the admin, a used one means "sign in instead", a
 * mismatched address means the link was forwarded. Collapsing them into one
 * message — which is what the mock did before this file existed — leaves a
 * coach guessing which of those applies to them.
 *
 * Kept in its own module so the mock and the real client can both throw it
 * without importing each other.
 */

export type CoachAuthErrorCode =
  /** Login: wrong address or password. Deliberately not told apart. */
  | 'credentials_invalid'
  /** Login: a correct password, on an account that coaches nothing. */
  | 'not_a_coach'
  /** Set-password: malformed, unknown, or missing token. */
  | 'token_invalid'
  | 'invite_expired'
  | 'invite_already_accepted'
  /** The invite was redeemed from a different address — likely forwarded. */
  | 'invite_email_mismatch'
  /** Already a member of the organisation; refused rather than re-roled. */
  | 'invite_already_member'
  /** One answer for malformed, tampered, used and expired reset links. */
  | 'reset_invalid'
  /** Django's password validators; may carry several messages. */
  | 'password_invalid'
  | 'invalid_email'
  /** HTTP 429 — login and set-password 20/min per IP, reset 5/hour. */
  | 'throttled'
  | 'unknown';

const KNOWN: ReadonlySet<string> = new Set([
  'credentials_invalid',
  'not_a_coach',
  'token_invalid',
  'invite_expired',
  'invite_already_accepted',
  'invite_email_mismatch',
  'invite_already_member',
  'reset_invalid',
  'password_invalid',
  'invalid_email',
]);

export class CoachAuthError extends Error {
  code: CoachAuthErrorCode;
  /** Every message the server sent, in order — password rules can fail together. */
  messages: string[];
  status: number;

  constructor(code: CoachAuthErrorCode, messages: string[], status: number) {
    super(messages[0] ?? 'Something went wrong.');
    this.name = 'CoachAuthError';
    this.code = code;
    this.messages = messages;
    this.status = status;
  }
}

/**
 * Turn an error response into a `CoachAuthError`.
 *
 * Three body shapes arrive here, because three different layers can refuse:
 *
 * - `{code, detail: [...]}` — the coach auth views;
 * - `{errors: [...]}` — the older `users/api/auth/login/` serializer;
 * - `{detail: "Request was throttled…"}` — DRF's throttle, on any of them.
 */
export async function readAuthError(response: Response): Promise<CoachAuthError> {
  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // A proxy error page is not JSON; the status still says enough.
  }

  if (response.status === 429) {
    const detail = typeof body?.detail === 'string' ? body.detail : null;
    return new CoachAuthError('throttled', detail ? [detail] : ['Too many attempts.'], 429);
  }

  const detail: string[] = Array.isArray(body?.detail)
    ? body.detail
    : typeof body?.detail === 'string'
      ? [body.detail]
      : [];

  if (typeof body?.code === 'string') {
    const code = (KNOWN.has(body.code) ? body.code : 'unknown') as CoachAuthErrorCode;
    return new CoachAuthError(code, detail, response.status);
  }

  if (body?.errors) {
    const errors: string[] = Array.isArray(body.errors) ? body.errors : [String(body.errors)];
    return new CoachAuthError('credentials_invalid', errors, response.status);
  }

  return new CoachAuthError(
    'unknown',
    detail.length ? detail : [`Request failed (${response.status}).`],
    response.status,
  );
}
